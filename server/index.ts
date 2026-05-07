import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import votingRoutes from './routes/voting.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/electraguide';

// ── Middleware ────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://electra-guide.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests, please slow down.' }
});
app.use(globalLimiter);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── Routes ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ElectraGuide API is running.',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/admin', adminRoutes);

// ── Error Handling ────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── DB + Start ────────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB connected: ${MONGODB_URI.split('@').pop() || 'local'}`);
    
    // Only start the listener if we are running locally
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 ElectraGuide server running on http://localhost:${PORT}`);
        console.log(`📊 Admin CSV export: http://localhost:${PORT}/api/admin/export/csv`);
      });
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

startServer();

export default app;
