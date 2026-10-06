import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedPath } from './constants/protected-paths';
import { isAccessTokenValid } from './lib/session-token';

const ACCESS_TOKEN_COOKIE = 'access_token';

export function proxy(request: NextRequest) {
  const rawToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  // An expired or malformed access token counts as no session.
  const token = isAccessTokenValid(rawToken, Date.now()) ? rawToken : undefined;
  const { pathname, searchParams } = request.nextUrl;

  const isProtectedRoute = isProtectedPath(pathname);
  const isAuthRoute = pathname === '/login';
  const isLandingRoute = pathname === '/';
  const hasLandingBypass = searchParams.get('landing') === '1';

  if (!token && isProtectedRoute && !isAuthRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (rawToken)
      response.cookies.delete({ name: ACCESS_TOKEN_COOKIE, path: '/' });
    return response;
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && isLandingRoute && !hasLandingBypass) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Inyección del Token para el Backend. Clonando los headers y agregando el JWT para que las rutas upstream lo reciban
  const requestHeaders = new Headers(request.headers);
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  // Retornamos la respuesta permitiendo que los headers modificados suban a la app
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
