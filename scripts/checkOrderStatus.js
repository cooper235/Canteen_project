import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Canteen from '../models/Canteen.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all orders
    const orders = await Order.find({})
      .populate('canteen', 'name')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📊 Total Orders: ${orders.length}\n`);

    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Canteen: ${order.canteen?.name || 'Unknown'}`);
      console.log(`  Student: ${order.student?.email || 'Unknown'}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Total: ₹${order.totalAmount}`);
      console.log(`  Created: ${order.createdAt}`);
      console.log(`  Items: ${order.items.length}`);
      console.log('---');
    });

    // Group by status
    const statusCounts = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    console.log('\n📈 Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkOrders();
