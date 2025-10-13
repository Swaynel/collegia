import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  tier: 'basics' | 'intermediate' | 'advanced';
  instructor: mongoose.Types.ObjectId;
  thumbnail: string;
  syllabus: {
    lessonNumber: number;
    title: string;
    description: string;
    duration: number;
  }[];
  totalLessons: number;
  enrolledCount: number;
  averageRating: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    tier: { 
      type: String, 
      enum: ['basics', 'intermediate', 'advanced'], 
      required: true,
      index: true 
    },
    instructor: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    thumbnail: { type: String, required: true },
    syllabus: [
      {
        lessonNumber: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String },
        duration: { type: Number, required: true },
      },
    ],
    totalLessons: { type: Number, required: true },
    enrolledCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CourseSchema.index({ slug: 1 });
CourseSchema.index({ tier: 1, isPublished: 1 });
CourseSchema.index({ enrolledCount: -1 });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);