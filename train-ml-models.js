import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function trainModels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all completed orders
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    
    const orders = await ordersCollection
      .find({ status: 'completed' })
      .toArray();
    
    console.log(`Found ${orders.length} completed orders`);
    
    if (orders.length === 0) {
      console.log('❌ No completed orders found to train on');
      process.exit(1);
    }

    // Format orders for ML service
    const formattedOrders = orders.map(o => ({
      student: o.student.toString(),
      items: o.items.map(item => ({
        dish: item.dish.toString()
      })),
      createdAt: o.createdAt
    }));

    // Call ML service training endpoint
    console.log('🤖 Training recommendation model...');
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const trainResponse = await fetch(`${ML_SERVICE_URL}/api/recommendations/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orders: formattedOrders })
    });

    const trainResult = await trainResponse.json();
    console.log('✅ Model training response:', trainResult);

    if (trainResult.success) {
      console.log('\n🎉 Recommendation model trained successfully!');
      console.log(`   - Users: ${trainResult.metrics.users_count}`);
      console.log(`   - Items: ${trainResult.metrics.items_count}`);
      console.log(`   - Popular items: ${trainResult.metrics.popular_items_count}`);
      console.log(`   - Association rules: ${trainResult.metrics.association_rules_count}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

trainModels();
