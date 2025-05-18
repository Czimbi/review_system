import { body } from 'express-validator';

export const registerValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('userType')
    .isIn(['author', 'reviewer', 'editor'])
    .withMessage('Invalid user type'),
  body('institution')
    .trim()
    .notEmpty()
    .withMessage('Institution is required'),
  body('department')
    .optional()
    .trim(),
  body('title')
    .optional()
    .trim(),
  body('expertise')
    .optional()
    .custom((value, { req }) => {
      // Only validate expertise if userType is reviewer
      if (req.body.userType === 'reviewer') {
        if (!value) {
          throw new Error('Expertise is required for reviewers');
        }
        if (!Array.isArray(value)) {
          throw new Error('Expertise must be an array of strings');
        }
        if (value.length === 0) {
          throw new Error('At least one area of expertise is required for reviewers');
        }
      }
      return true;
    })
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const paperSubmissionValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters long'),
  
  body('authors')
    .notEmpty()
    .withMessage('Authors are required')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('Authors must be an array');
      }
      if (value.length === 0) {
        throw new Error('At least one author is required');
      }
      // Validate each author
      value.forEach((author: string) => {
        if (typeof author !== 'string' || author.trim().length === 0) {
          throw new Error('Each author must be a non-empty string');
        }
      });
      return true;
    }),
  
  body('field')
    .trim()
    .notEmpty()
    .withMessage('Field is required')
    .isIn([
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
    ])
    .withMessage('Invalid field of study'),
  
  body('abstract')
    .trim()
    .notEmpty()
    .withMessage('Abstract is required')
    .isLength({ min: 100 })
    .withMessage('Abstract must be at least 100 characters long'),
  
  body('keywords')
    .notEmpty()
    .withMessage('Keywords are required')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('Keywords must be an array');
      }
      if (value.length === 0) {
        throw new Error('At least one keyword is required');
      }
      // Validate each keyword
      value.forEach((keyword: string) => {
        if (typeof keyword !== 'string' || keyword.trim().length === 0) {
          throw new Error('Each keyword must be a non-empty string');
        }
      });
      return true;
    })
];

export const reviewSubmissionValidator = [
  body('decision')
    .isIn(['accept', 'reject', 'pending'])
    .withMessage('Invalid decision value'),
  
  body('technicalMerit')
    .isInt({ min: 1, max: 5 })
    .withMessage('Technical merit must be between 1 and 5'),
  
  body('novelty')
    .isInt({ min: 1, max: 5 })
    .withMessage('Novelty must be between 1 and 5'),
  
  body('clarity')
    .isInt({ min: 1, max: 5 })
    .withMessage('Clarity must be between 1 and 5'),
  
  body('significance')
    .isInt({ min: 1, max: 5 })
    .withMessage('Significance must be between 1 and 5'),
  
  body('publicComments')
    .trim()
    .notEmpty()
    .withMessage('Public comments are required')
    .isLength({ min: 50 })
    .withMessage('Public comments must be at least 50 characters long'),
  
  body('privateComments')
    .trim()
    .notEmpty()
    .withMessage('Private comments are required')
    .isLength({ min: 50 })
    .withMessage('Private comments must be at least 50 characters long')
]; 