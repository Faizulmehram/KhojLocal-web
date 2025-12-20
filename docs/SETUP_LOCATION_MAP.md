# Quick Start Guide - Vendor Location Map Feature (Mapbox)

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Mapbox Access Token
1. Visit: https://account.mapbox.com/
2. Sign up for a free account (or log in)
3. Go to "Access Tokens" page
4. Copy your default public token, OR
5. Click "Create a token" for a new one with these scopes:
   - ✓ Public scopes (default)
   - ✓ styles:read
   - ✓ fonts:read
   - ✓ datasets:read

### Step 2: Add Token to Environment
1. Open `.env` file in project root
2. Add this line:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```
3. Replace `your_mapbox_token_here` with your actual token
4. For Next.js projects, also add:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```
5. Save the file

### Step 3: Restart the Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ✅ That's it! You're ready to use the map feature.

## 🧪 Test It Out

### Test Vendor Registration
1. Go to: http://localhost:3000/vendor-register
2. Fill in business information
3. Scroll to "Business Location" section
4. Try these actions:
   - 📍 Click "Use My Current Location"
   - 🔍 Search for an address (type at least 3 characters)
   - 🖱️ Click anywhere on the map
   - ↔️ Drag the marker to adjust

### Test Customer View
1. Register a vendor with location
2. View the vendor's business detail page
3. See the map in the right sidebar

## 🎯 Key Features

✅ Interactive Mapbox map during vendor registration  
✅ Address search with autocomplete (Mapbox Geocoding API)  
✅ Click-to-place and drag-to-move markers  
✅ "Use My Current Location" button  
✅ Read-only map display for customers  
✅ Graceful handling of missing locations  
✅ Full address display below map  
✅ Backend validation of coordinates  
✅ Lazy loading for performance  

## 📝 Important Notes

- **Token Security**: Mapbox public tokens are safe to use in client-side code
  - They're designed for frontend use
  - Restrict by URL in production (e.g., yourdomain.com/*)
  
- **Location is Optional**: Vendors can register without selecting a location
  
- **Coordinate Format**: Backend stores in GeoJSON format [longitude, latitude]

- **Browser Permissions**: "Use Current Location" requires user permission

- **Free Tier**: Mapbox offers 50,000 free map loads per month

## 🔧 Troubleshooting

**Map not loading?**
- Check if `.env` has `VITE_MAPBOX_TOKEN` (Vite) or `NEXT_PUBLIC_MAPBOX_TOKEN` (Next.js)
- Restart dev server after adding token
- Check browser console for errors
- Verify token is valid at https://account.mapbox.com/access-tokens/

**"Mapbox Token Missing" error?**
- Ensure environment variable has correct prefix (`VITE_` or `NEXT_PUBLIC_`)
- Clear browser cache and restart server
- Check that .env is in the project root

**"Location Not Available" showing?**
- Normal if vendor hasn't set location yet
- Vendor needs to select location during registration

**Search not working?**
- Type at least 3 characters to trigger search
- Check internet connection
- Verify Mapbox token has geocoding permissions

## 🎨 Map Customization

You can customize the map style by changing the `mapStyle` prop in VendorMap.jsx:

```jsx
mapStyle="mapbox://styles/mapbox/streets-v12"  // Default
mapStyle="mapbox://styles/mapbox/dark-v11"     // Dark theme
mapStyle="mapbox://styles/mapbox/light-v11"    // Light theme
mapStyle="mapbox://styles/mapbox/satellite-v9" // Satellite view
```

## 📚 Full Documentation

See `VENDOR_LOCATION_MAP_FEATURE.md` for complete technical documentation.

## 🚀 Ready to Go!

Your app now has a professional Mapbox location feature! 

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Mapbox Dashboard: https://account.mapbox.com/
