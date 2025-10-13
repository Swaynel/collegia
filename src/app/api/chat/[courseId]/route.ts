import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage, { IChatMessage } from '@/models/ChatMessage';
import { verifyAccessToken } from '@/lib/jwt';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
): Promise<NextResponse<{ success: boolean; messages: IChatMessage[] } | { error: string }>> {
  try {
    // --- AUTH CHECK ---
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // --- EXTRACT PARAMS & QUERY ---
    const { courseId } = await context.params; // ✅ Await the promise
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const before = searchParams.get('before');

    // --- DATABASE ---
    await connectDB();

    const filter: FilterQuery<IChatMessage> = {
      courseId: new ObjectId(courseId),
      isDeleted: false,
    };

    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        filter.createdAt = { $lt: beforeDate };
      }
    }

    const messages = (await ChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()) as unknown as IChatMessage[];

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error('Chat messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
