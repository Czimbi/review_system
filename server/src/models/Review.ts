import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  paper: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  decision: 'accept' | 'reject' | 'pending';
  technicalMerit: number;
  novelty: number;
  clarity: number;
  significance: number;
  publicComments: string;
  privateComments: string;
  submittedAt: Date;
  lastModifiedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  paper: {
    type: Schema.Types.ObjectId,
    ref: 'Paper',
    required: true
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  decision: {
    type: String,
    enum: ['accept', 'reject', 'pending'],
    default: 'pending',
    required: true
  },
  technicalMerit: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  novelty: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  clarity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  significance: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  publicComments: {
    type: String,
    required: true,
    trim: true
  },
  privateComments: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastModifiedAt on every save
reviewSchema.pre('save', function(next) {
  this.lastModifiedAt = new Date();
  next();
});

// Ensure one reviewer can only submit one review per paper
reviewSchema.index({ paper: 1, reviewer: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema); 