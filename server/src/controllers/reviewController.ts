import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Review, IReview } from '../models/Review';
import { Paper, IPaper } from '../models/Paper';
import mongoose, { Types } from 'mongoose';

// Get papers assigned to a reviewer
export const getAssignedPapers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // First, get all reviews by this reviewer
    const existingReviews = await Review.find({
      reviewer: new Types.ObjectId(userId)
    }).select('paper');

    // Get the paper IDs that have already been reviewed
    const reviewedPaperIds = existingReviews.map(review => review.paper);

    // Find papers assigned to the reviewer that haven't been reviewed yet
    const papers = await Paper.find({
      reviewers: userId,
      _id: { $nin: reviewedPaperIds }, // Exclude papers that have already been reviewed
      status: { $in: ['submitted', 'under_review'] }
    })
    .populate('author', 'firstName lastName email')
    .sort({ submittedAt: -1 });

    // Add debug logging
    console.log('Fetching assigned papers for user:', userId);
    console.log('Already reviewed papers:', reviewedPaperIds.length);
    console.log('Papers pending review:', papers.length);
    console.log('Papers:', papers.map(p => ({ id: p._id, title: p.title, status: p.status })));

    res.json({
      success: true,
      data: papers
    });
  } catch (error) {
    console.error('Error fetching assigned papers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned papers'
    });
  }
};

// Get a specific review by paper ID and reviewer ID
export const getReview = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const userId = (req as any).user.id;

    const review = await Review.findOne({
      paper: new Types.ObjectId(paperId),
      reviewer: new Types.ObjectId(userId)
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review'
    });
  }
};

// Submit or update a review
export const submitReview = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paperId } = req.params;
    const userId = (req as any).user.id;
    const {
      decision,
      technicalMerit,
      novelty,
      clarity,
      significance,
      publicComments,
      privateComments
    } = req.body;

    try {
      // Find or create the review
      let review = await Review.findOne({
        paper: new Types.ObjectId(paperId),
        reviewer: new Types.ObjectId(userId)
      });

      if (!review) {
        review = new Review({
          paper: new Types.ObjectId(paperId),
          reviewer: new Types.ObjectId(userId),
          decision,
          technicalMerit,
          novelty,
          clarity,
          significance,
          publicComments,
          privateComments
        });
      } else {
        review.decision = decision;
        review.technicalMerit = technicalMerit;
        review.novelty = novelty;
        review.clarity = clarity;
        review.significance = significance;
        review.publicComments = publicComments;
        review.privateComments = privateComments;
      }

      await review.save();

      // Get the paper and update its reviews array if needed
      const paper = await Paper.findById(new Types.ObjectId(paperId));
      if (!paper) {
        throw new Error('Paper not found');
      }

      // Add review to paper's reviews array if not already present
      if (!paper.reviews.map(r => r.toString()).includes(review._id.toString())) {
        paper.reviews.push(review._id);
      }

      // Check if we need to update the paper status based on review decisions
      const allReviews = await Review.find({ paper: new Types.ObjectId(paperId) });
      const acceptCount = allReviews.filter(r => r.decision === 'accept').length;
      const rejectCount = allReviews.filter(r => r.decision === 'reject').length;

      if (acceptCount >= 3) {
        paper.status = 'accepted';
      } else if (rejectCount >= 2) {
        paper.status = 'rejected';
      }

      await paper.save();

      res.json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });
    } catch (error) {
      // If any operation fails, throw the error to be caught by the outer catch block
      throw error;
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: errorMessage
    });
  }
};

// Get all reviews for a paper (editor only)
export const getPaperReviews = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;

    const reviews = await Review.find({ paper: new Types.ObjectId(paperId) })
      .populate('reviewer', 'firstName lastName email institution')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching paper reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching paper reviews'
    });
  }
}; 