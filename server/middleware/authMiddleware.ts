import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
}

// Protect routes - require authentication
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_this') as any;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Token is invalid or user no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  }
};

// Admin only middleware
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
    return;
  }
  next();
};

// Check voter role
export const voterOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !['voter', 'admin'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Voter privileges required.'
    });
    return;
  }
  next();
};
