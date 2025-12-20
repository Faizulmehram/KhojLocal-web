# Islamabad Location Assignment Script

## Overview
This script assigns random Islamabad locations to vendors that don't have location data in the database. It's designed for development and testing purposes.

## Features
- ✅ **15 Real Islamabad Locations** with accurate coordinates
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Preserves Existing Data** - Never overwrites existing locations
- ✅ **Batch Processing** - Updates all vendors efficiently
- ✅ **Detailed Logging** - Shows exactly what was updated
- ✅ **Error Handling** - Fails gracefully with clear messages

## Locations Included

| Location | Coordinates | Area |
|----------|-------------|------|
| F-7 Markaz | 33.7215, 73.0433 | Central Islamabad |
| F-10 Markaz | 33.6973, 73.0169 | Central Islamabad |
| Blue Area | 33.7077, 73.0527 | Business District |
| G-11 Markaz | 33.6707, 73.0465 | Residential |
| G-9 Markaz | 33.6897, 73.0377 | Residential |
| I-8 Markaz | 33.6654, 73.0755 | Residential |
| Bahria Town Phase 4 | 33.5351, 73.1179 | Gated Community |
| DHA Phase 2 | 33.5236, 73.1392 | Gated Community |
| F-6 Markaz | 33.7294, 73.0573 | Central Islamabad |
| G-10 Markaz | 33.6820, 73.0298 | Residential |
| I-10 Markaz | 33.6598, 73.0186 | Residential |
| Centaurus Mall | 33.7076, 73.0528 | Shopping Area |
| Saidpur Village | 33.7391, 73.0725 | Historic Area |
| Bahria Enclave | 33.5654, 73.1223 | Gated Community |
| PWD Housing Scheme | 33.6552, 73.0961 | Residential |

## Usage

### Quick Run
```bash
node scripts/assignIslamabadLocations.js
```

### From Project Root
```bash
npm run assign-locations
```

## How It Works

1. **Connects to MongoDB** using connection string from `.env`
2. **Fetches all vendors** from the database
3. **Filters vendors** without location data:
   - Checks if `vendor.location.latitude` is null/undefined
   - Checks if `vendor.location.longitude` is null/undefined
4. **Randomly assigns** one of 15 Islamabad locations to each vendor
5. **Updates vendor record** with:
   - `location.latitude`
   - `location.longitude`
   - `location.coordinates` (GeoJSON format)
   - `address.fullAddress`
6. **Saves all changes** in batch
7. **Logs summary** of all updates

## What Gets Updated

For each vendor without location, the script sets:

```javascript
{
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],  // GeoJSON format
    latitude: 33.7215,                   // Decimal degrees
    longitude: 73.0433                   // Decimal degrees
  },
  address: {
    ...existingAddressData,
    fullAddress: "F-7 Markaz, Islamabad Capital Territory, Pakistan"
  }
}
```

## Safety Features

### Idempotent Operation
```javascript
// Running the script multiple times is safe:
// 1st run: Updates 10 vendors
// 2nd run: "All vendors already have location data. Nothing to update!"
// 3rd run: Same as 2nd run
```

### Checks Before Update
```javascript
function hasLocation(vendor) {
  return vendor.location?.latitude != null 
      && vendor.location?.longitude != null;
}
// Only updates if BOTH latitude AND longitude are missing
```

### No Overwrites
Existing vendor locations are NEVER modified. The script only fills in missing data.

## Example Output

```
🚀 Starting Islamabad location assignment...

📡 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Fetching all vendors...
Found 25 total vendors

Found 12 vendors without location data

🎲 Assigning random Islamabad locations...

💾 Saving updates to database...
✅ All updates saved successfully!

📝 Assignment Summary:
================================================================================
1. The Artisan Bakery
   ID: 507f1f77bcf86cd799439011
   Location: F-7 Markaz
   Coordinates: 33.7215, 73.0433
--------------------------------------------------------------------------------
2. Sunrise Cafe
   ID: 507f191e810c19729de860ea
   Location: Blue Area
   Coordinates: 33.7077, 73.0527
--------------------------------------------------------------------------------
... (and so on)

✨ Location assignment completed successfully!
Updated 12 vendors with Islamabad locations

🔒 Database connection closed

✅ Script completed successfully!
```

## Adding to package.json

Add this to your `scripts` section in `package.json`:

```json
{
  "scripts": {
    "assign-locations": "node scripts/assignIslamabadLocations.js"
  }
}
```

Then run with:
```bash
npm run assign-locations
```

## Verification

After running the script, verify in MongoDB:

```javascript
// Check updated vendors
db.vendors.find({ 
  "location.latitude": { $ne: null } 
}).pretty()

// Count vendors with locations
db.vendors.countDocuments({ 
  "location.latitude": { $ne: null } 
})

// View specific location
db.vendors.findOne({ 
  businessName: "Your Vendor Name" 
})
```

## Testing with Mapbox

After running the script, test the locations:

1. Go to vendor registration page
2. Check that the map loads at Islamabad
3. View vendor detail pages
4. Verify markers appear at correct Islamabad locations

## Customization

### Adding More Locations

Edit `ISLAMABAD_LOCATIONS` array in the script:

```javascript
const ISLAMABAD_LOCATIONS = [
  // ... existing locations
  {
    name: 'Your Location Name',
    latitude: 33.1234,
    longitude: 73.5678,
    address: 'Full Address Here'
  }
];
```

### Filtering Specific Vendors

Modify the filter logic:

```javascript
// Only update specific category
const vendorsWithoutLocation = allVendors.filter(vendor => 
  !hasLocation(vendor) && vendor.category === 'Restaurant'
);

// Only update approved vendors
const vendorsWithoutLocation = allVendors.filter(vendor => 
  !hasLocation(vendor) && vendor.status === 'Approved'
);
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify `MONGODB_URI` in `.env` file
- Ensure connection string is correct

### "No vendors found"
- Check if vendors exist: `db.vendors.count()`
- Verify database name in connection string
- Ensure you're connected to correct database

### "All vendors already have locations"
- This is normal if script was already run
- To test again, manually remove locations from MongoDB:
  ```javascript
  db.vendors.updateMany(
    {},
    { $unset: { "location": "" } }
  )
  ```

## Important Notes

⚠️ **Development Only**: This script is for development/testing. Don't use in production without review.

⚠️ **Backup First**: Consider backing up your database before running:
```bash
mongodump --db khoojlocal --out backup/
```

✅ **Safe to Run**: The script is designed to be safe and idempotent.

## Related Files

- `server/models/Vendor.js` - Vendor schema with location fields
- `frontend/components/VendorMap.jsx` - Map component that displays locations
- `MAPBOX_INTEGRATION_GUIDE.md` - Mapbox implementation details

## Support

If you encounter issues:
1. Check MongoDB connection
2. Verify `.env` configuration
3. Review script output for specific errors
4. Check MongoDB logs
