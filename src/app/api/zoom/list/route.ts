import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ZoomClass from '@/models/ZoomClass';
import { FilterQuery } from 'mongoose';
interface IZoomClass {
  _id?: string;
  courseId: string;
  instructorId: string;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const upcoming = searchParams.get('upcoming') !== 'false';
    
    await connectDB();

    // 👇 Use a proper filter type instead of `unknown`
    const filter: FilterQuery<IZoomClass> = {};

    if (courseId) {
      filter.courseId = courseId;
    }

    if (upcoming) {
      filter.scheduledAt = { $gte: new Date() };
      filter.status = 'scheduled';
    }

    const classes = await ZoomClass.find(filter)
      .populate('courseId', 'title')
      .populate('instructorId', 'fullName')
      .sort({ scheduledAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Zoom classes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
