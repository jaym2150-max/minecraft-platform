import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, DEFAULT_PUBLIC_PATHS } from '@mcp/auth';

interface DecodedJwtPayload {
  exp?: number;
  role?: string;
  sub?: string;
}

/**
 * Decode a JWT's payload segment WITHOUT verifying the signature. This is
 * intentional: the web Edge runtime should not hold the JWT signing secret
 * (that would broaden the blast radius of a web-config leak). We use the
 * decoded claims only as a UX-level gate so SSR-rendered private/admin pages
 * are not delivered to clearly-unauthenticated users; the API remains the
 * authoritative authorizer and re-checks the signature + session on every call.
 */
function decodeJwt(token: string): DecodedJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    // atob is available in the Next.js Edge runtime.
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(json) as DecodedJwtPayload;
    return decoded && typeof decoded === 'object' ? decoded : null;
  } catch {
    return null;
  }
}

function isExpired(payload: DecodedJwtPayload): boolean {
  if (typeof payload.exp !== 'number') return true;
  // Allow a small clock-skew window (30s) so a token that legitimately expires
  // this second isn't treated as already-invalid.
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now - 30;
}

function redirect(request: NextRequest): NextResponse {
  const url = new URL('/auth/login', request.url);
  url.searchParams.set('callbackUrl', request.nextUrl.pathname + (request.nextUrl.search || ''));
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = DEFAULT_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  // A missing token is unambiguous: no session at all.
  if (!token) {
    return redirect(request);
  }

  // A present but malformed/expired token should not reach a private page.
  // Previously the middleware only checked the cookie existed, so a tampered
  // or long-expired cookie still rendered protected content server-side and a
  // forged `role:'OWNER'` reached the admin page until the client /auth/me.
  const payload = decodeJwt(token);
  if (!payload || isExpired(payload)) {
    return redirect(request);
  }

  const ADMIN_PATH = '/admin';
  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    // B14: the unsigned-decode admin gate is a UX-only signal — the JWT
    // payload is forgeable by anyone who sets a cookie. The API is still
    // the authoritative authorizer per-request, but bouncing here at the
    // edge avoids streaming the admin bundle to a non-admin. To close the
    // forgery gap (a tampered `role:'OWNER'` cookie would otherwise reach
    // `admin/page.tsx` and flash privileged UI until `/auth/me`), we verify
    // the session against the API's authoritative `/auth/me` for /admin
    // requests. This is server-side verification WITHOUT exposing the JWT
    // signing secret to the web Edge runtime (the API re-signs every call).
    // On any failure or non-admin role we redirect home (NOT login) so we
    // don't reveal whether the cookie was forged vs. expired.
    return verifyAdminAtEdge(request, token);
  }

  return NextResponse.next();
}

/**
 * Per-request server-side verification for the admin subpath. Forwards the
 * auth cookie to the API's authoritative `/auth/me` (same-network call; the
 * web tier in compose/k8s shares the backend network with the API) and
 * inspects the returned `role`. Falls closed (redirect home) on any error.
 *
 * This call happens only for `/admin(.*)`; the matcher already excludes
 * `/_next/static`, `/api`, etc., so the per-request overhead only applies
 * on the gated admin surface where it actually matters.
 */
async function verifyAdminAtEdge(request: NextRequest, token: string): Promise<NextResponse> {
  const homeUrl = new URL('/', request.url);
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${token}`,
        'Content-Type': 'application/json',
      },
      // Never cache the verification result — a stale admin/clear decision
      // could let a demoted user keep edge access for the cache TTL.
      cache: 'no-store',
    });
    if (!response.ok) {
      const res = NextResponse.redirect(homeUrl);
      res.cookies.delete(AUTH_COOKIE_NAME);
      return res;
    }
    const body = (await response.json()) as { data?: { role?: string } };
    const role = body?.data?.role;
    if (role === 'ADMIN' || role === 'OWNER') {
      return NextResponse.next();
    }
    const res = NextResponse.redirect(homeUrl);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  } catch {
    // Network blip / 5xx from the API — fail closed rather than risk letting
    // a forged role slip past because the verifier couldn't reply.
    const res = NextResponse.redirect(homeUrl);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
