import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.type, message: e.msg }))
    });
    return;
  }
  next();
};

// Validation chains
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('voterId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Voter ID must be 3-20 characters')
    .isAlphanumeric()
    .withMessage('Voter ID must be alphanumeric'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateVote = [
  body('candidateId')
    .notEmpty()
    .withMessage('Candidate ID is required')
    .isMongoId()
    .withMessage('Invalid candidate ID format'),
  handleValidationErrors
];
