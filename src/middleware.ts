// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/admin', '/chat'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = ['/login', '/register'].some((path) => pathname.startsWith(path));

  // Try to decode token once
  const decoded = accessToken ? verifyAccessToken(accessToken) : null;

  // If user is authenticated and visits login/register, redirect to dashboard
  if (decoded && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing protected route without a valid token, redirect to login
  if (isProtected && !decoded) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear potentially invalid tokens
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // If access token exists and is valid, attach user info to headers
  if (decoded) {
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