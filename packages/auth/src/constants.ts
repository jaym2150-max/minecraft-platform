/**
 * Shared cookie name for the auth session. API and web MUST import from here
 * so a future rename (eg. `__Host-mcp-auth`) is a single-file change.
 *
 * The API sets this cookie at the top-level path `/` with `httpOnly`,
 * `sameSite=lax`, and `secure` in production. The Next.js middleware reads
 * the same name to gate private routes.
 *
 * C49 (AUDIT.md): in production the cookie is published as
 * `__Host-mcp-auth` (the `__Host-` prefix mandates `Secure` + `Path=/`,
 * which the API already pins — see `apps/api/src/common/auth-cookie.ts`).
 * In dev over http:// the prefix is unenforceable (browsers drop `__Host-`
 * without `Secure`), so the name reverts to a plain label so the cookie
 * still arrives on localhost. Mirrors `apps/api/src/common/auth-cookie.ts`
 * exactly — keep these two in sync.
 */
export const AUTH_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-mcp-auth' : 'token';

/**
 * Storage key the AuthContext uses to mirror the user object in localStorage.
 * Cookie-only auth — the token never lives in localStorage — but the user
 * profile is convenient on the client for offline rendering. The middleware
 * does NOT depend on this key.
 */
export const AUTH_USER_STORAGE_KEY = 'mcp_auth_user';

/**
 * Public / guest-visible paths used by the web middleware. Anything not
 * matched here requires the AUTH_COOKIE_NAME cookie to be present.
 */
export const DEFAULT_PUBLIC_PATHS: readonly string[] = [
  '/',
  '/mods',
  '/mod',
  '/collections',
  '/auth',
  '/user',
  '/about',
  '/docs',
  '/faq',
  '/legal',
  '/pricing',
  '/contact',
  // SEO endpoints must be crawlable without a session
  '/sitemap.xml',
  '/robots.txt',
  // Dynamic OG image — social crawlers must not be auth-gated
  '/og',
];
