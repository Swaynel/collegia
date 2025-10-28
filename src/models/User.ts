// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  subscription: {
    tier: 'basics' | 'intermediate' | 'advanced';
    status: 'active' | 'expired' | 'cancelled';
    startDate: Date;
    endDate?: Date;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    subscription: {
      tier: { type: String, enum: ['basics', 'intermediate', 'advanced'], default: 'basics' },
      status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
    },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast email lookup
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
