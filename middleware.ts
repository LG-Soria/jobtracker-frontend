import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';
const PUBLIC_PATHS = ['/', '/login'];
const PROTECTED_PREFIXES = ['/dashboard', '/applications'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isProtectedPath(pathname: string) {
  if (isPublicPath(pathname)) return false;
  return PROTECTED_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasAuthCookie = Boolean(req.cookies.get(AUTH_COOKIE));

  if (isPublicPath(pathname)) {
    if (hasAuthCookie && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !hasAuthCookie) {
    const loginUrl = new URL('/login', req.url);
    const redirectTarget = `${pathname}${search}`;
    loginUrl.searchParams.set('redirectTo', redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|static|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map)$).*)',
  ],
};
