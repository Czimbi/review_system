import express from 'express';
import { 
  submitPaper, 
  getMyPapers, 
  withdrawPaper,
  getUnassignedPapers,
  getAvailableReviewers,
  assignReviewer
} from '../controllers/paperController';
import { paperSubmissionValidator } from '../middleware/validators';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Author routes
router.post('/submit', authenticate, paperSubmissionValidator, submitPaper);
router.get('/my-papers', authenticate, getMyPapers);
router.post('/withdraw/:paperId', authenticate, withdrawPaper);

// Editor routes
router.get(
  '/unassigned',
  authenticate,
  checkRole(['editor']),
  getUnassignedPapers
);

router.get(
  '/available-reviewers/:paperId',
  authenticate,
  checkRole(['editor']),
  getAvailableReviewers
);

router.post(
  '/assign-reviewer',
  authenticate,
  checkRole(['editor']),
  assignReviewer
);

export default router; 