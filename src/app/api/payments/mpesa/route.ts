import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
    const user = verifyAccessToken(token!);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { phoneNumber, amount, tier, duration } = await req.json();
    
    // Validate input
    if (!phoneNumber || !amount || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['intermediate', 'advanced'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create payment record
    const payment = await Payment.create({
      userId: user.userId,
      provider: 'mpesa',
      transactionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'KES',
      status: 'pending',
      tier,
      duration: duration || 1,
      metadata: {
        phoneNumber,
      },
    });
    
    // Initiate M-Pesa payment
    const stkResult = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: `SUB${tier.toUpperCase()}`,
      transactionDesc: `${tier} subscription`,
    });
    
    // Update payment with checkout request ID
    await Payment.findByIdAndUpdate(payment._id, {
      'metadata.checkoutRequestID': stkResult.CheckoutRequestID,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Payment request sent to your phone',
      checkoutRequestID: stkResult.CheckoutRequestID,
      transactionId: payment.transactionId,
    });
  } catch (error: unknown) {
    console.error('M-Pesa payment error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}