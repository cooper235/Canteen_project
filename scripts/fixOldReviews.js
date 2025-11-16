import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Dish from '../models/Dish.js';
import Review from '../models/Review.js';

dotenv.config();

const fixOldReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    // Get all reviews without canteenId
    const reviewsWithoutCanteen = await Review.find({ 
      canteen: null,
      dish: { $ne: null }
    }).populate('dish');

    console.log(`Found ${reviewsWithoutCanteen.length} reviews without canteen\n`);

    if (reviewsWithoutCanteen.length === 0) {
      console.log('✅ All reviews already have canteen ID');
      process.exit(0);
    }

    let updated = 0;
    let failed = 0;

    for (const review of reviewsWithoutCanteen) {
      try {
        if (!review.dish) {
          console.log(`⚠️  Review ${review._id} has no dish, skipping`);
          failed++;
          continue;
        }

        // Get the dish's canteen
        const dish = await Dish.findById(review.dish._id || review.dish);
        
        if (!dish || !dish.canteen) {
          console.log(`⚠️  Review ${review._id}: Dish has no canteen, skipping`);
          failed++;
          continue;
        }

        // Update the review with canteen ID
        review.canteen = dish.canteen;
        await review.save();

        console.log(`✅ Updated review ${review._id} with canteen ${dish.canteen}`);
        updated++;
      } catch (err) {
        console.log(`❌ Error updating review ${review._id}:`, err.message);
        failed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}`);

    // Now recalculate ratings for all canteens
    console.log('\n🔄 Recalculating canteen ratings...\n');

    const canteens = await Canteen.find({});
    
    for (const canteen of canteens) {
      const reviews = await Review.find({ canteen: canteen._id, status: 'approved' });
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        canteen.ratings = {
          averageRating: avgRating,
          totalReviews: reviews.length
        };
        
        await canteen.save();
        console.log(`✅ ${canteen.name}: ${avgRating.toFixed(1)}/5 (${reviews.length} reviews)`);
      } else {
        console.log(`⚠️  ${canteen.name}: No reviews`);
      }
    }

    console.log('\n✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixOldReviews();
