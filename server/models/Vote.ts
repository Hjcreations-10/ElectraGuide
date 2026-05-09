import mongoose from 'mongoose';
import crypto from 'crypto';

const voteSchema = new mongoose.Schema({
  // Anonymised: store hashed userId (SHA-256) instead of raw userId
  userHash: {
    type: String,
    required: true,
    unique: true // One vote per user hash
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Analytics fields
  hour: {
    type: Number // 0-23 for peak hours analysis
  },
  dayOfWeek: {
    type: Number // 0-6 for voting trends
  }
}, { timestamps: true });

// Hash userId before saving
voteSchema.pre('save', function(next) {
  this.hour = new Date().getHours();
  this.dayOfWeek = new Date().getDay();
  next();
});

// Static method to create user hash
voteSchema.statics.hashUserId = function(userId: string): string {
  return crypto.createHash('sha256').update(userId + process.env.VOTE_HASH_SECRET).digest('hex');
};

export default mongoose.models.Vote || mongoose.model('Vote', voteSchema);
