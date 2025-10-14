import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { redisClient } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier') as 'basics' | 'intermediate' | 'advanced' | null;

    const cacheKey: string = tier ? `courses:list:${tier}` : 'courses:list:all';

    // Try cache first (only if Redis is available)
    if (redisClient) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return NextResponse.json({ courses: JSON.parse(cached as string) });
        }
      } catch (redisError) {
        console.warn('Redis cache read failed:', redisError);
      }
    }

    await connectDB();

    const filter: Record<string, unknown> = { isPublished: true };
    if (tier) filter.tier = tier;

    const courses = await Course.find(filter)
      .populate('instructor', 'fullName')
      .sort({ enrolledCount: -1 })
      .limit(50)
      .lean();

    // Try to cache (only if Redis is available)
    if (redisClient) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(courses), { ex: 300 });
      } catch (redisError) {
        console.warn('Redis cache write failed:', redisError);
      }
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}