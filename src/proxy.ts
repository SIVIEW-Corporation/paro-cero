import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tabPaths } from './constants/tab-paths';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = tabPaths.some((p) => pathname.startsWith(p));
  const isAuthRoute = pathname === '/login';
  const isRoot = pathname === '/';

  if (isRoot) {
    return NextResponse.redirect(
      new URL(token ? '/dashboard' : '/login', request.url),
    );
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthRoute) {
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
