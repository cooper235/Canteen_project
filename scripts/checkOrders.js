import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Dish from '../models/Dish.js';
import Order from '../models/Order.js';

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    const canteenId = '6914c722ba4e1246975b06a5';
    const orders = await Order.find({ canteen: canteenId })
      .populate('student', 'name email')
      .populate('items.dish', 'name price')
      .sort({ createdAt: -1 });

    console.log(`📦 Total Orders for canteen: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('No orders found');
      process.exit(0);
    }

    orders.forEach((order, i) => {
      console.log(`Order ${i + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Student: ${order.student?.name || 'Unknown'} (${order.student?.email || 'N/A'})`);
      console.log(`  Total Amount: ₹${order.totalAmount || 0}`);
      console.log(`  Payment: ${order.paymentMethod} - ${order.paymentStatus}`);
      console.log(`  Items: ${order.items?.length || 0}`);
      order.items?.forEach(item => {
        console.log(`    - ${item.dish?.name || 'Unknown'} x ${item.quantity} @ ₹${item.price}`);
      });
      console.log(`  Created: ${order.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkOrders();
