// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const protectedPaths = ['/dashboard', '/admin', '/chat'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  // Define auth pages (login, register, etc.)
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.some(path => pathname.startsWith(path));
  
  // Case 1: Authenticated user trying to access auth pages (login/register)
  // Redirect them to dashboard
  if (token && isAuthPage) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Case 2: Unauthenticated user trying to access protected routes
  // Redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Case 3: Token exists, verify it
  if (token) {
    const decoded = verifyAccessToken(token);
    
    // Invalid token - clear it and redirect to login if on protected route
    if (!decoded) {
      const response = isProtected 
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();
      
      response.cookies.delete('access_token');
      return response;
    }
    
    // Valid token - add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // Case 4: No token, not protected route - allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/chat/:path*', 
    '/login',
    '/register',
    '/api/:path*'
  ],
};