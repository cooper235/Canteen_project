import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Dish from '../models/Dish.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

dotenv.config();

const DUMMY_REVIEWS = [
  { text: "The food was absolutely delicious and fresh! Great service and wonderful taste.", rating: 5, sentiment: "positive" },
  { text: "Amazing quality! Loved the taste and presentation. Highly recommended!", rating: 5, sentiment: "positive" },
  { text: "Good food, reasonable prices. Will order again.", rating: 4, sentiment: "positive" },
  { text: "Not bad, decent taste but could be better.", rating: 3, sentiment: "neutral" },
  { text: "Terrible food, cold and tasteless. Very disappointed with the quality.", rating: 1, sentiment: "negative" },
  { text: "Poor service, food was stale and overpriced.", rating: 2, sentiment: "negative" },
  { text: "Excellent! Best canteen food I've had. Fresh and tasty.", rating: 5, sentiment: "positive" },
  { text: "Pretty good overall. Nice variety of dishes.", rating: 4, sentiment: "positive" },
  { text: "Average food, nothing special but okay for the price.", rating: 3, sentiment: "neutral" },
  { text: "Delicious and affordable! Great value for money.", rating: 5, sentiment: "positive" }
];

const DISH_NAMES = [
  { name: "Veg Biryani", category: "lunch", price: 80, description: "Aromatic basmati rice with mixed vegetables" },
  { name: "Chicken Curry", category: "lunch", price: 120, description: "Spicy chicken curry with traditional spices" },
  { name: "Paneer Tikka", category: "snacks", price: 100, description: "Grilled cottage cheese with spices" },
  { name: "Dal Tadka", category: "lunch", price: 60, description: "Yellow lentils tempered with spices" },
  { name: "Masala Dosa", category: "breakfast", price: 70, description: "Crispy rice crepe with potato filling" },
  { name: "Butter Naan", category: "lunch", price: 30, description: "Soft butter naan bread" },
  { name: "Veg Fried Rice", category: "lunch", price: 90, description: "Mixed vegetable fried rice" },
  { name: "Chole Bhature", category: "breakfast", price: 85, description: "Chickpea curry with fried bread" },
  { name: "Idli Sambar", category: "breakfast", price: 50, description: "Steamed rice cakes with lentil soup" },
  { name: "Coffee", category: "beverages", price: 30, description: "Hot freshly brewed coffee" },
  { name: "Samosa", category: "snacks", price: 20, description: "Crispy fried pastry with spiced filling" },
  { name: "Ice Cream", category: "desserts", price: 40, description: "Delicious ice cream" }
];

