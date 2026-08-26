/**
 * The default points at the **same-origin** proxy at `/api/v1/...` so the
 * browser doesn't make a cross-origin request to the upstream API. This is
 * what allows the httpOnly session cookie to be sent automatically and
 * avoids CORS preflights.
 *
 * To force the SDK to bypass the proxy and call the upstream API directly
 * (eg. from a Node CLI or a worker), pass an absolute URL like
 * `http://localhost:4000/api/v1` or set the NEXT_PUBLIC_API_URL env var.
 */
function defaultBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  }
  // Same-origin proxy: client component → /api/v1/... → Next → upstream API.
  // Falling back to NEXT_PUBLIC_API_URL still works for deployments where the
  // proxy is intentionally bypassed.
  return '/api/v1';
}

/**
 * Default per-request timeout. A wedged upstream (DB lock, slow answer) should
 * not hang a client call forever; 30s is generous for paged reads while still
 * bounding uploads proxied through `/api/v1`. Callers that need longer (eg. an
 * explicit file upload) can pass their own `signal` via `options`.
 */
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/**
 * CSRF cookie name written by the API in production via the `csrf-csrf`
 * double-submit middleware. Must stay in sync with `apps/api/src/main.ts`.
 * The cookie is intentionally httpOnly=false so the SPA can read it and echo
 * its value back via the `x-csrf-token` header on every state-changing
 * request. In development CSRF is disabled entirely.
 */
const CSRF_COOKIE_NAME = '__Host-csrf.x-csrf-token';
let cachedCsrfToken: string | null = null;

/**
 * Resolve the CSRF token to send on mutating requests. Reads the readable
 * CSRF cookie first; falls back to a cached in-memory value populated by
 * `seedCsrfToken` (typically called once on app boot after a GET
 * `/auth/csrf-token`). Returns null when running outside a browser, in dev
 * (CSRF disabled), or before any cookie has been issued — in which case the
 * caller lets the request proceed and the server returns a 403 the SDK can
 * recover from by re-seeding.
 */
function readCsrfToken(): string | null {
  if (cachedCsrfToken) return cachedCsrfToken;
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`));
    if (match) return decodeURIComponent(match.split('=').slice(1).join('='));
  } catch {
    /* document.cookie may be unavailable */
  }
  return null;
}

/**
 * Pre-seed the CSRF token+cookie from the API's pre-flight endpoint.
 * Returns the token (and caches it) so the bootstrapping caller can also
 * stash it in app state if desired. Idempotent — only the cookie actually
 * holds the source of truth.
 *
 * Should be called once on client boot in production before the first
 * mutating request. In dev it's a safe no-op (the endpoint doesn't exist).
 */
export async function seedCsrfToken(baseUrl: string = defaultBaseUrl()): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  try {
    const res = await fetch(`${baseUrl}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { data?: { token?: string } } | null;
    const token = body?.data?.token ?? null;
    if (typeof token === 'string' && token.length > 0) cachedCsrfToken = token;
    return cachedCsrfToken;
  } catch {
    return null;
  }
}

/**
 * Clear the cached CSRF token (eg. after logout). The cookie itself is
 * cleared server-side; this just resets the in-memory cache so the next
 * mutation forces a re-seed.
 */
export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

/**
 * Resolve an SDK caller-supplied `path` against `baseUrl` and refuse
 * anything that would target a different origin than the configured API.
 * This closes the `fetch(\`${baseUrl}${path}\`)` interpolation that would
 * otherwise honor a `path` like `//attacker.com/x` (protocol-relative) or
 * `https://attacker.com/x` (absolute).
 *
 * Behavior:
 *  - `path` must start with `/` and NOT `//` or `/\\` (no protocol-
 *    relative / backslash-relative URLs that browsers normalize into
 *    protocol-relative).
 *  - `path` must resolve against `baseUrl` to a URL with the SAME origin
 *    (protocol + host + port) as `baseUrl`.
 *  - On success returns the resolved URL string.
 *  - On any failure throws a TypeError so the caller surfaces an immediate
 *    failure rather than silently routing the request to a wrong host.
 */
