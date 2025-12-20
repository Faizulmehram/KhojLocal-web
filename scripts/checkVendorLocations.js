/**
 * Quick verification script to check vendor locations
 * 
 * Usage: node scripts/checkVendorLocations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../server/models/Vendor');

async function checkLocations() {
  try {
    console.log('🔍 Checking vendor location data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Fetch all vendors
    const allVendors = await Vendor.find({});
    
    // Count vendors with and without locations
    const withLocation = allVendors.filter(v => 
      v.location?.latitude != null && v.location?.longitude != null
    );
    const withoutLocation = allVendors.filter(v => 
      v.location?.latitude == null || v.location?.longitude == null
    );

    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`Total Vendors: ${allVendors.length}`);
    console.log(`With Location: ${withLocation.length} (${Math.round(withLocation.length / allVendors.length * 100)}%)`);
    console.log(`Without Location: ${withoutLocation.length} (${Math.round(withoutLocation.length / allVendors.length * 100)}%)`);
    console.log('='.repeat(60));
    console.log('');

    if (withLocation.length > 0) {
      console.log('✅ Vendors with Locations:');
      console.log('-'.repeat(60));
      withLocation.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.businessName}`);
        console.log(`   Location: ${vendor.address?.fullAddress || 'No address'}`);
        console.log(`   Coords: ${vendor.location.latitude}, ${vendor.location.longitude}`);
        console.log('');
      });
    }

    if (withoutLocation.length > 0) {
      console.log('⚠️  Vendors without Locations:');
      console.log('-'.repeat(60));
      withoutLocation.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.businessName} (${vendor.category})`);
      });
      console.log('');
      console.log('💡 Run "npm run assign-locations" to assign Islamabad locations');
    }

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkLocations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkLocations };
