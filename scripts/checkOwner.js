import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';

dotenv.config();

const checkOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    const email = 'b24489@students.iitmandi.ac.in';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log(`✅ User: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user._id}\n`);

    // Check if user has a canteen
    const canteen = await Canteen.findOne({ owner: user._id });
    
    if (canteen) {
      console.log(`✅ Canteen: ${canteen.name}`);
      console.log(`   Canteen ID: ${canteen._id}`);
      console.log(`   Location: ${typeof canteen.location === 'string' ? canteen.location : JSON.stringify(canteen.location)}`);
      console.log(`   Rating: ${canteen.ratings?.averageRating || 0}/5`);
      console.log(`   Total Reviews: ${canteen.ratings?.totalReviews || 0}`);
    } else {
      console.log('❌ No canteen found for this user');
      console.log('\n📝 Action needed: Create a canteen at http://localhost:3001/manage/canteen');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkOwner();
