import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const userRoutes = ['/reports', '/monitoring', '/education', '/profile', '/complaints'];

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Protect user routes (exact match)
  if (userRoutes.includes(path) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect ALL admin sub-routes (prefix match)
  if (path.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from auth pages
  if ((path === '/login' || path === '/register') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png).*)'],
};
