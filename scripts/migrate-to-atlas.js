/**
 * Migration script: local MongoDB → MongoDB Atlas
 * Usage: node scripts/migrate-to-atlas.js
 *
 * Reads every document from each collection on localhost and upserts
 * it into Atlas, preserving the original _id values.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/khoojlocal';
const ATLAS_URI = process.env.MONGODB_URI;

// All model files — import to register their schemas so mongoose knows the collection names
require('../server/models/Admin');
require('../server/models/User');
require('../server/models/Vendor');
require('../server/models/Labour');
require('../server/models/Booking');
require('../server/models/Payment');
require('../server/models/Order');
require('../server/models/Notification');

const COLLECTIONS = [
  'admins',
  'users',
  'vendors',
  'labours',
  'bookings',
  'payments',
  'orders',
  'notifications',
];

async function migrateCollection(localDb, atlasDb, collectionName) {
  const localCol = localDb.collection(collectionName);
  const atlasCol = atlasDb.collection(collectionName);

  const docs = await localCol.find({}).toArray();

  if (docs.length === 0) {
    console.log(`  ${collectionName}: empty, skipping`);
    return;
  }

  let upserted = 0;
  let errors = 0;

  for (const doc of docs) {
    try {
      await atlasCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
      upserted++;
    } catch (err) {
      console.error(`  [ERROR] ${collectionName} _id=${doc._id}: ${err.message}`);
      errors++;
    }
  }

  console.log(`  ${collectionName}: ${upserted} upserted, ${errors} errors (${docs.length} total)`);
}

async function main() {
  if (!ATLAS_URI || ATLAS_URI.includes('localhost')) {
    console.error('MONGODB_URI in .env does not point to Atlas. Aborting.');
    process.exit(1);
  }

  console.log('Connecting to local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();

  console.log('Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

  console.log('\nStarting migration...\n');

  for (const col of COLLECTIONS) {
    await migrateCollection(localConn.db, atlasConn.db, col);
  }

  console.log('\nMigration complete.');
  await localConn.close();
  await atlasConn.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
