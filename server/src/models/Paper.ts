import mongoose, { Document, Schema } from 'mongoose';

export interface IPaper extends Document {
  title: string;
  authors: string[];
  field: string;
  abstract: string;
  keywords: string[];
  fileUrl?: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
  author: mongoose.Types.ObjectId;
  reviewers: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];
  currentVersion: number;
}

const paperSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: [{
    type: String,
    required: true,
    trim: true
  }],
  field: {
    type: String,
    required: true,
    enum: [
      'computer-science',
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'engineering',
      'medicine',
      'social-sciences',
      'humanities',
      'other'
    ]
  },
  abstract: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    required: true,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'accepted', 'rejected'],
    default: 'submitted'
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  currentVersion: {
    type: Number,
    default: 1
  }
});

export const Paper = mongoose.model<IPaper>('Paper', paperSchema); 