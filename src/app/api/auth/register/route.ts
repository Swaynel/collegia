import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { registerSchema } from '@/utils/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      role: 'student',
      subscription: {
        tier: 'basics',
        status: 'active',
        startDate: new Date(),
      },
    });

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          subscription: user.subscription,
        },
        token: accessToken,
      },
      { status: 201 }
    );

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
  console.error('Login error:', error);

  const message =
    error instanceof Error ? error.message : 'Registration failed';

  return NextResponse.json({ error: message }, { status: 400 });
}

}