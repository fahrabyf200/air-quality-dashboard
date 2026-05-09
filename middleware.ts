import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/', '/reports', '/monitoring', '/education', '/profile'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  if (protectedRoutes.includes(path) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((path === '/login' || path === '/register') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png).*)'],
};