async function populateDummyData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing test data...');
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Review.deleteMany({});
    console.log('✓ Cleared test data\n');

    // 1. Create Students
    console.log('Creating student users...');
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@test.com`,
        password: 'password123',
        role: 'student',
        phoneNumber: `99999999${i}0`
      });
      students.push(student);
      console.log(`  ✓ Created: ${student.name} (${student.email})`);
    }

    // 2. Create Canteen Owner
    console.log('\nCreating canteen owner...');
    const owner = await User.create({
      name: 'Canteen Owner',
      email: 'owner@test.com',
      password: 'password123',
      role: 'canteen_owner',
      phoneNumber: '9999999999'
    });
    console.log(`  ✓ Created: ${owner.name} (${owner.email})`);

    // 3. Create Canteen
    console.log('\nCreating canteen...');
    const canteen = await Canteen.create({
      name: 'Test Canteen',
      owner: owner._id,
      location: {
        address: 'Main Building, Ground Floor',
        coordinates: [77.5946, 12.9716]
      },
      operatingHours: {
        openTime: '08:00',
        closeTime: '20:00'
      },
      contactInfo: {
        phone: '9999999999',
        email: 'canteen@test.com'
      },
      description: 'A test canteen with delicious food',
      isActive: true
    });
    console.log(`  ✓ Created: ${canteen.name}`);

    // 4. Create Dishes
    console.log('\nCreating dishes...');
    const dishes = [];
    for (const dishData of DISH_NAMES) {
      const dish = await Dish.create({
        name: dishData.name,
        description: dishData.description,
        price: dishData.price,
        category: dishData.category,
        canteen: canteen._id,
        isAvailable: true,
        preparationTime: Math.floor(Math.random() * 20) + 10,
        isVegetarian: !dishData.name.toLowerCase().includes('chicken'),
        isVegan: false,
        isSpicy: ['curry', 'tikka', 'biryani'].some(word => dishData.name.toLowerCase().includes(word)),
        nutritionInfo: {
          calories: Math.floor(Math.random() * 300) + 200,
          protein: Math.floor(Math.random() * 20) + 5,
          carbs: Math.floor(Math.random() * 50) + 20,
          fat: Math.floor(Math.random() * 15) + 5
        }
      });
      dishes.push(dish);
      console.log(`  ✓ Created: ${dish.name} - ₹${dish.price}`);
    }

    // 5. Create Orders (for recommendations training)
    console.log('\nCreating order history...');
    const orderCount = 30; // Create 30 orders for good training data
    const orders = [];
    
    for (let i = 0; i < orderCount; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const selectedDishes = [];
      
      for (let j = 0; j < numItems; j++) {
        const dish = dishes[Math.floor(Math.random() * dishes.length)];
        selectedDishes.push({
          dish: dish._id,
          quantity: Math.floor(Math.random() * 2) + 1,
          price: dish.price
        });
      }

      const totalAmount = selectedDishes.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = await Order.create({
        student: student._id,
        canteen: canteen._id,
        items: selectedDishes,
        totalAmount: totalAmount,
        status: 'completed',
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        deliveryType: 'pickup',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });
      orders.push(order);
    }
    console.log(`  ✓ Created ${orderCount} orders`);

    // 6. Create Reviews with Sentiment Analysis
    console.log('\nCreating reviews with sentiments...');
    const reviews = [];
    
    for (let i = 0; i < Math.min(DUMMY_REVIEWS.length, dishes.length); i++) {
      const reviewData = DUMMY_REVIEWS[i];
      const student = students[Math.floor(Math.random() * students.length)];
      const dish = dishes[i];
      
      // Analyze sentiment using ML service
      let sentimentData = {
        sentiment: reviewData.sentiment,
        sentimentScore: reviewData.rating === 5 ? 0.8 : reviewData.rating === 1 ? -0.8 : 0,
        sentimentKeywords: []
      };

      try {
        const axios = (await import('axios')).default;
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        const response = await axios.post(`${ML_SERVICE_URL}/api/sentiment/analyze`, 
          { text: reviewData.text },
          { timeout: 5000 }
        );
        
        if (response.data.success) {
          sentimentData = {
            sentiment: response.data.sentiment.sentiment,
            sentimentScore: response.data.sentiment.score,
            sentimentKeywords: response.data.sentiment.keywords || []
          };
        }
      } catch (error) {
        console.log(`    ⚠ ML sentiment analysis failed for review, using default`);
      }

      const review = await Review.create({
        reviewer: student._id,
        dish: dish._id,
        canteen: canteen._id,
        rating: reviewData.rating,
        title: `Review for ${dish.name}`,
        comment: reviewData.text,
        isVerifiedPurchase: true,
        status: 'approved',
        sentiment: sentimentData.sentiment,
        sentimentScore: sentimentData.sentimentScore,
        sentimentKeywords: sentimentData.sentimentKeywords
      });
      reviews.push(review);
      console.log(`  ✓ Review for ${dish.name}: ${review.sentiment} (score: ${review.sentimentScore})`);

      // Update dish ratings
      const dishReviews = await Review.find({ dish: dish._id, status: 'approved' });
      const avgRating = dishReviews.reduce((sum, r) => sum + r.rating, 0) / dishReviews.length;
      await Dish.findByIdAndUpdate(dish._id, {
        'ratings.averageRating': avgRating,
        'ratings.totalReviews': dishReviews.length
      });
    }

    // 7. Train Recommendation Model
    console.log('\nTraining recommendation model...');
    try {
      const axios = (await import('axios')).default;
      
      // Prepare order data for training
      const orderData = await Order.find({ status: 'completed' })
        .populate('items.dish')
        .lean();
      
      const trainingData = orderData.map(order => ({
        student: order.student.toString(),
        items: order.items.map(item => ({
          dish: item.dish._id.toString(),
          quantity: item.quantity
        })),
        createdAt: order.createdAt
      }));

      const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
      const response = await axios.post(`${ML_SERVICE_URL}/api/recommendations/train`,
        { orders: trainingData },
        { timeout: 30000 }
      );

      if (response.data.success) {
        console.log(`  ✓ Model trained successfully`);
        console.log(`    - Users: ${response.data.metrics.users_count}`);
        console.log(`    - Items: ${response.data.metrics.items_count}`);
      }
    } catch (error) {
      console.log(`  ⚠ Recommendation training failed: ${error.message}`);
    }

    console.log('\n========================================');
    console.log('✅ DUMMY DATA CREATED SUCCESSFULLY!');
    console.log('========================================\n');

    console.log('📊 Summary:');
    console.log(`  • Students: ${students.length}`);
    console.log(`  • Canteen Owner: 1`);
    console.log(`  • Canteens: 1`);
    console.log(`  • Dishes: ${dishes.length}`);
    console.log(`  • Orders: ${orderCount}`);
    console.log(`  • Reviews: ${reviews.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('  Students:');
    for (let i = 1; i <= 5; i++) {
      console.log(`    - student${i}@test.com / password123`);
    }
    console.log('  Owner:');
    console.log('    - owner@test.com / password123');

    console.log('\n🌐 Next Steps:');
    console.log('  1. Start frontend: cd models/canteen-frontend && npm run dev');
    console.log('  2. Login with any student account');
    console.log('  3. Check ML features:');
    console.log('     • View dishes - see sentiment badges on reviews');
    console.log('     • Homepage - see personalized recommendations');
    console.log('     • Login as owner - see demand forecasting dashboard');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

populateDummyData();
