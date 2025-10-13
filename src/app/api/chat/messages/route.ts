import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import { verifyAccessToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    const user = verifyAccessToken(token!);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 5 messages per minute
    const rateLimit = await checkRateLimit(`chat:${user.userId}`, 5, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { courseId, message } = await req.json();
    
    if (!courseId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Course ID and message are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const chatMessage = await ChatMessage.create({
      courseId,
      userId: user.userId,
      username: user.email.split('@')[0], // Simple username from email
      message: message.trim(),
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id).lean();

    return NextResponse.json({
      success: true,
      message: populatedMessage,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}