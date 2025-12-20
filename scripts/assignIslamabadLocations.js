/**
 * Script to assign random Islamabad locations to vendors without location data
 * 
 * Usage: node scripts/assignIslamabadLocations.js
 * 
 * This script is safe to run multiple times - it will only update vendors
 * that don't already have location data (idempotent operation).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../server/models/Vendor');

// Real Islamabad locations with accurate coordinates
const ISLAMABAD_LOCATIONS = [
  {
    name: 'F-7 Markaz',
    latitude: 33.7215,
    longitude: 73.0433,
    address: 'F-7 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'F-10 Markaz',
    latitude: 33.6973,
    longitude: 73.0169,
    address: 'F-10 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'Blue Area',
    latitude: 33.7077,
    longitude: 73.0527,
    address: 'Blue Area, Jinnah Avenue, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'G-11 Markaz',
    latitude: 33.6707,
    longitude: 73.0465,
    address: 'G-11 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'G-9 Markaz',
    latitude: 33.6897,
    longitude: 73.0377,
    address: 'G-9 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'I-8 Markaz',
    latitude: 33.6654,
    longitude: 73.0755,
    address: 'I-8 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'Bahria Town Phase 4',
    latitude: 33.5351,
    longitude: 73.1179,
    address: 'Bahria Town Phase 4, Rawalpindi, Pakistan'
  },
  {
    name: 'DHA Phase 2 Islamabad',
    latitude: 33.5236,
    longitude: 73.1392,
    address: 'DHA Phase 2, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'F-6 Markaz',
    latitude: 33.7294,
    longitude: 73.0573,
    address: 'F-6 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'G-10 Markaz',
    latitude: 33.6820,
    longitude: 73.0298,
    address: 'G-10 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'I-10 Markaz',
    latitude: 33.6598,
    longitude: 73.0186,
    address: 'I-10 Markaz, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'Centaurus Mall',
    latitude: 33.7076,
    longitude: 73.0528,
    address: 'Centaurus Mall, Jinnah Avenue, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'Saidpur Village',
    latitude: 33.7391,
    longitude: 73.0725,
    address: 'Saidpur Village, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'Bahria Enclave',
    latitude: 33.5654,
    longitude: 73.1223,
    address: 'Bahria Enclave, Islamabad Capital Territory, Pakistan'
  },
  {
    name: 'PWD Housing Scheme',
    latitude: 33.6552,
    longitude: 73.0961,
    address: 'PWD Housing Scheme, Islamabad Capital Territory, Pakistan'
  }
];

/**
 * Get a random location from the Islamabad locations list
 */
function getRandomLocation() {
  const randomIndex = Math.floor(Math.random() * ISLAMABAD_LOCATIONS.length);
  return ISLAMABAD_LOCATIONS[randomIndex];
}

/**
 * Check if vendor has location data
 */
function hasLocation(vendor) {
  return vendor.location?.latitude != null && vendor.location?.longitude != null;
}

/**
 * Main function to assign locations
 */
async function assignLocations() {
  try {
    console.log('🚀 Starting Islamabad location assignment...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Fetch all vendors
    console.log('📊 Fetching all vendors...');
    const allVendors = await Vendor.find({});
    console.log(`Found ${allVendors.length} total vendors\n`);

    // Filter vendors without location
    const vendorsWithoutLocation = allVendors.filter(vendor => !hasLocation(vendor));
    console.log(`Found ${vendorsWithoutLocation.length} vendors without location data\n`);

    if (vendorsWithoutLocation.length === 0) {
      console.log('✨ All vendors already have location data. Nothing to update!');
      await mongoose.connection.close();
      return;
    }

    console.log('🎲 Assigning random Islamabad locations...\n');
    
    const updates = [];
    const assignmentLog = [];

    // Assign random locations
    for (const vendor of vendorsWithoutLocation) {
      const location = getRandomLocation();
      
      // Update vendor with new location
      vendor.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        latitude: location.latitude,
        longitude: location.longitude
      };
      
      // Update address if not set or update fullAddress
      if (!vendor.address) {
        vendor.address = {};
      }
      vendor.address.fullAddress = location.address;

      updates.push(vendor.save());
      assignmentLog.push({
        vendorId: vendor._id,
        businessName: vendor.businessName,
        assignedLocation: location.name,
        coordinates: `${location.latitude}, ${location.longitude}`
      });
    }

    // Execute all updates
    console.log('💾 Saving updates to database...');
    await Promise.all(updates);
    console.log('✅ All updates saved successfully!\n');

    // Display assignment log
    console.log('📝 Assignment Summary:');
    console.log('=' .repeat(80));
    assignmentLog.forEach((log, index) => {
      console.log(`${index + 1}. ${log.businessName}`);
      console.log(`   ID: ${log.vendorId}`);
      console.log(`   Location: ${log.assignedLocation}`);
      console.log(`   Coordinates: ${log.coordinates}`);
      console.log('-'.repeat(80));
    });

    console.log('\n✨ Location assignment completed successfully!');
    console.log(`Updated ${assignmentLog.length} vendors with Islamabad locations\n`);

    // Close connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    
  } catch (error) {
    console.error('\n❌ Error during location assignment:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  assignLocations()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { assignLocations, ISLAMABAD_LOCATIONS };
