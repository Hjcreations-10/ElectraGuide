import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'mock_secret';

// Mock Data
const users = [
  { _id: '1', name: 'Election Commissioner', email: 'admin@electra.gov', password: 'Admin@123', role: 'admin', voterId: 'ADMIN001', hasVoted: false },
  { _id: '2', name: 'John Citizen', email: 'voter@electra.gov', password: 'Voter@123', role: 'voter', voterId: 'VOTER789', hasVoted: false }
];

const candidates = [
  { _id: 'c1', name: 'Arjun Sharma', party: 'Bhartiya Pragati Party', color: '#f97316', voteCount: 124 },
  { _id: 'c2', name: 'Sarah Joseph', party: 'Social Justice Front', color: '#10b981', voteCount: 89 },
  { _id: 'c3', name: 'Vikram Singh', party: 'National Unity Alliance', color: '#6366f1', voteCount: 156 }
];

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ success: true, token, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/voting/candidates', (req, res) => {
  res.json({ success: true, candidates });
});

app.get('/api/voting/status', (req, res) => {
  res.json({
    success: true,
    hasActiveElection: true,
    election: { title: 'Mock General Election 2026', startTime: new Date(), endTime: new Date(Date.now() + 86400000) },
    timeRemaining: 86400000
  });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    stats: { totalUsers: 1200, votesCast: 845, turnout: 70.4, flaggedUsers: 2, hasActiveElection: true },
    candidateVotes: candidates,
    hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, votes: Math.floor(Math.random() * 50) })),
    suspiciousActivity: [
      { _id: 's1', voterId: 'VOTER-FRAUD-1', name: 'Suspicious User', email: 'fraud@test.com', loginAttempts: 8, lastLoginIp: '192.168.1.1' }
    ]
  });
});

app.listen(5000, () => {
  console.log('🚀 MOCK SERVER RUNNING on http://localhost:5000');
  console.log('⚠️ Note: This is a temporary mock server because MongoDB is not detected on your system.');
});
