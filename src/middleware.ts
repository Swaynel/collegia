// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/admin', '/chat'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPage = ['/login', '/register'].some(path => pathname.startsWith(path));

  // Authenticated user on auth page → redirect to dashboard
  if (accessToken && isAuthPage) {
    const decoded = verifyAccessToken(accessToken);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protected route with no access token
  if (isProtected && !accessToken) {
    if (refreshToken) {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      if (decodedRefresh?.userId) {
        try {
          await connectDB();
          const user = await User.findById(decodedRefresh.userId);
          if (user) {
            const newAccessToken = generateAccessToken({
              userId: user._id.toString(),
              email: user.email,
              role: user.role,
              subscription: user.subscription,
            });

            const response = NextResponse.next();
            response.cookies.set('access_token', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 15 * 60,
            });
            return response;
          }
        } catch (error) {
          console.error('Middleware token refresh error:', error);
        }
      }

      // Refresh failed → clear tokens and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('refresh_token');
      return response;
    }

    // No refresh token → force login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate access token if present
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      const response = isProtected
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();
      response.cookies.delete('access_token');
      return response;
    }

    // Optional: pass user info to API routes via headers
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