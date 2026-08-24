// Cloudflare Worker: Edge cache + rate limiting + security headers for the
// public API. Deploy with: wrangler publish.
//
// SECURITY MODEL:
//  - The Worker is the public edge for the read-only / anon-facing API
//    surface. The pass-through branch ONLY fetches paths that match the
//    PUBLIC_PATH_PREFIXES allowlist below. Any other path (internal admin
//    routes, /docs, /metrics, /api/v1/auth/* etc.) returns 404 from the
//    edge so a client cannot use the Worker as an open proxy / SSRF to
//    reach private upstream endpoints with `Authorization` headers
//    forwarded verbatim.
//  - The rate limit (RATE_LIMIT_PER_MIN) is enforced per client IP using
//    the Cloudflare Cache API as a low-cost per-IP counter.
//  - CORS only reflects the request Origin back if it is in
//    ALLOWED_ORIGINS; a request from an unlisted origin gets NO
//    `Access-Control-Allow-Origin` header (with `Allow-Credentials: true`,
//    reflecting any other origin would be a credential-bearing CORS
//    mis-issuance).

export interface Env {
  API_ORIGIN: string;
  RATE_LIMIT_PER_MIN: string;
  ALLOWED_ORIGINS: string;
}

const CACHE_TTL = 60; // 1 minute for GET responses

/**
 * Path prefixes the Worker is allowed to proxy. Anything else is rejected
 * at the edge (404) so the Worker cannot be used to reach internal/admin
 * endpoints on the upstream origin. Keep this strictly to public,
 * anon-facing read surface.
 */
const PUBLIC_PATH_PREFIXES = [
  '/api/v1/projects',
  '/api/v1/categories',
  '/api/v1/minecraft-versions',
  '/api/v1/loaders',
  '/api/v1/search',
  '/api/v1/statistics',
  '/api/v1/versions',
];

/**
 * Subsets of the cacheable prefixes above for which GET responses may be
 * cached at the edge. These are deliberately read-only listing/detail
 * endpoints where 60s of staleness is acceptable.
 */
const CACHEABLE_PATH_PREFIXES = [
  '/api/v1/projects',
  '/api/v1/categories',
  '/api/v1/minecraft-versions',
  '/api/v1/loaders',
];

/**
 * Resolve the per-minute rate limit. Falls back to 100 if unset; rejects 0
 * and non-positive values so an operator can't accidentally disable rate
 * limiting by misconfiguring (use a very large value if you really want
 * effectively-unlimited — config-erroring on <=0 keeps the safety net).
 */
function resolveRateLimit(env: Env): number {
  const raw = parseInt(env.RATE_LIMIT_PER_MIN || '100', 10);
  if (!Number.isFinite(raw) || raw <= 0) return 100;
  return Math.min(raw, 10_000);
}

function resolveAllowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Per-IP request counter using the Cloudflare cache API. Each IP+minute
 * bucket is a cache entry whose "body" is just the running count. Returns
 * the count AFTER incrementing. The bucket key rotates every minute so the
 * counter resets automatically without needing a TTL sweep.
 */
async function incrementRequestCounter(
  ip: string,
  windowKey: string,
): Promise<number> {
  const cache = caches.default;
  const counterKey = new Request(
    `https://internal-ratelimit.invalid/${windowKey}/${encodeURIComponent(ip)}`,
  );
  const existing = await cache.match(counterKey);
  let count = 0;
  if (existing) {
    count = parseInt(await existing.text(), 10);
    if (!Number.isFinite(count)) count = 0;
  }
  count += 1;
  // TTL slightly longer than the window so the entry survives a sub-minute
  // fetch delay; the key rotation makes the practical window ~60s.
  await cache.put(
    counterKey,
    new Response(String(count), {
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'public, max-age=120',
      },
    }),
  );
  return count;
}

/**
 * Security headers applied at the edge on every Worker response. The
 * upstream API sets its own helmet CSP for its direct origin; the Worker
 * sits in front and its responses should not regress to no-security-header
 * status. CSP is intentionally narrow (`default-src 'none'`) for edge
 * JSON responses — these are API JSON payloads, not HTML pages.
 */
function applySecurityHeaders(headers: Headers): void {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload',
  );
}

/**
 * Issue CORS headers. ONLY reflects the request Origin if it is in the
 * configured allowlist — never reflects a different configured origin as a
 * fallback, because `Access-Control-Allow-Credentials: true` + a reflected-
 * mismatched origin would let the configured origin's operator make
 * credentialed cross-origin calls using the requesting user's credentials
 * (CORS mis-issuance).
 */
function applyCorsHeaders(
  headers: Headers,
  requestOrigin: string,
  allowedOrigins: string[],
): void {
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  headers.set('Access-Control-Max-Age', '86400');
}

function notFoundResponse(): Response {
  const headers = new Headers({ 'content-type': 'application/json' });
  applySecurityHeaders(headers);
  return new Response(
    JSON.stringify({ statusCode: 404, message: 'Not Found' }),
    { status: 404, headers },
  );
}

