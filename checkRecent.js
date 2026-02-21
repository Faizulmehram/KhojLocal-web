const mongoose = require('mongoose');
const User = require('./server/models/User');
const Labour = require('./server/models/Labour');
const Vendor = require('./server/models/Vendor');
require('dotenv').config();

const checkRecentData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khoojlocal');
    console.log('✅ MongoDB Connected\n');

    // Get labour workers created after seed (today after 22:15)
    const recentLabour = await Labour.find({
      createdAt: { $gt: new Date('2025-12-22T17:15:00.000Z') }
    }).populate('userId', 'name email');
    
    console.log('👷 Labour Workers Created After Seed:');
    if (recentLabour.length > 0) {
      recentLabour.forEach((labour, index) => {
        console.log(`\n${index + 1}. ${labour.fullName}`);
        console.log(`   Email: ${labour.email}`);
        console.log(`   Skill: ${labour.skill}`);
        console.log(`   Status: ${labour.verificationStatus}`);
        console.log(`   Approved: ${labour.isApproved}`);
        console.log(`   Created: ${labour.createdAt}`);
      });
    } else {
      console.log('   None found (only seeded data exists)\n');
    }

    // Get vendors created after seed
    const recentVendors = await Vendor.find({
      createdAt: { $gt: new Date('2025-12-22T17:15:00.000Z') }
    });
    
    console.log('\n🏪 Vendors Created After Seed:');
    if (recentVendors.length > 0) {
      recentVendors.forEach((vendor, index) => {
        console.log(`\n${index + 1}. ${vendor.businessName}`);
        console.log(`   Owner: ${vendor.ownerName}`);
        console.log(`   Email: ${vendor.email}`);
        console.log(`   Category: ${vendor.category}`);
        console.log(`   Status: ${vendor.status}`);
        console.log(`   Approved: ${vendor.isActive}`);
        console.log(`   Created: ${vendor.createdAt}`);
      });
    } else {
      console.log('   None found (only seeded data exists)\n');
    }

    // Check all labour workers regardless of approval status
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Labour Status Breakdown:\n');
    
    const allLabour = await Labour.find({});
    const approved = allLabour.filter(l => l.verificationStatus === 'approved');
    const pending = allLabour.filter(l => l.verificationStatus === 'pending');
    const rejected = allLabour.filter(l => l.verificationStatus === 'rejected');
    
    console.log(`   Total: ${allLabour.length}`);
    console.log(`   ✅ Approved: ${approved.length}`);
    console.log(`   ⏳ Pending: ${pending.length}`);
    console.log(`   ❌ Rejected: ${rejected.length}`);

    if (pending.length > 0) {
      console.log('\n   Pending Labour Workers:');
      pending.forEach(l => {
        console.log(`     - ${l.fullName} (${l.skill})`);
      });
    }

    console.log('\n📊 Vendor Status Breakdown:\n');
    
    const allVendors = await Vendor.find({});
    const approvedVendors = allVendors.filter(v => v.status === 'Approved');
    const pendingVendors = allVendors.filter(v => v.status === 'Pending');
    const rejectedVendors = allVendors.filter(v => v.status === 'Rejected');
    
    console.log(`   Total: ${allVendors.length}`);
    console.log(`   ✅ Approved: ${approvedVendors.length}`);
    console.log(`   ⏳ Pending: ${pendingVendors.length}`);
    console.log(`   ❌ Rejected: ${rejectedVendors.length}`);

    if (pendingVendors.length > 0) {
      console.log('\n   Pending Vendors (need admin approval to show on frontend):');
      pendingVendors.forEach(v => {
        console.log(`     - ${v.businessName} (${v.category})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkRecentData();
