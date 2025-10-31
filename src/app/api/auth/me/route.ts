// app/api/auth/me/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Log incoming Cookie header to help debug missing cookies
    try {
      const rawCookies = req.headers.get('cookie');
      console.log('[Auth Me] Incoming Cookie header:', rawCookies);
    } catch (e) {
      console.log('[Auth Me] Failed to read Cookie header:', e);
    }

    // Check if token exists
    const token = req.cookies.get('access_token')?.value;
    
    if (!token) {
      console.log('[Auth Me] No access token found in cookies');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('[Auth Me] Token found, verifying...');

    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      console.log('[Auth Me] Token verification failed');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('[Auth Me] Token verified for user:', decoded.userId);

    // Connect to database
    await connectDB();
    
    // Fetch user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('[Auth Me] User not found:', decoded.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Auth Me] User found:', user.email);

    return NextResponse.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      subscription: user.subscription,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error: unknown) {
    console.error('[Auth Me] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch user data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}