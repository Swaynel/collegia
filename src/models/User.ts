import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'instructor' | 'admin';
  subscription: {
    tier: 'basics' | 'intermediate' | 'advanced';
    status: 'active' | 'expired' | 'cancelled';
    startDate: Date;
    endDate: Date;
  };
  enrolledCourses: mongoose.Types.ObjectId[];
  progress: {
    courseId: mongoose.Types.ObjectId;
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: Date;
  }[];
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    subscription: {
      tier: { type: String, enum: ['basics', 'intermediate', 'advanced'], default: 'basics' },
      status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
    },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    progress: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        completedLessons: { type: Number, default: 0 },
        totalLessons: { type: Number, required: true },
        lastAccessedAt: { type: Date, default: Date.now },
      },
    ],
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Keep only non-email indexes
UserSchema.index({ 'subscription.tier': 1, 'subscription.status': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
