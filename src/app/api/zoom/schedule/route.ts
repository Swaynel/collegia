import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import ZoomClass from '@/models/ZoomClass';
import { createZoomMeeting } from '@/lib/zoom';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    const user = verifyAccessToken(token!);
    
    if (!user || !['instructor', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { courseId, title, description, scheduledAt, duration, tier, maxParticipants } = await req.json();
    
    // Create Zoom meeting
    const zoomMeeting = await createZoomMeeting({
      topic: title,
      start_time: new Date(scheduledAt).toISOString(),
      duration,
      password: Math.random().toString(36).slice(-8),
    });
    
    // Save to database
    await connectDB();
    const zoomClass = await ZoomClass.create({
      courseId,
      instructorId: user.userId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration,
      zoomMeetingId: zoomMeeting.id.toString(),
      zoomJoinUrl: zoomMeeting.join_url,
      zoomPassword: zoomMeeting.password,
      tier,
      maxParticipants: maxParticipants || 100,
    });
    
    return NextResponse.json({ 
      success: true, 
      class: zoomClass 
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Schedule zoom class error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule class' },
      { status: 500 }
    );
  }
}