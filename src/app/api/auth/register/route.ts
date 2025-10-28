// app/api/auth/register/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { registerSchema } from '@/utils/validators';

export async function POST(req: NextRequest) {
  try {
    console.log('[Register] Starting registration process');
    
    const body = await req.json();
    const { fullName, email, password } = registerSchema.parse(body);

    console.log('[Register] Connecting to database');
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[Register] User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'student', // default role
      subscription: 'free', // default subscription
      onboardingCompleted: false,
    });

    console.log('[Register] User created:', email);

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user._id.toString());

    console.log('[Register] Tokens generated for:', email);

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

    // Cookie options
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

    console.log('[Register] Registration successful');
    return response;
  } catch (error: unknown) {
    console.error('[Register] Error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}