import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const Signature = req.headers.get('stripe-signature');
    console.log(Signature)
    // For now, handle basic webhook - in production, verify Stripe signature
    const body = await req.json();
    
    await connectDB();
    
    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      const { userId, tier, duration } = session.metadata;
      
      // Update payment status
      await Payment.findOneAndUpdate(
        { 'metadata.stripeSessionId': session.id },
        { status: 'completed' }
      );
      
      // Update user subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(duration));
      
      await User.findByIdAndUpdate(userId, {
        'subscription.tier': tier,
        'subscription.status': 'active',
        'subscription.endDate': endDate,
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
