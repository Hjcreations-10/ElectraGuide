import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import User from './models/User.js';
import Candidate from './models/Candidate.js';
import Vote from './models/Vote.js';
import Election from './models/Election.js';

dotenv.config();

const seedVotes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/electraguide');
    console.log('Connected to DB...');

    // Clear existing votes
    await Vote.deleteMany({});
    
    // Find or create an election
    let election = await Election.findOne({ status: 'ongoing' });
    if (!election) {
      election = await Election.create({
        title: 'Simulated General Election 2026',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'ongoing',
        totalVoters: 1000
      });
    }

    const candidates = await Candidate.find({ isActive: true });
    
    // Create 50 dummy voters if they don't exist
    let voters = await User.find({ role: 'voter' });
    if (voters.length < 50) {
      console.log('Creating 50 dummy voters for better analytics...');
      for (let i = 0; i < 50; i++) {
        await User.create({
          name: `Dummy Voter ${i}`,
          email: `dummy${i}@electra.gov`,
          password: 'Password@123',
          voterId: `IND-${100000 + i}`,
          role: 'voter',
          isVerified: true
        }).catch(() => {}); // Skip if already exists
      }
      voters = await User.find({ role: 'voter' });
    }

    if (candidates.length === 0 || voters.length === 0) {
      console.log('Error: No candidates or voters found.');
      process.exit(1);
    }

    // Reset candidate vote counts
    for (const c of candidates) {
      c.voteCount = 0;
      await c.save();
    }

    console.log(`Casting simulated votes for ${voters.length} voters...`);

    const votes = [];
    const hashSecret = process.env.VOTE_HASH_SECRET || 'simulated_secret';

    for (const voter of voters) {
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      
      // Random date in the last 24 hours to show hourly trends
      const randomDate = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      
      const userHash = crypto.createHash('sha256').update(voter._id.toString() + hashSecret).digest('hex');

      votes.push({
        userHash,
        candidateId: randomCandidate._id,
        electionId: election._id,
        timestamp: randomDate,
        hour: randomDate.getHours(),
        dayOfWeek: randomDate.getDay()
      });

      // Increment candidate vote count
      randomCandidate.voteCount += 1;
      await randomCandidate.save();
      
      // Mark voter as voted
      voter.hasVoted = true;
      await voter.save();
    }

    await Vote.insertMany(votes);
    console.log(`✅ Successfully simulated ${voters.length} votes!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedVotes();
