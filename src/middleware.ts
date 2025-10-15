// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/admin', '/chat'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPage = ['/login', '/register'].some(path => pathname.startsWith(path));

  // If user is authenticated and visits login/register, redirect to dashboard
  if (accessToken && isAuthPage) {
    const decoded = verifyAccessToken(accessToken);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If accessing protected route without access token, redirect to login
  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If access token exists but is invalid, clear it
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      return response;
    }

    // Optional: pass user context to API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/chat/:path*',
    '/login',
    '/register',
  ],
};