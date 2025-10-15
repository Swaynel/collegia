import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { loginSchema } from '@/utils/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscription: user.subscription,
      },
      token: accessToken,
    });

    // Fixed cookie settings for Vercel
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always true on Vercel (HTTPS)
      sameSite: 'lax' as const, // Changed from 'strict' to 'lax'
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

    console.log('✅ Login successful, cookies set for user:', user.email);

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);

    const message =
      error instanceof Error ? error.message : 'Login failed';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}