import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/admin/login', '/admin/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', process.env.WEB_URL || 'http://localhost:3003');
    loginUrl.searchParams.set('callbackUrl', '/admin/dashboard');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: {
        Cookie: `token=${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const loginUrl = new URL('/auth/login', process.env.WEB_URL || 'http://localhost:3003');
      loginUrl.searchParams.set('callbackUrl', '/admin/dashboard');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('token');
      return res;
    }

    const data = await response.json();
    const user = data?.data;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      const webUrl = process.env.WEB_URL || 'http://localhost:3003';
      const res = NextResponse.redirect(new URL('/', webUrl));
      res.cookies.delete('token');
      return res;
    }
  } catch {
    const loginUrl = new URL('/auth/login', process.env.WEB_URL || 'http://localhost:3003');
    loginUrl.searchParams.set('callbackUrl', '/admin/dashboard');
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('token');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|admin/login).*)'],
};
