import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    // Get all student accounts
    const students = await User.find({ role: 'student' });
    
    console.log(`📚 Total Student Accounts: ${students.length}\n`);

    if (students.length === 0) {
      console.log('❌ No student accounts found');
      console.log('💡 You need to register a student account at http://localhost:3001/register');
      process.exit(0);
    }

    students.forEach((student, i) => {
      console.log(`Student ${i + 1}:`);
      console.log(`  Name: ${student.name}`);
      console.log(`  Email: ${student.email}`);
      console.log(`  Phone: ${student.phone || 'N/A'}`);
      console.log(`  Active: ${student.isActive}`);
      console.log(`  Verified: ${student.isVerified}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkStudents();
