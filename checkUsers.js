const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khoojlocal');
    console.log('✅ MongoDB Connected\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Total Users in Database: ${users.length}\n`);

    if (users.length > 0) {
      console.log('👥 Users Found:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   UserType: ${user.userType || 'N/A'}`);
        console.log(`   IsActive: ${user.isActive}`);
        console.log(`   Created: ${user.createdAt}`);
      });

      console.log('\n✅ USERS ARE STORED IN DATABASE');
      console.log('\n🔑 Try logging in with:');
      console.log('   Email: john@example.com');
      console.log('   Password: password123');
    } else {
      console.log('❌ NO USERS FOUND IN DATABASE');
      console.log('\n💡 Run this command to seed the database:');
      console.log('   node server/seedDatabase.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
