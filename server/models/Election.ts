import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'paused'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // For Power BI export
  totalVoters: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Virtual: check if election is active
electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'ongoing' && now >= this.startTime && now <= this.endTime;
});

export default mongoose.models.Election || mongoose.model('Election', electionSchema);
