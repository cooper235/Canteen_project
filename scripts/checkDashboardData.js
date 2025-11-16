import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Canteen from '../models/Canteen.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    // Find the canteen for this owner
    const canteen = await Canteen.findOne({ owner: '690d13cc6e59c9db8ee9da2f' }); // The user ID from earlier
    
    if (!canteen) {
      console.log('❌ No canteen found for this owner');
      console.log('Please create a canteen first from the dashboard');
      process.exit(0);
    }

    console.log(`✅ Canteen found: ${canteen.name}`);
    console.log(`   Canteen ID: ${canteen._id}`);
    console.log(`   Average Rating: ${canteen.ratings?.averageRating || 0}`);
    console.log(`   Total Reviews: ${canteen.ratings?.totalReviews || 0}\n`);

    // Check orders
    const orders = await Order.find({ canteen: canteen._id });
    console.log(`📦 Total Orders: ${orders.length}`);
    
    if (orders.length > 0) {
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const completedOrders = orders.filter(o => o.status === 'completed');
      console.log(`   - Pending: ${pendingOrders.length}`);
      console.log(`   - Completed: ${completedOrders.length}`);
      
      // Calculate revenue
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      console.log(`   - Total Revenue: ₹${totalRevenue}\n`);
    } else {
      console.log('   No orders yet\n');
    }

    // Check reviews
    const reviews = await Review.find({ canteen: canteen._id, status: 'approved' });
    console.log(`⭐ Total Reviews: ${reviews.length}`);
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      console.log(`   - Average Rating: ${avgRating.toFixed(1)}`);
      reviews.forEach((r, i) => {
        console.log(`   ${i + 1}. Rating: ${r.rating}/5 - "${r.comment?.substring(0, 50) || 'No comment'}..."`);
      });
    } else {
      console.log('   No reviews yet');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkData();
