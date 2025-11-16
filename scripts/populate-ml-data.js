import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Dish from '../models/Dish.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

dotenv.config();

async function populateMLData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing canteens and dishes
    const canteens = await Canteen.find().limit(3);
    if (canteens.length === 0) {
      console.log('❌ No canteens found. Please run seedCanteens.js first');
      process.exit(1);
    }

    const dishes = await Dish.find().limit(10);
    if (dishes.length === 0) {
      console.log('❌ No dishes found. Please add dishes first');
      process.exit(1);
    }

    console.log(`Found ${canteens.length} canteens and ${dishes.length} dishes`);

    // Create test students
    const students = [];
    const studentEmails = [
      'alice@test.com',
      'bob@test.com', 
      'charlie@test.com',
      'diana@test.com',
      'eve@test.com'
    ];

    for (let i = 0; i < studentEmails.length; i++) {
      let student = await User.findOne({ email: studentEmails[i] });
      if (!student) {
        student = await User.create({
          name: `Test Student ${i + 1}`,
          email: studentEmails[i],
          password: 'password123',
          role: 'student',
          phone: `555000${i}`
        });
        console.log(`✅ Created student: ${student.email}`);
      }
      students.push(student);
    }

    // Create diverse orders for collaborative filtering
    const orderPatterns = [
      // Alice likes items 0, 1, 2 (similar taste group 1)
      { student: 0, dishes: [0, 1, 2], quantities: [2, 1, 1] },
      { student: 0, dishes: [0, 1], quantities: [1, 2] },
      { student: 0, dishes: [2, 1], quantities: [1, 1] },
      
      // Bob likes items 0, 1, 2 (similar to Alice - group 1)
      { student: 1, dishes: [0, 1, 2], quantities: [1, 1, 1] },
      { student: 1, dishes: [1, 2], quantities: [2, 1] },
      
      // Charlie likes items 3, 4, 5 (different taste - group 2)
      { student: 2, dishes: [3, 4, 5], quantities: [1, 2, 1] },
      { student: 2, dishes: [3, 4], quantities: [2, 1] },
      { student: 2, dishes: [5, 4], quantities: [1, 1] },
      
      // Diana likes items 3, 4, 5 (similar to Charlie - group 2)
      { student: 3, dishes: [3, 4, 5], quantities: [1, 1, 2] },
      { student: 3, dishes: [4, 5], quantities: [1, 1] },
      
      // Eve likes items 6, 7 (another group)
      { student: 4, dishes: [6, 7], quantities: [1, 1] },
      { student: 4, dishes: [6], quantities: [2] }
    ];

    let orderCount = 0;
    for (const pattern of orderPatterns) {
      const student = students[pattern.student];
      const orderDishes = pattern.dishes.map((dishIdx, i) => ({
        dish: dishes[dishIdx]._id,
        quantity: pattern.quantities[i],
        price: dishes[dishIdx].price
      }));

      const totalAmount = orderDishes.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create orders from past dates for demand forecasting
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      const order = await Order.create({
        student: student._id,
        canteen: dishes[pattern.dishes[0]].canteen,
        items: orderDishes,
        totalAmount: totalAmount,
        status: 'completed',
        createdAt: orderDate,
        updatedAt: orderDate
      });
      orderCount++;
    }
    console.log(`✅ Created ${orderCount} orders for collaborative filtering`);

    // Create reviews with diverse sentiments
    const reviewTexts = {
      positive: [
        "Absolutely delicious! The taste was amazing and portion size was perfect. Highly recommend!",
        "Best food on campus! Fresh ingredients and great flavor. Will order again.",
        "Excellent quality and taste. The spices were perfectly balanced. Love it!",
        "Amazing dish! So tasty and well-prepared. Great value for money.",
        "Superb! Fresh, hot, and delicious. Exceeded my expectations completely."
      ],
      negative: [
        "Terrible experience. Food was cold and tasteless. Very disappointed.",
        "Bad quality. The dish was stale and portions were too small. Not worth it.",
        "Horrible! Food arrived cold and the taste was awful. Will not order again.",
        "Poor service and quality. The food was bland and overpriced.",
        "Disappointing. Expected much better. Food was soggy and not fresh."
      ],
      neutral: [
        "It was okay. Nothing special but not bad either. Average taste.",
        "Decent food. Could be better but acceptable for the price.",
        "Fair enough. Met my expectations but didn't exceed them."
      ]
    };

    let reviewCount = 0;
    
    // Add positive reviews for dishes 0-2
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        await Review.create({
          reviewer: students[j]._id,
          dish: dishes[i]._id,
          canteen: dishes[i].canteen,
          rating: 5,
          title: "Excellent dish!",
          comment: reviewTexts.positive[Math.floor(Math.random() * reviewTexts.positive.length)]
        });
        reviewCount++;
      }
    }

    // Add negative reviews for dishes 3-4
    for (let i = 3; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        await Review.create({
          reviewer: students[j]._id,
          dish: dishes[i]._id,
          canteen: dishes[i].canteen,
          rating: 2,
          title: "Not good",
          comment: reviewTexts.negative[Math.floor(Math.random() * reviewTexts.negative.length)]
        });
        reviewCount++;
      }
    }

    // Add neutral reviews for dishes 5-6
    for (let i = 5; i < 7; i++) {
      await Review.create({
        reviewer: students[0]._id,
        dish: dishes[i]._id,
        canteen: dishes[i].canteen,
        rating: 3,
        title: "It's okay",
        comment: reviewTexts.neutral[Math.floor(Math.random() * reviewTexts.neutral.length)]
      });
      reviewCount++;
    }

    console.log(`✅ Created ${reviewCount} reviews for sentiment analysis`);

    // Add more historical orders for demand forecasting (30 days of data)
    let forecastOrders = 0;
    for (let day = 0; day < 30; day++) {
      const ordersPerDay = Math.floor(Math.random() * 5) + 3; // 3-7 orders per day
      
      for (let o = 0; o < ordersPerDay; o++) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;

        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - day);
        orderDate.setHours(Math.floor(Math.random() * 8) + 9); // 9 AM - 5 PM

        await Order.create({
          student: randomStudent._id,
          canteen: randomDish.canteen,
          items: [{
            dish: randomDish._id,
            quantity: quantity,
            price: randomDish.price
          }],
          totalAmount: randomDish.price * quantity,
          status: 'completed',
          createdAt: orderDate,
          updatedAt: orderDate
        });
        forecastOrders++;
      }
    }
    console.log(`✅ Created ${forecastOrders} historical orders for demand forecasting`);

    console.log('\n🎉 ML Data Population Complete!');
    console.log('\n📊 Summary:');
    console.log(`   - ${students.length} test students`);
    console.log(`   - ${orderCount + forecastOrders} total orders`);
    console.log(`   - ${reviewCount} reviews with sentiment`);
    console.log('\n🧪 Now you can test:');
    console.log(`   1. Login as: ${students[0].email} / password123`);
    console.log(`   2. Go to http://localhost:3000/canteens`);
    console.log(`   3. See personalized recommendations based on order history`);
    console.log(`   4. Check sentiment analysis on dishes with reviews`);
    console.log(`   5. View demand forecasting in ML Analytics dashboard`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateMLData();
