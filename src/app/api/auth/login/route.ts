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

    // Log incoming Cookie header to verify client sent cookies (for debugging)
    try {
      const rawCookies = req.headers.get('cookie');
      console.log('[Login] Incoming Cookie header:', rawCookies);
    } catch (e) {
      console.log('[Login] Failed to read Cookie header:', e);
    }

    // Parse JSON body safely and log non-sensitive fields for debugging
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[Login] Failed to parse JSON body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('[Login] Request body (safe):', { email: body?.email });

    // Validate input
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

    const isProduction = process.env.NODE_ENV === 'production';

    const responseBody: any = {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscription: user.subscription,
      },
    };

    // For local debugging only: include tokens in the response body so the client
    // can verify tokens were generated and returned. This is skipped in production.
    if (!isProduction) {
      responseBody.debugTokens = {
        accessToken,
        refreshToken,
      };
    }

    const response = NextResponse.json(responseBody);

    // Cookie options for Vercel
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

    if (error instanceof Error) {
      // Zod validation errors are surfaced with name === 'ZodError'
      if ((error as any).name === 'ZodError') {
        return NextResponse.json({ error: 'Validation failed: ' + error.message }, { status: 400 });
      }

      // Invalid credentials already return 401 above; treat other errors as server errors
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}