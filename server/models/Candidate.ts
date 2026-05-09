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
  photo: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
  },
  manifesto: {
    type: String,
    default: 'A commitment to progress, equality, and digital transparency for all citizens.'
  },
  experience: {
    type: String,
    default: 'Over 10 years of public service and community leadership.'
  },
  state: {
    type: String,
    default: 'National'
  },
  constituency: {
    type: String,
    default: 'General'
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

export default mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);
