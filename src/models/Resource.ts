import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description: string;
  url: string;
  type: 'pdf' | 'video' | 'article' | 'tool' | 'other';
  courseId: mongoose.Types.ObjectId;
  tier: 'basics' | 'intermediate' | 'advanced';
  isActive: boolean;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    url: { 
      type: String, 
      required: true,
      validate: {
        validator: (v: string) => /^https?:\/\/.+/.test(v),
        message: 'Must be a valid URL'
      }
    },
    type: { 
      type: String, 
      enum: ['pdf', 'video', 'article', 'tool', 'other'], 
      required: true 
    },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    tier: { 
      type: String, 
      enum: ['basics', 'intermediate', 'advanced'], 
      required: true 
    },
    isActive: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ResourceSchema.index({ courseId: 1, tier: 1 });
ResourceSchema.index({ isActive: 1 });

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);