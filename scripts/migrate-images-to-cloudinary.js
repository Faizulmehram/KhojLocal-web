/**
 * Migration: local uploads/ images → Cloudinary, then patch Atlas DB records.
 * Usage: node scripts/migrate-images-to-cloudinary.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('../server/config/cloudinary');

const ATLAS_URI = process.env.MONGODB_URI;
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

// Field → Cloudinary folder mapping (mirrors uploadMiddleware.js)
const LOCAL_TO_CLOUD_FOLDER = {
  'labour/cnic': 'khoojlocal/labour/cnic',
  'labour/selfie': 'khoojlocal/labour/selfie',
};

// Upload one file; return secure_url or null on error
async function uploadFile(localPath, folder) {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    return result.secure_url;
  } catch (err) {
    console.error(`  [UPLOAD ERROR] ${localPath}: ${err.message}`);
    return null;
  }
}

// Build a map: local filename → Cloudinary secure_url
async function uploadAllLocalImages() {
  const urlMap = {};

  for (const [relFolder, cloudFolder] of Object.entries(LOCAL_TO_CLOUD_FOLDER)) {
    const dir = path.join(UPLOADS_ROOT, relFolder);
    if (!fs.existsSync(dir)) {
      console.log(`  Skipping ${relFolder} (folder not found)`);
      continue;
    }

    const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`  ${relFolder}: ${files.length} file(s)`);

    for (const file of files) {
      const localPath = path.join(dir, file);
      // Old URL format stored in DB: /uploads/labour/cnic/<file>
      const oldUrl = `/uploads/${relFolder}/${file}`;
      process.stdout.write(`    Uploading ${file} ... `);
      const newUrl = await uploadFile(localPath, cloudFolder);
      if (newUrl) {
        urlMap[oldUrl] = newUrl;
        console.log('OK');
      } else {
        console.log('FAILED');
      }
    }
  }

  return urlMap;
}

// Patch Labour documents in Atlas
async function patchLabourDocs(db, urlMap) {
  const col = db.collection('labours');
  const docs = await col.find({
    $or: [
      { 'documents.cnicFront': { $exists: true } },
      { 'documents.cnicBack': { $exists: true } },
      { 'documents.selfie': { $exists: true } },
    ],
  }).toArray();

  let patched = 0;
  for (const doc of docs) {
    const update = {};
    for (const field of ['cnicFront', 'cnicBack', 'selfie']) {
      const old = doc.documents?.[field];
      if (old && urlMap[old]) {
        update[`documents.${field}`] = urlMap[old];
      }
    }
    if (Object.keys(update).length) {
      await col.updateOne({ _id: doc._id }, { $set: update });
      patched++;
    }
  }
  console.log(`  labours: ${patched}/${docs.length} record(s) updated`);
}

async function main() {
  if (!ATLAS_URI || ATLAS_URI.includes('localhost')) {
    console.error('MONGODB_URI must point to Atlas. Aborting.');
    process.exit(1);
  }

  console.log('=== Step 1: Upload local images to Cloudinary ===');
  const urlMap = await uploadAllLocalImages();
  const uploaded = Object.keys(urlMap).length;
  console.log(`\nUploaded ${uploaded} image(s).\n`);

  if (uploaded === 0) {
    console.log('Nothing to patch in DB. Done.');
    return;
  }

  console.log('=== Step 2: Patch Atlas DB records ===');
  const conn = await mongoose.createConnection(ATLAS_URI).asPromise();
  await patchLabourDocs(conn.db, urlMap);
  await conn.close();

  console.log('\nMigration complete. You may now delete the local uploads/ folder.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
