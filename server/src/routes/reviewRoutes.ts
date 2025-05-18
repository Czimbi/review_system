import express from 'express';
import { 
  getAssignedPapers,
  getReview,
  submitReview,
  getPaperReviews
} from '../controllers/reviewController';
import { reviewSubmissionValidator } from '../middleware/validators';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Reviewer routes
router.get('/assigned', authenticate, checkRole(['reviewer']), getAssignedPapers);
router.get('/:paperId', authenticate, checkRole(['reviewer']), getReview);
router.post('/:paperId', authenticate, checkRole(['reviewer']), reviewSubmissionValidator, submitReview);

// Editor routes
router.get('/paper/:paperId', authenticate, checkRole(['editor']), getPaperReviews);

export default router; 