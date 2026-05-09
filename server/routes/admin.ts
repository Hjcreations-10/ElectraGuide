import { Router, Response } from 'express';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import { protect, adminOnly, AuthRequest } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ====================================================
// GET /api/admin/stats
// Main analytics dashboard data
// ====================================================
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'voter' });
    const votesCast = await Vote.countDocuments();
    const totalCandidates = await Candidate.countDocuments({ isActive: true });
    const flaggedUsers = await User.countDocuments({ isFlagged: true });
    const election = await Election.findOne({ status: 'ongoing' }).sort({ createdAt: -1 });

    const turnout = totalUsers > 0 ? parseFloat(((votesCast / totalUsers) * 100).toFixed(2)) : 0;

    // Candidate standings
    const candidateVotes = await Candidate.find({ isActive: true })
      .sort({ voteCount: -1 })
      .select('name party color voteCount');

    // Votes by hour (for peak hours chart)
    const votesByHour = await Vote.aggregate([
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', votes: '$count', _id: 0 } }
    ]);

    // Fill missing hours with 0
    const hourlyData = Array.from({ length: 24 }, (_, h) => {
      const found = votesByHour.find(v => v.hour === h);
      return { hour: `${h.toString().padStart(2, '0')}:00`, votes: found ? found.votes : 0 };
    });

    // Votes registered in last 7 days (daily trend)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyVotes = await Vote.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', votes: '$count', _id: 0 } }
    ]);

    // Fraud analysis
    const suspiciousActivity = await User.find({ isFlagged: true })
      .select('name email voterId loginAttempts lastLoginIp createdAt')
      .limit(20);

    // User registration trend
    const registrationTrend = await User.aggregate([
      { $match: { role: 'voter', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', registrations: '$count', _id: 0 } }
    ]);

    // Mock Advanced Analytics Data for Enterprise Dashboard
    const systemHealth = {
      uptime: '99.99%',
      activeUsers: Math.floor(Math.random() * 500) + 1500, // Simulated 1500-2000 active users
      currentLoad: '42%',
      threatLevel: flaggedUsers > 5 ? 'Elevated' : 'Low'
    };

    const regionalData = [
      { name: 'North Region', votes: Math.floor(votesCast * 0.35) || 350 },
      { name: 'South Region', votes: Math.floor(votesCast * 0.25) || 250 },
      { name: 'East Region', votes: Math.floor(votesCast * 0.20) || 200 },
      { name: 'West Region', votes: Math.floor(votesCast * 0.20) || 200 }
    ];

    const insights = [
      { type: 'trend', text: 'Candidate A gained 12% momentum in the last 4 hours.' },
      { type: 'warning', text: 'Unusual voting spike detected from Node-Beta (South Region).' },
      { type: 'info', text: 'Peak voting time consistently tracking between 6PM and 8PM.' }
    ];

    res.json({
      success: true,
      stats: {
        totalUsers,
        votesCast,
        turnout,
        totalCandidates,
        flaggedUsers,
        hasActiveElection: !!election,
        election
      },
      candidateVotes,
      hourlyData,
      dailyVotes,
      registrationTrend,
      suspiciousActivity,
      systemHealth,
      regionalData,
      insights
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// POST /api/admin/election/start
// ====================================================
router.post('/election/start', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('endTime').isISO8601().withMessage('Valid end time required')
], async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { title, description, startTime, endTime } = req.body;

  try {
    // Check no ongoing election
    const existing = await Election.findOne({ status: 'ongoing' });
    if (existing) {
      res.status(400).json({ success: false, message: 'An election is already ongoing. End it first.' });
      return;
    }

    const election = await Election.create({
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'ongoing',
      createdBy: req.user._id,
      totalVoters: await User.countDocuments({ role: 'voter' })
    });

    res.status(201).json({ success: true, message: 'Election started successfully.', election });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// POST /api/admin/election/end
// ====================================================
router.post('/election/end', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const election = await Election.findOne({ status: 'ongoing' });
    if (!election) {
      res.status(404).json({ success: false, message: 'No ongoing election found.' });
      return;
    }

    election.status = 'completed';
    election.endTime = new Date();
    await election.save();

    res.json({ success: true, message: 'Election ended successfully.', election });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// GET /api/admin/elections
// All elections history
// ====================================================
router.get('/elections', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, elections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// POST /api/admin/candidates
// Add a new candidate
// ====================================================
router.post('/candidates', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('party').trim().notEmpty().withMessage('Party is required')
], async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { name, party, description, symbol, color } = req.body;
  try {
    const candidate = await Candidate.create({ name, party, description, symbol, color: color || '#6366f1' });
    res.status(201).json({ success: true, message: 'Candidate added successfully.', candidate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// DELETE /api/admin/candidates/:id
// ====================================================
router.delete('/candidates/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Candidate.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Candidate removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// GET /api/admin/users
// All registered users
// ====================================================
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: 'voter' })
      .select('name email voterId hasVoted isFlagged loginAttempts createdAt lastLoginAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// POST /api/admin/users/:id/unflag
// ====================================================
router.post('/users/:id/unflag', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isFlagged: false, loginAttempts: 0 });
    res.json({ success: true, message: 'User unflagged.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// GET /api/admin/export/csv
// Power BI CSV export
// ====================================================
router.get('/export/csv', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidates = await Candidate.find({ isActive: true });
    const votes = await Vote.find().populate('candidateId', 'name party');
    const totalUsers = await User.countDocuments({ role: 'voter' });
    const election = await Election.findOne().sort({ createdAt: -1 });

    // Build CSV
    const rows: string[] = [];

    // === Sheet 1: Summary ===
    rows.push('--- ELECTION SUMMARY ---');
    rows.push('Metric,Value');
    rows.push(`Election Title,${election?.title || 'N/A'}`);
    rows.push(`Total Registered Voters,${totalUsers}`);
    rows.push(`Total Votes Cast,${votes.length}`);
    rows.push(`Voter Turnout %,${totalUsers > 0 ? ((votes.length / totalUsers) * 100).toFixed(2) : 0}`);
    rows.push(`Election Status,${election?.status || 'N/A'}`);
    rows.push(`Start Time,${election?.startTime?.toISOString() || 'N/A'}`);
    rows.push(`End Time,${election?.endTime?.toISOString() || 'N/A'}`);
    rows.push('');

    // === Sheet 2: Candidate Results ===
    rows.push('--- CANDIDATE PERFORMANCE ---');
    rows.push('Candidate,Party,Total Votes,Vote Share %');
    candidates.forEach(c => {
      const share = votes.length > 0 ? ((c.voteCount / votes.length) * 100).toFixed(2) : '0.00';
      rows.push(`${c.name},${c.party},${c.voteCount},${share}`);
    });
    rows.push('');

    // === Sheet 3: Voting Trends (hourly) ===
    rows.push('--- VOTING TRENDS (HOURLY) ---');
    rows.push('Hour,Votes Cast');
    const hourBuckets: Record<number, number> = {};
    votes.forEach(v => {
      const h = v.hour ?? new Date(v.timestamp).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    });
    for (let h = 0; h < 24; h++) {
      rows.push(`${h.toString().padStart(2, '0')}:00,${hourBuckets[h] || 0}`);
    }
    rows.push('');

    // === Sheet 4: Raw Vote Log (anonymised) ===
    rows.push('--- ANONYMISED VOTE LOG ---');
    rows.push('Vote ID,Candidate Name,Party,Timestamp,Hour');
    votes.forEach((v: any) => {
      const cand = v.candidateId;
      rows.push(`${v._id},${cand?.name || 'N/A'},${cand?.party || 'N/A'},${v.timestamp.toISOString()},${v.hour}`);
    });
    rows.push('');

    // === Sheet 5: Security Anomalies ===
    rows.push('--- SECURITY ANOMALIES ---');
    rows.push('Voter ID,Name,Last IP,Login Attempts,Flagged');
    const riskyUsers = await User.find({ 
      $or: [{ isFlagged: true }, { loginAttempts: { $gt: 2 } }] 
    }).select('voterId name lastLoginIp loginAttempts isFlagged');
    
    riskyUsers.forEach(u => {
      rows.push(`${u.voterId},${u.name},${u.lastLoginIp || 'N/A'},${u.loginAttempts},${u.isFlagged}`);
    });

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=electraguide_powerbi_export.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// GET /api/admin/fraud-report
// Fraud detection analysis
// ====================================================
router.get('/fraud-report', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flaggedUsers = await User.find({ isFlagged: true }).select('name email voterId loginAttempts lastLoginIp lastLoginAt');

    // Detect IP collisions (multiple accounts from same IP)
    const ipGroups = await User.aggregate([
      { $match: { lastLoginIp: { $exists: true, $ne: null } } },
      { $group: { _id: '$lastLoginIp', count: { $sum: 1 }, users: { $push: { name: '$name', email: '$email', voterId: '$voterId' } } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Voting spike detection (many votes in short window)
    const recentVotes = await Vote.find({
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
    }).countDocuments();

    const totalVotes = await Vote.countDocuments();
    const avgVotesPerHour = totalVotes / 24;
    const spikeDetected = recentVotes > avgVotesPerHour * 3;

    res.json({
      success: true,
      report: {
        flaggedUsers: { count: flaggedUsers.length, users: flaggedUsers },
        ipCollisions: { count: ipGroups.length, groups: ipGroups },
        votingSpike: {
          detected: spikeDetected,
          recentVotes,
          avgVotesPerHour: avgVotesPerHour.toFixed(2),
          threshold: (avgVotesPerHour * 3).toFixed(2)
        },
        riskLevel: flaggedUsers.length > 5 || spikeDetected ? 'HIGH' : flaggedUsers.length > 2 ? 'MEDIUM' : 'LOW'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ====================================================
// GET /api/admin/activity-feed
// ====================================================
router.get('/activity-feed', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recentVotes = await Vote.find()
      .populate('candidateId', 'name')
      .sort({ timestamp: -1 })
      .limit(5);

    const recentUsers = await User.find({ role: 'voter' })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCandidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(3);

    const feed = [
      ...recentVotes.map(v => ({
        type: 'vote',
        title: 'Vote Cast Successfully',
        description: `A citizen securely voted for ${(v as any).candidateId?.name || 'a candidate'}.`,
        timestamp: v.timestamp,
        icon: 'Vote'
      })),
      ...recentUsers.map(u => ({
        type: 'voter',
        title: 'New Voter Registered',
        description: `Citizen ${u.name} (ID: ${u.voterId}) joined the platform.`,
        timestamp: u.createdAt,
        icon: 'UserPlus'
      })),
      ...recentCandidates.map(c => ({
        type: 'candidate',
        title: 'Candidate Profile Live',
        description: `${c.name} (${c.party}) is now on the official ballot.`,
        timestamp: (c as any).createdAt,
        icon: 'Award'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ success: true, feed: feed.slice(0, 10) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
