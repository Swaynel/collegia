import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'mpesa' | 'stripe';
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  tier: 'intermediate' | 'advanced';
  duration: number;
  metadata: {
    phoneNumber?: string;
    checkoutRequestID?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['mpesa', 'stripe'], required: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'KES' },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    tier: { type: String, enum: ['intermediate', 'advanced'], required: true },
    duration: { type: Number, required: true, default: 1 },
    metadata: {
      phoneNumber: String,
      checkoutRequestID: String,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ status: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);