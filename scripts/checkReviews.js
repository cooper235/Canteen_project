import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Review from '../models/Review.js';

dotenv.config();

const checkReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    const canteenId = '6914c722ba4e1246975b06a5';
    
    // Get canteen details
    const canteen = await Canteen.findById(canteenId);
    console.log(`📍 Canteen: ${canteen.name}`);
    console.log(`   Average Rating: ${canteen.ratings?.averageRating || 0}`);
    console.log(`   Total Reviews: ${canteen.ratings?.totalReviews || 0}\n`);

    // Get all reviews for this canteen
    const allReviews = await Review.find({ canteen: canteenId })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📝 Total Reviews in DB: ${allReviews.length}\n`);

    if (allReviews.length === 0) {
      console.log('❌ No reviews found for this canteen');
      process.exit(0);
    }

    allReviews.forEach((review, i) => {
      console.log(`Review ${i + 1}:`);
      console.log(`  ID: ${review._id}`);
      console.log(`  Reviewer: ${review.reviewer?.name || 'Unknown'} (${review.reviewer?.email || 'N/A'})`);
      console.log(`  Rating: ${review.rating}/5`);
      console.log(`  Status: ${review.status}`);
      console.log(`  Title: ${review.title || 'No title'}`);
      console.log(`  Comment: ${review.comment || 'No comment'}`);
      console.log(`  Verified Purchase: ${review.isVerifiedPurchase}`);
      console.log(`  Created: ${review.createdAt}`);
      console.log('');
    });

    // Check approved reviews only
    const approvedReviews = allReviews.filter(r => r.status === 'approved');
    console.log(`✅ Approved Reviews: ${approvedReviews.length}`);
    
    if (approvedReviews.length > 0) {
      const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      console.log(`   Calculated Average: ${avgRating.toFixed(1)}/5`);
      console.log(`\n⚠️  Canteen shows: ${canteen.ratings?.averageRating || 0}/5`);
      
      if (Math.abs(avgRating - (canteen.ratings?.averageRating || 0)) > 0.01) {
        console.log('   ⚠️  MISMATCH! Canteen rating needs to be updated!');
      } else {
        console.log('   ✅ Rating matches!');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkReviews();
