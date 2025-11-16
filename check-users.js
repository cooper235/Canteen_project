import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}, { projection: { email: 1, role: 1, name: 1 } }).limit(15).toArray();
    
    console.log('📋 Users in database:');
    users.forEach(u => {
      console.log(`  • ${u.email} (${u.role}) - ${u.name}`);
    });
    
    console.log(`\n✅ Total users: ${users.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
