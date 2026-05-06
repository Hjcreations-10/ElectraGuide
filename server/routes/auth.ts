import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { validateRegister, validateLogin } from '../utils/validation.js';
import { protect, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Rate limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================
// POST /api/auth/register
// ====================================================
router.post('/register', authLimiter, validateRegister, async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, voterId, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { voterId: voterId.toUpperCase() }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Voter ID';
      res.status(409).json({ success: false, message: `${field} is already registered.` });
      return;
    }

    // Only allow admin role if explicitly set (protect admin creation)
    const userRole = (role === 'admin' && process.env.ALLOW_ADMIN_REGISTER === 'true') ? 'admin' : 'voter';

    const user = await User.create({
      name,
      email,
      password,
      voterId: voterId.toUpperCase(),
      role: userRole,
      isVerified: true // Auto-verify for simplicity (add OTP flow here)
    });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        voterId: user.voterId,
        role: user.role,
        hasVoted: user.hasVoted,
        isFlagged: user.isFlagged,
        isVerified: user.isVerified
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
});

// ====================================================
// POST /api/auth/login
// ====================================================
router.post('/login', authLimiter, validateLogin, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // Fraud detection: flag account after too many failed attempts
    if (user.loginAttempts >= 5) {
      user.isFlagged = true;
      await user.save();
      res.status(403).json({
        success: false,
        message: 'Account locked due to too many failed attempts. Contact admin.',
        isFlagged: true
      });
      return;
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment failed attempts
      user.loginAttempts += 1;
      user.loginHistory.push({ ip: clientIp, timestamp: new Date(), success: false });
      await user.save();

      res.status(401).json({
        success: false,
        message: `Invalid email or password. ${5 - user.loginAttempts} attempts remaining.`
      });
      return;
    }

    // Successful login - reset attempts
    user.loginAttempts = 0;
    user.lastLoginAt = new Date();
    user.lastLoginIp = clientIp;
    user.loginHistory.push({ ip: clientIp, timestamp: new Date(), success: true });
    // Keep only last 10 login history entries
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        voterId: user.voterId,
        role: user.role,
        hasVoted: user.hasVoted,
        isFlagged: user.isFlagged,
        isVerified: user.isVerified
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
});

// ====================================================
// GET /api/auth/profile
// ====================================================
router.get('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        voterId: user.voterId,
        role: user.role,
        hasVoted: user.hasVoted,
        isFlagged: user.isFlagged,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
