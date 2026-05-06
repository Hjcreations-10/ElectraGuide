import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true
  },
  party: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  symbol: {
    type: String, // URL to party symbol
    default: ''
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  voteCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Candidate', candidateSchema);
