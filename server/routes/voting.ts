import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import Election from '../models/Election.js';
import User from '../models/User.js';
import { protect, AuthRequest } from '../middleware/authMiddleware.js';
import { validateVote } from '../utils/validation.js';

const router = Router();

// Rate limiter for voting (max 5 requests per 10 minutes per IP)
const voteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many voting attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================
// GET /api/voting/candidates
// Public — anyone can see candidates
// ====================================================
router.get('/candidates', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidates = await Candidate.find({ isActive: true }).sort({ voteCount: -1 });
    res.json({ success: true, count: candidates.length, candidates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// GET /api/voting/status
// Public — get current election status
// ====================================================
router.get('/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const election = await Election.findOne({ status: 'ongoing' }).sort({ createdAt: -1 });
    const now = new Date();

    if (!election) {
      // Check for upcoming
      const upcoming = await Election.findOne({ status: 'upcoming' }).sort({ startTime: 1 });
      res.json({
        success: true,
        hasActiveElection: false,
        election: upcoming,
        message: upcoming ? 'Election not started yet' : 'No election scheduled'
      });
      return;
    }

    const isActive = now >= election.startTime && now <= election.endTime;

    // Auto-complete if time passed
    if (!isActive && election.status === 'ongoing') {
      election.status = 'completed';
      await election.save();
    }

    res.json({
      success: true,
      hasActiveElection: isActive,
      election,
      timeRemaining: isActive ? election.endTime.getTime() - now.getTime() : 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// POST /api/voting/vote
// Protected — authenticated voters only
// ====================================================
router.post('/vote', protect, voteLimiter, validateVote, async (req: AuthRequest, res: Response): Promise<void> => {
  const { candidateId } = req.body;

  try {
    // 1. Check user hasn't already voted
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.hasVoted) {
      res.status(400).json({
        success: false,
        message: 'You have already cast your vote. Each voter can only vote once.',
        code: 'ALREADY_VOTED'
      });
      return;
    }

    // 2. Check active election
    const election = await Election.findOne({ status: 'ongoing' });
    const now = new Date();
    if (!election || now < election.startTime || now > election.endTime) {
      res.status(400).json({
        success: false,
        message: 'No active election at this time. Voting is not allowed.',
        code: 'NO_ACTIVE_ELECTION'
      });
      return;
    }

    // 3. Check candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate || !candidate.isActive) {
      res.status(404).json({ success: false, message: 'Candidate not found or inactive.' });
      return;
    }

    // 4. Check for duplicate vote via hash (double security)
    const userHash = (Vote as any).hashUserId(user._id.toString());
    const existingVote = await Vote.findOne({ userHash });
    if (existingVote) {
      res.status(400).json({
        success: false,
        message: 'Duplicate vote detected.',
        code: 'DUPLICATE_VOTE'
      });
      return;
    }

    // 5. Cast vote atomically
    await Vote.create({
      userHash,
      candidateId: candidate._id,
      electionId: election._id,
      timestamp: new Date(),
      hour: now.getHours(),
      dayOfWeek: now.getDay()
    });

    // Increment candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    // Mark user as voted
    user.hasVoted = true;
    await user.save();

    res.json({
      success: true,
      message: 'Your vote has been cast successfully! Thank you for participating.',
      votedFor: {
        candidateName: candidate.name,
        party: candidate.party
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to cast vote.' });
  }
});

// ====================================================
// GET /api/voting/results
// Protected — only after election ends (or admin)
// ====================================================
router.get('/results', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const election = await Election.findOne().sort({ createdAt: -1 });
    const candidates = await Candidate.find({ isActive: true }).sort({ voteCount: -1 });
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'voter' });

    const results = candidates.map((c, index) => ({
      rank: index + 1,
      id: c._id,
      name: c.name,
      party: c.party,
      color: c.color,
      voteCount: c.voteCount,
      percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(2) : '0.00'
    }));

    // Votes over time (hourly breakdown)
    const votingTrend = await Vote.aggregate([
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      election,
      results,
      totalVotes,
      totalUsers,
      turnout: totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : '0.00',
      votingTrend
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
