const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khoojlocal');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const addPendingVendor = async () => {
  try {
    await connectDB();

    const pendingVendor = await Vendor.create({
      businessName: 'Test Pending Bakery',
      ownerName: 'Test Owner',
      email: 'testpending@example.com',
      password: 'password123',
      phone: '+923001234567',
      category: 'Bakery',
      address: {
        street: '123 Test Street',
        city: 'Islamabad',
        state: 'Islamabad Capital Territory',
        zipCode: '44000',
        country: 'Pakistan',
        fullAddress: '123 Test Street, Islamabad, Pakistan'
      },
      location: {
        type: 'Point',
        coordinates: [73.0479, 33.6844],
        latitude: 33.6844,
        longitude: 73.0479
      },
      description: 'A test bakery waiting for admin approval',
      businessHours: {
        monday: { open: '09:00', close: '18:00', isClosed: false },
        tuesday: { open: '09:00', close: '18:00', isClosed: false },
        wednesday: { open: '09:00', close: '18:00', isClosed: false },
        thursday: { open: '09:00', close: '18:00', isClosed: false },
        friday: { open: '09:00', close: '18:00', isClosed: false },
        saturday: { open: '09:00', close: '18:00', isClosed: false },
        sunday: { open: '09:00', close: '18:00', isClosed: false }
      },
      status: 'Pending', // This is the key - must be Pending
      isActive: true
    });

    console.log('✅ Pending vendor created successfully!');
    console.log('Business Name:', pendingVendor.businessName);
    console.log('Email:', pendingVendor.email);
    console.log('Status:', pendingVendor.status);
    console.log('\nNow login as admin and check /admin/vendors to see this application!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addPendingVendor();
