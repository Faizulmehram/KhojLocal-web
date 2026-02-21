const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');

async function fixOrderIndex() {
  try {
    await connectDB();
    
    console.log('Dropping orderNumber index from orders collection...');
    await mongoose.connection.db.collection('orders').dropIndex('orderNumber_1');
    console.log('✅ Index dropped successfully');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 27) {
      console.log('Index does not exist - already fixed!');
      process.exit(0);
    }
    console.error('Error:', error);
    process.exit(1);
  }
}

fixOrderIndex();
