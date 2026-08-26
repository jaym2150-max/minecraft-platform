/**
 * Cookie name used by the API for the auth session.
 *
 * Mirrored on the web side at `packages/auth/src/constants.ts` (re-exported
 * as `AUTH_COOKIE_NAME` from `@mcp/auth`). Update both when renaming.
 *
 * C49 (AUDIT.md): the previous plain `token` name had no `__Host-` prefix,
 * so a subdomain XSS / CNAME-subdomain takeover could plant a phishing
 * `token` cookie that the browser would ship ahead of the real one. The
 * `__Host-` cookie prefix mandates `Secure` + `Path=/` + no `Domain`,
 * which the access cookie already satisfies (httpOnly, path '/',
 * SameSite=Lax, secure in prod) — so in production we publish the cookie
 * as `__Host-mcp-auth`. In dev (http://localhost) the prefix is
 * unenforceable (browsers drop `__Host-` cookies set without `Secure`), so
 * the name reverts to a plain label so the cookie still arrives over
 * plaintext. The web side reads `AUTH_COOKIE_NAME` (imported from
 * `@mcp/auth`) so the matching probe name resolves per-environment there
 * too. The api-client cookie-name probe (`AUTH_COOKIE_NAME` consumer in
 * packages/auth) picks up the same `process.env.NODE_ENV` branch.
 */
export const AUTH_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-mcp-auth' : 'token';

/**
 * Cookie name for the long-lived refresh token. Kept SEPARATE from the
 * access-token cookie so it can use a stricter posture: scoped to the auth
 * refresh path only, never sent on regular API calls. This bounds the
 * exposure window if a malicious sub-path / extension reads document.cookie.
 *
 * The attribute flags (httpOnly, secure, sameSite, path) are set by the
 * controller at issue time; only the name is shared here so the web proxy /
 * middleware can clear it on logout.
 *
 * `__Secure-` (not `__Host-`) because the cookie is intentionally scoped to
 * `/api/v1/auth` — `__Host-` mandates `Path=/`, which would defeat the
 * path-scope goal.
 */
export const REFRESH_COOKIE_NAME = '__Secure-mcp-refresh';
