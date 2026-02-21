const mongoose = require('mongoose');
const User = require('./server/models/User');
const Labour = require('./server/models/Labour');
const Vendor = require('./server/models/Vendor');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khoojlocal');
    console.log('✅ MongoDB Connected\n');

    // Check Labour Workers
    const labourWorkers = await Labour.find({}).populate('userId', 'name email');
    console.log(`👷 Total Labour Workers: ${labourWorkers.length}\n`);
    
    if (labourWorkers.length > 0) {
      console.log('Labour Workers:');
      labourWorkers.forEach((labour, index) => {
        console.log(`\n${index + 1}. ${labour.fullName}`);
        console.log(`   Email: ${labour.email}`);
        console.log(`   Phone: ${labour.phone}`);
        console.log(`   Skill: ${labour.skill}`);
        console.log(`   Status: ${labour.verificationStatus}`);
        console.log(`   Approved: ${labour.isApproved}`);
        console.log(`   Created: ${labour.createdAt}`);
      });
    } else {
      console.log('❌ No labour workers found');
    }

    console.log('\n' + '='.repeat(70) + '\n');

    // Check Vendors
    const vendors = await Vendor.find({});
    console.log(`🏪 Total Vendors: ${vendors.length}\n`);
    
    if (vendors.length > 0) {
      console.log('Vendors:');
      vendors.forEach((vendor, index) => {
        console.log(`\n${index + 1}. ${vendor.businessName}`);
        console.log(`   Owner: ${vendor.ownerName}`);
        console.log(`   Email: ${vendor.email}`);
        console.log(`   Category: ${vendor.category}`);
        console.log(`   Status: ${vendor.status}`);
        console.log(`   Active: ${vendor.isActive}`);
        console.log(`   Created: ${vendor.createdAt}`);
      });

      const approvedVendors = vendors.filter(v => v.status === 'Approved');
      const pendingVendors = vendors.filter(v => v.status === 'Pending');
      
      console.log(`\n✅ Approved Vendors: ${approvedVendors.length}`);
      console.log(`⏳ Pending Vendors: ${pendingVendors.length}`);
    } else {
      console.log('❌ No vendors found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkData();
