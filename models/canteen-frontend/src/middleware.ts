import { type NextRequest, NextResponse } from 'next/server';
 
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('next-auth.session-token');

  // Public paths that don't require auth
  const publicPaths = ['/', '/login', '/register', '/api/auth'];
  
  if (!token && !publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}