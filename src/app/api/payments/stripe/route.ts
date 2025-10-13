import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    const user = verifyAccessToken(token!);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { tier, duration } = await req.json();
    
    if (!['intermediate', 'advanced'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }
    
    const session = await createCheckoutSession({
      userId: user.userId,
      tier,
      duration: duration || 1,
    });
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout session creation failed' },
      { status: 500 }
    );
  }
}