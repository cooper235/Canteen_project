import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    const email = 'b24489@students.iitmandi.ac.in';
    const newPassword = 'password123';

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    // Set the new password (the pre-save hook will hash it)
    user.password = newPassword;
    
    // Save the user (pre-save hook will hash the password)
    await user.save();

    console.log(`✅ Password reset successful for ${email}`);
    console.log(`New password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
