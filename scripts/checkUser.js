import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    const email = 'b24489@students.iitmandi.ac.in';

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} NOT FOUND`);
      console.log('\nSearching for similar emails...');
      const allUsers = await User.find({}).select('email name role');
      console.log(`\nFound ${allUsers.length} users:`);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) [${u.role}]`);
      });
    } else {
      console.log(`✅ User found!`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Verified: ${user.isVerified}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUser();
