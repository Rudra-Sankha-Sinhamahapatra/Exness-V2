import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/portfolio',
  '/markets',
  '/history',
  '/settings',
];

const authRoutes = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  const authToken = request.cookies.get('authToken')?.value;
  const isAuthenticated = !!authToken;

  if (protectedRoutes.some(route => currentPath.startsWith(route)) && !isAuthenticated) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('from', currentPath);
    return NextResponse.redirect(url);
  }

  if (authRoutes.includes(currentPath) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