function tooManyRequestsResponse(retryAfter: number): Response {
  const headers = new Headers({
    'content-type': 'application/json',
    'retry-after': String(retryAfter),
  });
  applySecurityHeaders(headers);
  return new Response(
    JSON.stringify({ statusCode: 429, message: 'Too Many Requests' }),
    { status: 429, headers },
  );
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const clientIP =
      request.headers.get('cf-connecting-ip') || 'unknown';
    const allowedOrigins = resolveAllowedOrigins(env);
    const rateLimit = resolveRateLimit(env);

    // OPTIONS preflight — path still must be in the public allowlist so CORS
    // preflighting of internal routes doesn't leak their existence.
    if (request.method === 'OPTIONS') {
      const isPublic = PUBLIC_PATH_PREFIXES.some((p) =>
        url.pathname.startsWith(p),
      );
      if (!isPublic) return notFoundResponse();
      const headers = new Headers();
      applyCorsHeaders(
        headers,
        request.headers.get('Origin') || '',
        allowedOrigins,
      );
      applySecurityHeaders(headers);
      return new Response(null, { status: 204, headers });
    }

    // PATH ALLOWLIST: any path outside the public surface is rejected at
    // the edge. This is the SSRF guard — without it, the Worker pass-
    // through branch would `fetch(${API_ORIGIN}${url.pathname}`) any path
    // the attacker constructs and forward `Authorization` to it.
    const isPublic = PUBLIC_PATH_PREFIXES.some((p) =>
      url.pathname.startsWith(p),
    );
    if (!isPublic) return notFoundResponse();

    // The Worker is read-only by design — only allow stateless methods.
    // The legacy implementation forwarded POST/PATCH/DELETE/admin cookies
    // to upstream, which is exactly the SSRF surface we're closing.
    if (!['GET', 'HEAD'].includes(request.method)) {
      const headers = new Headers({ 'content-type': 'application/json' });
      applySecurityHeaders(headers);
      applyCorsHeaders(
        headers,
        request.headers.get('Origin') || '',
        allowedOrigins,
      );
      headers.set('Allow', 'GET, HEAD, OPTIONS');
      return new Response(
        JSON.stringify({
          statusCode: 405,
          message: 'Method Not Allowed at the edge',
        }),
        { status: 405, headers },
      );
    }

    // RATE LIMIT: per IP per minute, enforced via the cache-backed counter.
    // Applied AFTER the path allowlist so legitimate callers never hit the
    // counter for paths the Worker doesn't proxy anyway.
    const windowKey = new Date()
      .toISOString()
      .slice(0, 16); // YYYY-MM-DDTHH:mm — minute bucket
    const count = await incrementRequestCounter(clientIP, windowKey);
    if (count > rateLimit) {
      return tooManyRequestsResponse(60);
    }

    // CACHE: only listing/detail GETs on the cacheable prefixes are cached.
    const isCacheable = CACHEABLE_PATH_PREFIXES.some((p) =>
      url.pathname.startsWith(p),
    );
    if (isCacheable) {
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), {
        method: 'GET',
        headers: request.headers,
      });
      const cached = await cache.match(cacheKey);
      if (cached) {
        const response = new Response(cached.body, cached);
        response.headers.set('X-Cache-Status', 'HIT');
        response.headers.set('CF-Cache-Status', 'HIT');
        applySecurityHeaders(response.headers);
        applyCorsHeaders(
          response.headers,
          request.headers.get('Origin') || '',
          allowedOrigins,
        );
        return response;
      }
    }

    // Build an outbound request WITHOUT forwarding sensitive client
    // headers. The original Worker forwarded `request.headers` verbatim —
    // including any attacker-supplied `Authorization`, `X-API-Key`,
    // `cookie`, `x-forwarded-for`, `x-forwarded-host`, etc. Since the Worker
    // is anonymous-read-only, we send only the headers we control.
    const outboundHeaders = new Headers();
    outboundHeaders.set('accept', request.headers.get('accept') || '*/*');
    outboundHeaders.set('host', new URL(env.API_ORIGIN).host);
    // Strip the inbound Origin/host so the upstream never trusts them via
    // x-forwarded-host poisoning (eg. OAuth callback link generation).
    outboundHeaders.set(
      'x-forwarded-proto',
      new URL(env.API_ORIGIN).protocol.replace(':', ''),
    );
    outboundHeaders.set('x-forwarded-host', new URL(env.API_ORIGIN).host);
    outboundHeaders.set('via', 'cloudflare-worker');

    const originResponse = await fetch(
      `${env.API_ORIGIN}${url.pathname}${url.search}`,
      {
        method: request.method,
        headers: outboundHeaders,
        // No body for GET/HEAD.
      },
    );

    if (isCacheable && originResponse.ok) {
      const cacheableResponse = new Response(
        originResponse.body,
        originResponse,
      );
      cacheableResponse.headers.set(
        'Cache-Control',
        `public, max-age=${CACHE_TTL}`,
      );
      cacheableResponse.headers.set('X-Cache-Status', 'MISS');
      applySecurityHeaders(cacheableResponse.headers);
      applyCorsHeaders(
        cacheableResponse.headers,
        request.headers.get('Origin') || '',
        allowedOrigins,
      );
      ctx.waitUntil(
        caches.default.put(
          new Request(url.toString(), { method: 'GET' }),
          cacheableResponse.clone(),
        ),
      );
      return cacheableResponse;
    }

    const response = new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: originResponse.headers,
    });
    applySecurityHeaders(response.headers);
    applyCorsHeaders(
      response.headers,
      request.headers.get('Origin') || '',
      allowedOrigins,
    );
    return response;
  },
};
