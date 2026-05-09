import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Candidate from './models/Candidate.js';
import Election from './models/Election.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/electraguide';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Candidate.deleteMany({});
    await Election.deleteMany({});
    console.log('🧹 Cleared existing data.');

    // Create Admin
    const admin = await User.create({
      name: 'Election Commissioner',
      email: 'admin@electra.gov',
      password: 'Admin@123',
      voterId: 'ADMIN001',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin created: admin@electra.gov / Admin@123');

    // Create Voter
    await User.create({
      name: 'John Citizen',
      email: 'voter@electra.gov',
      password: 'Voter@123',
      voterId: 'VOTER789',
      role: 'voter',
      state: 'Delhi',
      constituency: 'South Delhi',
      isVerified: true
    });
    console.log('✅ Voter created: voter@electra.gov / Voter@123');

    // Create Candidates
    const candidates = [
      { 
        name: 'Arjun Sharma', 
        party: 'Bhartiya Pragati Party', 
        color: '#f97316', 
        description: 'Pioneer in digital infrastructure and decentralized governance.',
        state: 'Delhi',
        constituency: 'South Delhi',
        manifesto: 'Digital transparency in all government sectors, high-speed connectivity for rural areas, and 100% paperless administration.',
        experience: '15 years in public policy and urban planning.',
        photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400'
      },
      { 
        name: 'Sarah Joseph', 
        party: 'Social Justice Front', 
        color: '#10b981', 
        description: 'Advocate for universal healthcare and inclusive social growth.',
        state: 'Kerala',
        constituency: 'Wayanad',
        manifesto: 'Free universal healthcare, primary education reforms, and state-of-the-art agricultural support systems.',
        experience: 'Community activist and former human rights lawyer.',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400'
      },
      { 
        name: 'Vikram Singh', 
        party: 'National Unity Alliance', 
        color: '#6366f1', 
        description: 'Focusing on economic stability and national defense.',
        state: 'Uttar Pradesh',
        constituency: 'Varanasi',
        manifesto: 'Economic deregulation to boost startups, modernization of defense tech, and international trade expansion.',
        experience: 'Retired Army Colonel and economic strategist.',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400'
      }
    ];
    await Candidate.insertMany(candidates);
    console.log('✅ 3 High-Fidelity Candidates seeded.');

    // Create an ongoing election
    const now = new Date();
    const end = new Date();
    end.setHours(now.getHours() + 24); // 24 hours from now

    await Election.create({
      title: 'General Election 2026',
      description: 'National election for the democratic progress of the digital republic.',
      startTime: now,
      endTime: end,
      status: 'ongoing',
      createdBy: admin._id
    });
    console.log('✅ Ongoing election created.');

    console.log('✨ Seeding complete! You can now login.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
