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
    console.log('[Register] Request body:', { 
      email: body.email, 
      fullName: body.fullName,
      hasPassword: !!body.password 
    });

    const { fullName, email, password } = registerSchema.parse(body);

    console.log('[Register] Validation passed');
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

    console.log('[Register] Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[Register] Creating new user');
    // ✅ CRITICAL FIX: subscription must be an object, not a string
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      subscription: {
        tier: 'basics',
        status: 'active',
        startDate: new Date(),
      },
      onboardingCompleted: false,
    });

    console.log('[Register] User created successfully:', user._id);

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user._id.toString());

    console.log('[Register] Tokens generated');

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

    console.log('[Register] Registration successful, cookies set');
    return response;
  } catch (error: unknown) {
    console.error('[Register] Error:', error);
    
    if (error instanceof Error) {
      console.error('[Register] Error name:', error.name);
      console.error('[Register] Error message:', error.message);
      
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Validation failed: ' + error.message },
          { status: 400 }
        );
      }
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Database validation failed: ' + error.message },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}