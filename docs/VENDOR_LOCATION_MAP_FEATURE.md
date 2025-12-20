# Vendor Location Map Feature (Mapbox)

## Overview
This feature allows vendors to select their business location on an interactive Mapbox map during registration, and displays their location to customers on the business detail page.

## Technology Stack
- **Mapping Library**: Mapbox GL JS via react-map-gl
- **Geocoding**: Mapbox Geocoding API
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + MongoDB

## Features Implemented

### 1. **Database Schema Updates**
- Added `location` field to Vendor model with:
  - `latitude` (Number)
  - `longitude` (Number)
  - `coordinates` (GeoJSON format for geospatial queries)
  - `type` (defaults to 'Point')
- Added `fullAddress` to address object for complete formatted address

### 2. **Reusable VendorMap Component**
Location: `frontend/components/VendorMap.jsx`

**Features:**
- Interactive Mapbox map with smooth navigation
- Two modes: editable (for registration) and read-only (for customers)
- Address search with live autocomplete (Mapbox Geocoding API)
- Click-to-place marker
- Drag-and-drop marker positioning
- "Use My Current Location" button with geolocation API
- Reverse geocoding to get address from coordinates
- Graceful handling of missing location data
- Custom styled markers
- Navigation controls (zoom, rotate)
- Lazy loading for performance
- Responsive design

**Props:**
```jsx
<VendorMap
  isEditable={boolean}           // Enable/disable editing
  initialLocation={{             // Initial map position
    latitude: number,
    longitude: number,
    address: string
  }}
  onLocationChange={callback}    // Called when location changes
  height={string}                // Custom height (e.g., "400px")
/>
```

### 3. **Vendor Registration Form**
Location: `frontend/pages/Vendor Pages/VendorReg.jsx`

**Updates:**
- Added location selection in Step 1 (Business Information)
- Interactive map after description field
- Location data included in registration payload
- Validation support for location errors

### 4. **Business Detail Page**
Location: `frontend/pages/User Pages/EndUserBsinessDetails.jsx`

**Updates:**
- Map displayed in right sidebar
- Read-only mode for customers
- Shows "Location Not Available" when vendor hasn't set location
- Displays formatted address below map

### 5. **Backend API Updates**
Location: `server/controllers/vendorController.js`

**Updates:**
- `registerVendor`: Accepts and validates location data
  - Validates latitude range (-90 to 90)
  - Validates longitude range (-180 to 180)
  - Stores location in GeoJSON format
  - Returns location in response
- Location data automatically included in profile endpoints

## Setup Instructions

### 1. Install Dependencies
```bash
npm install react-map-gl mapbox-gl
```

### 2. Get Mapbox Access Token
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up for a free account (includes 50,000 free map loads/month)
3. Navigate to "Access Tokens"
4. Copy your default public token, OR create a new one with:
   - Public scopes (default)
   - styles:read, fonts:read, datasets:read

**Note**: Public tokens are safe for client-side use. Mapbox designed them for frontend applications.

### 3. Configure Environment Variables
Create or update `.env` file in the project root:

**For Vite projects (current):**
```bash
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

**For Next.js projects:**
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

**Important:** 
- Vite requires `VITE_` prefix
- Next.js requires `NEXT_PUBLIC_` prefix
- The component supports both automatically

### 4. Update Existing Vendors (Optional)
If you have existing vendors without location data, you can update them:
```javascript
// Migration script or manual update
db.vendors.updateMany(
  { "location.latitude": { $exists: false } },
  { 
    $set: { 
      location: {
        type: "Point",
        coordinates: [],
        latitude: null,
        longitude: null
      }
    }
  }
);
```

## Usage

### For Vendors (Registration)
1. Fill in business information
2. Scroll to "Business Location" section
3. Option 1: Search for address using the search box
4. Option 2: Click "Use My Current Location" button
5. Option 3: Click anywhere on the map to place marker
6. Option 4: Drag the marker to adjust position
7. Selected address displays below the map
8. Continue with registration

### For Customers (Viewing)
1. Navigate to business detail page
2. View location map in right sidebar
3. See formatted address below map
4. If vendor hasn't set location, see "Location Not Available" message

## Technical Details

### Location Data Structure

**Frontend State:**
```javascript
{
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: "123 Main St, San Francisco, CA 94110"
  }
}
```

**Backend Storage (MongoDB):**
```javascript
{
  location: {
    type: "Point",
    coordinates: [-122.4194, 37.7749],  // [longitude, latitude]
    latitude: 37.7749,
    longitude: -122.4194
  },
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94110",
    country: "USA",
    fullAddress: "123 Main St, San Francisco, CA 94110"
  }
}
```

**Note:** GeoJSON format uses [longitude, latitude] order (opposite of typical lat/lng).

### Validation Rules
- Latitude: -90 to 90
- Longitude: -180 to 180
- Location is optional during registration
- Invalid coordinates are rejected with error message

### Performance Optimizations
- Lazy loading of Mapbox GL JS
- Debounced search requests (500ms)
- Efficient re-rendering with React hooks
- Conditional component rendering
- Navigation controls on-demand
- Optimized marker updates

## Future Enhancements

### Potential Features
1. **Distance-based Search**
   - Find vendors within X miles of user's location
   - Sort search results by distance
   - Use MongoDB geospatial queries

2. **Map View for Search Results**
   - Display multiple vendors on one map
   - Cluster markers for nearby vendors
   - Click marker to view vendor details

3. **Directions Integration**
   - "Get Directions" button on business page
   - Open in Google Maps/Apple Maps
   - In-app turn-by-turn directions

4. **Service Area**
   - Define delivery/service radius
   - Visualize coverage area on map
   - Check if customer is in service area

5. **Multiple Locations**
   - Support for vendors with multiple branches
   - Branch selector on detail page
   - Nearest location finder

## Troubleshooting

### Map not loading
- Check if Mapbox token is set in `.env`
- Verify correct prefix: `VITE_` for Vite or `NEXT_PUBLIC_` for Next.js
- Restart development server after adding token
- Check browser console for errors
- Verify token is valid at https://account.mapbox.com/access-tokens/

### Location not saving
- Check backend validation errors
- Verify latitude/longitude ranges
- Check MongoDB connection
- Review server logs

### Geocoding not working
- Ensure token has required scopes
- Check internet connection
- Verify browser permissions for location
- Type at least 3 characters for search

### Token error in production
- For production, add URL restrictions to your token
- Go to Mapbox dashboard → Access Tokens → Token restrictions
- Add allowed URLs (e.g., https://yourdomain.com/*)

## API Reference

### POST /api/auth/vendor/register
**Request Body:**
```json
{
  "businessName": "string",
  "ownerName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "category": "string",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "address": {
    "fullAddress": "string"
  }
}
```

**Response:**
```json
{
  "_id": "string",
  "businessName": "string",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749],
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "token": "string"
}
```

## Testing Checklist

- [ ] Vendor can register with location
- [ ] Vendor can register without location
- [ ] Search box finds addresses correctly
- [ ] Current location button works
- [ ] Click-to-place marker works
- [ ] Drag-and-drop marker works
- [ ] Reverse geocoding displays address
- [ ] Location saves to database correctly
- [ ] Customer can view vendor location
- [ ] "Location Not Available" shows when appropriate
- [ ] Map is responsive on mobile
- [ ] API validation works for invalid coordinates
- [ ] Map loads correctly on slow connections

## License
This feature is part of the KL-Web project.
