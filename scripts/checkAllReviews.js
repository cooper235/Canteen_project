import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Dish from '../models/Dish.js';
import Review from '../models/Review.js';

dotenv.config();

const checkAllReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    // Get ALL reviews
    const allReviews = await Review.find({})
      .populate('reviewer', 'name email')
      .populate('canteen', 'name')
      .populate('dish', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📝 Total Reviews in entire DB: ${allReviews.length}\n`);

    if (allReviews.length === 0) {
      console.log('❌ No reviews found in the database at all');
      console.log('\n💡 The review submission might have failed or the review route is not working');
      process.exit(0);
    }

    allReviews.forEach((review, i) => {
      console.log(`Review ${i + 1}:`);
      console.log(`  ID: ${review._id}`);
      console.log(`  Reviewer: ${review.reviewer?.name || 'Unknown'} (${review.reviewer?.email || 'N/A'})`);
      console.log(`  Canteen: ${review.canteen?.name || 'N/A'} (ID: ${review.canteen?._id || 'N/A'})`);
      console.log(`  Dish: ${review.dish?.name || 'N/A'}`);
      console.log(`  Rating: ${review.rating}/5`);
      console.log(`  Status: ${review.status}`);
      console.log(`  Comment: ${review.comment?.substring(0, 50) || 'No comment'}...`);
      console.log(`  Created: ${review.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkAllReviews();