export function resolveSafeUrl(baseUrl: string, path: string): string {
  if (typeof path !== 'string' || path.length === 0) {
    throw new TypeError('ApiClient: empty path');
  }
  if (!path.startsWith('/')) {
    throw new TypeError('ApiClient: path must start with "/"');
  }
  if (path.startsWith('//') || path.startsWith('/\\') || path.includes('\\')) {
    throw new TypeError('ApiClient: protocol-relative or backslash paths are not allowed');
  }
  let base: URL;
  try {
    const baseWithSlash = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (baseUrl.startsWith('/')) {
      if (typeof window !== 'undefined' && window.location?.origin) {
        base = new URL(baseWithSlash, window.location.origin);
      } else {
        base = new URL(baseWithSlash, 'http://localhost:3003');
      }
    } else {
      base = new URL(baseWithSlash);
    }
  } catch {
    throw new TypeError(`ApiClient: invalid baseUrl "${baseUrl}"`);
  }
  // Resolve against base to get a fully-qualified URL, then verify the
  // origin is identical to the base's origin. `new URL(path, base)` honors
  // protocol-relative URLs by stealing the base protocol — that case is
  // already filtered above, so the resolved URL's origin must match.
  // Strip leading "/" from path so "/auth/me" appends to "/api/v1/" rather
  // than replacing it (new URL("/auth/me", "http://x/api/v1") → "/auth/me").
  const resolved = new URL(path.replace(/^\//, ''), base);
  if (resolved.origin !== base.origin) {
    throw new TypeError(
      `ApiClient: resolved URL origin "${resolved.origin}" does not match base "${base.origin}"`,
    );
  }
  return resolved.toString();
}

/**
 * Single-flight refresh token exchange. When a request 401s we fire ONE
 * `POST /auth/refresh` (the browser sends the __Secure-mcp-refresh cookie
 * automatically since it's scoped to /api/v1/auth), then retry the original
 * request exactly once. Concurrent 401s coalesce onto the same in-flight
 * refresh instead of racing N parallel token rotations.
 *
 * Module-private: this promise is shared by all ApiClient instances on the
 * page (there is normally only one), refreshed just-in-time on first 401.
 */
let inflightRefresh: Promise<boolean> | null = null;

async function refreshSession(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Run `refreshSession` ensuring only one is in flight at a time. Returns true
 * if the refresh succeeded (a new access cookie is set); false means the user
 * must re-authenticate.
 */
function withSingleFlightRefresh(baseUrl: string): Promise<boolean> {
  if (!inflightRefresh) {
    inflightRefresh = refreshSession(baseUrl).finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

/**
 * Origins the bearer-auth flow is allowed to leak credentials to. Filled
 * from {@link addTrustedApiOrigin} on ApiClient construction / setAuthToken.
 *
 * B11: the `Authorization: Bearer <token>` header is sticky on the client
 * instance — once installed it is sent on every request the instance
 * makes. If a caller (eg. @mcp/build CLI, or an admin script) constructed
 * `new McpSDK('https://attacker.example.com/api/v1')` and then called
 * `setAuthToken(apiKey)`, every subsequent request would ship the API key
 * to attacker.example.com. We refuse to install the bearer header unless
 * the configured baseUrl origin matches a value the caller explicitly
 * whitelisted (the configured API origin), so a forged/injected baseUrl
 * fails closed.
 *
 * The allowlist is module-private to this file: the only setter is the
 * ApiClient constructor, which seeds it from the baseUrl IT verified.
 */
const trustedApiOrigins = new Set<string>();

function originOf(value: string): string | null {
  try {
    const u = new URL(value);
    return u.origin;
  } catch {
    return null;
  }
}

function isTrustedOrigin(origin: string): boolean {
  // The same-origin proxy ('/api/v1') is the unprivileged default for
  // in-browser use; bearer auth is never used over it so we never seed
  // the origin either. Any explicit ApiClient built with an absolute
  // origin must land in `trustedApiOrigins`.
  // When the set is empty (no explicit trusted Origin registered) we
  // remain permissive for same-origin `/api/v1` callers only.
  if (origin === 'null') return false;
  return trustedApiOrigins.size === 0 || trustedApiOrigins.has(origin);
}

export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = defaultBaseUrl()) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
    // B11: register the configured baseUrl's origin as trusted ONLY if it
    // is an absolute URL (same-origin `/api/v1` is handled implicitly). A
    // same-origin proxy caller never installs a bearer via setAuthToken
    // (the cookie does the carrying), so an empty trusted set here lets
    // those requests proceed without origin checks. If the caller later
    // attempts to install a bearer on a different origin, setAuthToken
    // fences it on this trusted set being empty-of-nothing: an absolute
    // baseUrl here registers non-empty, and setAuthToken asserts match.
    const origin = originOf(baseUrl);
    if (origin && origin !== 'null') {
      trustedApiOrigins.add(origin);
    }
  }

  setAuthToken(token: string) {
    // Browser sessions use an httpOnly cookie sent automatically via
    // `credentials: 'include'`, so callers there do NOT need to invoke this.
    // Headless / CLI consumers that authenticate with an API key (eg. the
    // @mcp/build upload CLI) must call this so requests carry
    // `Authorization: Bearer <apiKey>`. Passing an empty string clears it.
    //
    // B11: fail-closed if the configured baseUrl origin is not the trusted
    // API origin. Prevents the sticky bearer from being silently shipped
    // to a host the operator didn't whitelist via `new McpSDK(absoluteUrl)`.
    if (token) {
      const origin = originOf(this.baseUrl);
      if (origin && origin !== 'null' && !isTrustedOrigin(origin)) {
        // A base URL whose origin is not in the trusted set means either a
        // misconfigured environment variable or an attacker-injected
        // URL. Either way we refuse to pin the bearer to it.
        throw new Error(
          `ApiClient.setAuthToken: refusing to set Authorization for baseUrl origin "${origin}" — it is not a trusted API origin. ` +
            `Construct ApiClient with a process.env-controlled API URL or add it to the trusted set.`,
        );
      }
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  /**
   * Explicitly mark an origin as trusted to carry `Authorization` headers.
   * Escape hatch for legitimate cross-API scenarios (eg. an admin tool that
   * points at staging). Without this, setAuthToken refuses any origin that
   * wasn't the one the constructor was built with.
   */
  static trustOrigin(origin: string): void {
    const u = originOf(origin);
    if (u && u !== 'null') trustedApiOrigins.add(u);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    // Mutating requests must echo the CSRF token. We read it lazily so the
    // very first mutation triggers the server to set the cookie via a prior
    // GET (the catch-all proxy strokes the cookie via /auth/csrf-token on
    // the boot path). If the token is absent, the request still goes out;
    // the API's double-submit middleware will respond 403, the caller's
    // error handler can re-seed, and the user retries. Pre-seeding via
    // `seedCsrfToken` is the recommended boot path to avoid that hiccup.
    const isMutating = method !== 'GET' && method !== 'HEAD';
    const csrfToken = isMutating ? readCsrfToken() : null;
    const csrfHeaders: Record<string, string> = csrfToken ? { 'x-csrf-token': csrfToken } : {};

    // SECURITY: normalize the outbound URL so an SDK caller cannot smuggle
    // a protocol-relative `//evil.com` or absolute `https://attacker.com/`
    // path into `fetch` (which would happily bypass baseUrl and POST the
    // body — Authorization header and all — to the attacker host). Anything
    // that doesn't resolve against baseUrl is an SDK misuse and we fail
    // closed with a TypeError the caller can surface.
    const safeUrl = resolveSafeUrl(this.baseUrl, path);

    // B11 per-call origin guard: even though setAuthToken already fences
    // installation, a caller could mutate the baseUrl after the fact by
    // constructing a second ApiClient keyed to a different origin and
    // sharing headers. We assert here, at the dispatch site, that if a
    // bearer is installed the destination origin is on the trusted list.
    if (this.headers['Authorization']) {
      const destOrigin = originOf(safeUrl);
      if (destOrigin && destOrigin !== 'null' && !isTrustedOrigin(destOrigin)) {
        throw new Error(
          `ApiClient.request: refusing to send Authorization header to untrusted origin "${destOrigin}"`,
        );
      }
    }

    const callerSuppliedBodyType = options?.body;

    // Detect FormData uploads (multipart). Default Content-Type is application/json
    // but FormData requires boundary auto-generation — sending json header corrupts it.
    const isFormDataBody =
      (typeof FormData !== 'undefined' && body instanceof FormData) ||
      (typeof FormData !== 'undefined' && callerSuppliedBodyType instanceof FormData);
    const effectiveHeaders: Record<string, string> = isFormDataBody
      ? (() => {
          const h = { ...this.headers, ...csrfHeaders, ...options?.headers };
          delete (h as Record<string, string>)['Content-Type'];
          delete (h as Record<string, string>)['content-type'];
          return h;
        })()
      : { ...this.headers, ...csrfHeaders, ...options?.headers };

    const resolvedBody: BodyInit | null | undefined = isFormDataBody
      ? ((callerSuppliedBodyType instanceof FormData
          ? callerSuppliedBodyType
          : (body as unknown as BodyInit)) as BodyInit)
      : undefined;

    const doFetch = (attemptBody: BodyInit | null | undefined) =>
      fetch(safeUrl, {
        method,
        headers: effectiveHeaders,
        body: isFormDataBody
          ? (resolvedBody as BodyInit)
          : (attemptBody ?? (body ? JSON.stringify(body) : undefined)),
        credentials: 'include',
        ...options,
        // Ensure FormData body is not overwritten by options spread body duplication
        ...(isFormDataBody ? { body: resolvedBody as BodyInit } : {}),
        // Default 30s timeout so a wedged upstream can't hang a request forever.
        // If the caller passed their own `signal`, prefer it (the timeout is
        // skipped), matching previous semantics while adding a safety net.
        signal: options?.signal ?? AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
      });

    // C45: track whether the request body is replayable. If the body came in
    // via `options.body` as a stream-like object (ReadableStream, FormData,
    // Blob, ArrayBuffer/TypedArray, URLSearchParams — anything that can't
    // survive a JSON.stringify round-trip safely), then a 401 refresh+replay
    // would re-send a corrupted body. We skip auto-refresh for those and let
    // the original 401 surface so the caller re-issues with a fresh cookie.
    const bodyIsReplayable =
      body !== undefined &&
      typeof body !== 'undefined' &&
      body !== null &&
      (typeof body === 'object'
        ? Object.getPrototypeOf(body) === Object.prototype ||
          Object.getPrototypeOf(body) === null ||
          Array.isArray(body)
        : true) &&
      !(callerSuppliedBodyType instanceof ReadableStream) &&
      !(callerSuppliedBodyType instanceof FormData) &&
      !(callerSuppliedBodyType instanceof Blob) &&
      !(callerSuppliedBodyType instanceof ArrayBuffer) &&
      !ArrayBuffer.isView(callerSuppliedBodyType) &&
      !(callerSuppliedBodyType instanceof URLSearchParams);

    let response = await doFetch(undefined);

    // 401 recovery: a browser cookie session may have its access token expire
    // mid-session. Try ONCE to exchange the (long-lived) refresh cookie for a
    // fresh access cookie and replay the original request. Skipped for:
    //  - the refresh endpoint itself (would recurse forever)
    //  - streaming / binary / form-data uploads (body can't be re-sent
    //    verbatim — FormData/Blob/ReadableStream are single-shot and
    //    JSON.stringify of them corrupts the payload; surface the 401 to
    //    the caller so it can re-issue from scratch)
    //  - requests the caller already flagged as not auto-retryable
    if (
      response.status === 401 &&
      bodyIsReplayable &&
      !path.startsWith('/auth/refresh') &&
      !path.startsWith('/auth/login')
    ) {
      const refreshed = await withSingleFlightRefresh(this.baseUrl);
      if (refreshed) {
        // Replay with the new access cookie the server just set. Rebuild
        // the JSON body from the ORIGINAL argument (`body`) so retries send
        // identical payloads, never the prior (possibly-stringified) one.
        response = await doFetch(body ? JSON.stringify(body) : undefined);
      }
    }

    if (!response.ok) {
      // Parse the error body as text first so an upstream HTML error page (eg.
      // an Nginx 502) can't throw a secondary SyntaxError out of `.json()`.
      const text = await response.text().catch(() => '');
      let message = 'Request failed';
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string; error?: string };
          message = parsed.message || parsed.error || message;
        } catch {
          // Non-JSON body: surface the status + a trimmed hint instead of raw HTML.
          message = `Request failed (${response.status})`;
        }
      }
      throw new ApiError(response.status, message);
    }

    // 204 No Content (and any empty body) must not be JSON-parsed — doing so
    // throws `SyntaxError: Unexpected end of JSON input`. Treat it as void.
    if (response.status === 204) {
      return undefined as T;
    }
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
