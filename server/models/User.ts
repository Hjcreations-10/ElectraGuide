import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  voterId: {
    type: String,
    required: [true, 'Voter ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin', 'candidate'],
    default: 'voter'
  },
  state: {
    type: String,
    trim: true,
    default: 'National'
  },
  constituency: {
    type: String,
    trim: true,
    default: 'General'
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  // Security fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lastLoginAt: {
    type: Date
  },
  lastLoginIp: {
    type: String
  },
  loginHistory: [{
    ip: String,
    timestamp: Date,
    success: Boolean
  }],
  // OTP
  otp: {
    code: String,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
