import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function createCheckoutSession(params: {
  userId: string;
  tier: 'intermediate' | 'advanced';
  duration: number;
}) {
  const priceMap = {
    intermediate: 1500, // KES
    advanced: 3000,
  };
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'kes',
          product_data: {
            name: `${params.tier.charAt(0).toUpperCase() + params.tier.slice(1)} Subscription`,
            description: `${params.duration} month access`,
          },
          unit_amount: priceMap[params.tier] * 100, // cents
        },
        quantity: params.duration,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?payment=cancelled`,
    metadata: {
      userId: params.userId,
      tier: params.tier,
      duration: params.duration.toString(),
    },
  });
  
  return session;
}