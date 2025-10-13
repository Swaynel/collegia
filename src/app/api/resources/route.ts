import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Resource, { IResource } from '@/models/Resource';
import { FilterQuery } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const tier = searchParams.get('tier') as IResource['tier'] | null;

    await connectDB();

    // ✅ Correct filter type for Mongoose
    const filter: FilterQuery<IResource> = { isActive: true };

    if (courseId) {
      filter.courseId = new mongoose.Types.ObjectId(courseId);
    }

    if (tier) {
      filter.tier = tier;
    }

    const resources = await Resource.find(filter)
      .populate('courseId', 'title')
      .sort({ clickCount: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ resources });
  } catch (error: unknown) {
    console.error('Resources fetch error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to fetch resources';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
