import mongoose, { Schema, Document } from 'mongoose';

export interface IZoomClass extends Document {
  courseId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  zoomMeetingId: string;
  zoomJoinUrl: string;
  zoomPassword?: string;
  tier: 'basics' | 'intermediate' | 'advanced';
  maxParticipants: number;
  enrolledParticipants: mongoose.Types.ObjectId[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ZoomClassSchema = new Schema<IZoomClass>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true, default: 60 },
    zoomMeetingId: { type: String, required: true, unique: true },
    zoomJoinUrl: { type: String, required: true },
    zoomPassword: String,
    tier: { 
      type: String, 
      enum: ['basics', 'intermediate', 'advanced'], 
      required: true 
    },
    maxParticipants: { type: Number, default: 100 },
    enrolledParticipants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { 
      type: String, 
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
      default: 'scheduled' 
    },
  },
  { timestamps: true }
);

ZoomClassSchema.index({ courseId: 1, scheduledAt: -1 });
ZoomClassSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.models.ZoomClass || mongoose.model<IZoomClass>('ZoomClass', ZoomClassSchema);