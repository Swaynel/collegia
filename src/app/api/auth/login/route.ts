// app/api/auth/login/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { loginSchema } from '@/utils/validators';

export async function POST(req: NextRequest) {
  try {
    console.log('[Login] Starting login process');
    
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    console.log('[Login] Connecting to database');
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      console.log('[Login] User not found:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('[Login] Invalid password for:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user._id.toString());

    console.log('[Login] Tokens generated for:', email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscription: user.subscription,
      },
    });

    // Cookie options for Vercel
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log('[Login] Cookies set successfully');
    console.log('[Login] Environment:', process.env.NODE_ENV);
    console.log('[Login] Secure cookies:', isProduction);

    return response;
  } catch (error: unknown) {
    console.error('[Login] Error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}