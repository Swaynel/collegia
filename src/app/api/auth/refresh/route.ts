// app/api/auth/refresh/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    console.log('[Refresh] Starting token refresh');

    // Log incoming Cookie header to help debug missing cookies
    try {
      const rawCookies = req.headers.get('cookie');
      console.log('[Refresh] Incoming Cookie header:', rawCookies);
    } catch (e) {
      console.log('[Refresh] Failed to read Cookie header:', e);
    }

    const refreshToken = req.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      console.log('[Refresh] No refresh token found');
      return NextResponse.json({ error: 'Refresh token required' }, { status: 401 });
    }

    console.log('[Refresh] Verifying refresh token');
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      console.log('[Refresh] Invalid refresh token');
      const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
      response.cookies.delete('refresh_token');
      response.cookies.delete('access_token');
      return response;
    }

    console.log('[Refresh] Token verified for user:', decoded.userId);

    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('[Refresh] User not found:', decoded.userId);
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      response.cookies.delete('refresh_token');
      response.cookies.delete('access_token');
      return response;
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    console.log('[Refresh] New access token generated');

    const isProduction = process.env.NODE_ENV === 'production';

    const responseBody: any = { success: true };
    if (!isProduction) {
      responseBody.debugTokens = { accessToken: newAccessToken };
    }

  const response = NextResponse.json(responseBody);
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    console.log('[Refresh] Token refresh successful');
    return response;
  } catch (error: unknown) {
    console.error('[Refresh] Error:', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}