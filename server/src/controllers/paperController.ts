import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Paper } from '../models/Paper';
import { User } from '../models/User';

export const submitPaper = async (req: Request, res: Response) => {
  try {
    console.log('Received paper submission:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg
        }))
      });
    }

    // Get the user ID from the authenticated request
    const userId = (req as any).user.id;

    // Process authors and keywords
    const authors = Array.isArray(req.body.authors) 
      ? req.body.authors 
      : req.body.authors.split(',').map((author: string) => author.trim());

    const keywords = Array.isArray(req.body.keywords)
      ? req.body.keywords
      : req.body.keywords.split(',').map((keyword: string) => keyword.trim());

    // Create new paper
    const paper = new Paper({
      title: req.body.title,
      authors: authors,
      field: req.body.field,
      abstract: req.body.abstract,
      keywords: keywords,
      submittedBy: userId,
      author: userId,
      status: 'submitted'
    });

    console.log('Creating paper with data:', paper);

    // Save the paper
    await paper.save();

    res.status(201).json({
      success: true,
      message: 'Paper submitted successfully',
      data: paper
    });

  } catch (error) {
    console.error('Paper submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', errorMessage);
    
    res.status(500).json({
      success: false,
      message: 'Error submitting paper',
      error: errorMessage
    });
  }
};

export const getMyPapers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const papers = await Paper.find({ submittedBy: userId })
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'firstName lastName email institution'
        }
      })
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      message: 'Papers retrieved successfully',
      data: papers
    });

  } catch (error) {
    console.error('Error fetching papers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      success: false,
      message: 'Error fetching papers',
      error: errorMessage
    });
  }
};

export const withdrawPaper = async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const userId = (req as any).user.id;

    // Find the paper
    const paper = await Paper.findById(paperId);

    // Check if paper exists
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if user owns the paper
    if (paper.submittedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to withdraw this paper'
      });
    }

    // Check if paper can be withdrawn (only if status is 'submitted')
    if (paper.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only papers in submitted status can be withdrawn'
      });
    }

    // Delete the paper
    await Paper.findByIdAndDelete(paperId);

    res.json({
      success: true,
      message: 'Paper withdrawn successfully'
    });

  } catch (error) {
    console.error('Error withdrawing paper:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      success: false,
      message: 'Error withdrawing paper',
      error: errorMessage
    });
  }
};

export const getUnassignedPapers = async (req: Request, res: Response) => {
  try {
    const papers = await Paper.find({ 
      status: 'submitted',
      $expr: { $lt: [{ $size: "$reviewers" }, 3] } // Show papers with fewer than 3 reviewers
    }).populate('author', 'firstName lastName email')
      .populate('reviewers', 'firstName lastName email'); // Also populate existing reviewers

    res.json({
      success: true,
      data: papers
    });
  } catch (error) {
    console.error('Error fetching unassigned papers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unassigned papers'
    });
  }
};

export const getAvailableReviewers = async (req: Request, res: Response) => {
  try {
    const { field } = req.query;
    
    const query = field 
      ? { userType: 'reviewer', expertise: field }
      : { userType: 'reviewer' };

    const reviewers = await User.find(query)
      .select('firstName lastName email expertise institution department');

    res.json({
      success: true,
      data: reviewers
    });
  } catch (error) {
    console.error('Error fetching available reviewers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available reviewers'
    });
  }
};

export const assignReviewer = async (req: Request, res: Response) => {
  try {
    const { paperId, reviewerId } = req.body;

    // Validate inputs
    if (!paperId || !reviewerId) {
      return res.status(400).json({
        success: false,
        message: 'Paper ID and reviewer ID are required'
      });
    }

    // Check if paper exists
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if reviewer exists and is actually a reviewer
    const reviewer = await User.findOne({ _id: reviewerId, userType: 'reviewer' });
    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: 'Reviewer not found'
      });
    }

    // Check if reviewer is already assigned
    if (paper.reviewers.includes(reviewerId)) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer is already assigned to this paper'
      });
    }

    // Check if we've reached the maximum number of reviewers
    if (paper.reviewers.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Paper already has the maximum number of reviewers (3)'
      });
    }

    // Assign reviewer
    paper.reviewers.push(reviewerId);
    
    // Only change status to under_review when exactly 3 reviewers are assigned
    if (paper.reviewers.length === 3) {
      paper.status = 'under_review';
    } else if (paper.status !== 'submitted') {
      paper.status = 'submitted'; // Ensure paper stays in submitted state until 3 reviewers
    }
    
    await paper.save();

    // Populate the paper with reviewer details before sending response
    const populatedPaper = await Paper.findById(paper._id)
      .populate('author', 'firstName lastName email')
      .populate('reviewers', 'firstName lastName email');

    res.json({
      success: true,
      message: paper.reviewers.length === 3 
        ? 'Reviewer assigned successfully. Paper is now under review.'
        : `Reviewer assigned successfully. ${3 - paper.reviewers.length} more reviewer(s) needed.`,
      data: populatedPaper
    });
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning reviewer'
    });
  }
}; 