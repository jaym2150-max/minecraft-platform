import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/mods', '/mod', '/auth/login', '/auth/register', '/auth/forgot-password', '/user'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // In a real app, you would check for a valid session/token here
  // const token = request.cookies.get('session')?.value;

  if (!isPublic) {
    // For now, just passing through - auth will be implemented later
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
