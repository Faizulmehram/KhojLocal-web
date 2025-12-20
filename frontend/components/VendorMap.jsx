import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, Maximize2, Minimize2, X } from 'lucide-react';

const defaultCenter = {
  latitude: 37.7749, // San Francisco
  longitude: -122.4194,
  zoom: 13
};

/**
 * VendorMap Component - Mapbox Implementation
 * 
 * A reusable map component for displaying and selecting vendor locations
 * 
 * Props:
 * - isEditable (boolean): Whether the map allows location selection
 * - initialLocation (object): { latitude, longitude, address }
 * - onLocationChange (function): Callback when location is updated
 * - height (string): Custom height (e.g., '500px')
 */
export default function VendorMap({ 
  isEditable = false, 
  initialLocation = null,
  onLocationChange = () => {},
  height = '400px'
}) {
  const [viewState, setViewState] = useState({
    latitude: initialLocation?.latitude || defaultCenter.latitude,
    longitude: initialLocation?.longitude || defaultCenter.longitude,
    zoom: initialLocation?.latitude ? 15 : defaultCenter.zoom
  });
  
  const [markerPosition, setMarkerPosition] = useState(
    initialLocation?.latitude && initialLocation?.longitude
      ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude }
      : null
  );
  
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Get Mapbox token from environment variable
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (longitude, latitude) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    }
  };

  // Search for address
  const searchAddress = async (query) => {
    if (!query.trim() || !isEditable) return;
    
    setIsSearching(true);
    try {
      // Add Pakistan country code and proximity to bias results
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=pk&proximity=73.0479,33.6844&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchAddress(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle map click
  const onMapClick = useCallback(async (event) => {
    if (!isEditable) return;
    
    const { lng, lat } = event.lngLat;
    const newPosition = { longitude: lng, latitude: lat };
    
    setMarkerPosition(newPosition);
    setViewState(prev => ({ ...prev, longitude: lng, latitude: lat }));
    
    // Get address for the clicked location
    const formattedAddress = await reverseGeocode(lng, lat);
    setAddress(formattedAddress);
    
    onLocationChange({
      latitude: lat,
      longitude: lng,
      address: formattedAddress
    });
  }, [isEditable, mapboxToken, onLocationChange]);

  // Handle marker drag
  const onMarkerDragEnd = useCallback(async (event) => {
    if (!isEditable) return;
    
    const { lng, lat } = event.lngLat;
    const newPosition = { longitude: lng, latitude: lat };
    
    setMarkerPosition(newPosition);
    setViewState(prev => ({ ...prev, longitude: lng, latitude: lat }));
    
    // Get address for the new position
    const formattedAddress = await reverseGeocode(lng, lat);
    setAddress(formattedAddress);
    
    onLocationChange({
      latitude: lat,
      longitude: lng,
      address: formattedAddress
    });
  }, [isEditable, mapboxToken, onLocationChange]);

  // Handle search result selection
  const handleSelectPlace = async (place) => {
    const [lng, lat] = place.center;
    const newPosition = { longitude: lng, latitude: lat };
    
    setMarkerPosition(newPosition);
    setViewState({ longitude: lng, latitude: lat, zoom: 15 });
    setAddress(place.place_name);
    setSearchQuery('');
    setSearchResults([]);
    
    onLocationChange({
      latitude: lat,
      longitude: lng,
      address: place.place_name
    });
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation && isEditable) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = { latitude, longitude };
          
          setMarkerPosition(newPosition);
          setViewState({ latitude, longitude, zoom: 15 });
          
          // Get address
          const formattedAddress = await reverseGeocode(longitude, latitude);
          setAddress(formattedAddress);
          
          onLocationChange({
            latitude,
            longitude,
            address: formattedAddress
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  if (!markerPosition && !isEditable) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-xl flex flex-col items-center justify-center p-8 text-gray-500"
        style={{ height }}
      >
        <MapPin className="h-12 w-12 mb-3 text-gray-400" />
        <p className="font-semibold">Location Not Available</p>
        <p className="text-sm mt-1">This vendor hasn't set their location yet</p>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div 
        className="w-full bg-red-50 rounded-xl flex flex-col items-center justify-center p-8 text-red-600 border border-red-200"
        style={{ height }}
      >
        <MapPin className="h-12 w-12 mb-3" />
        <p className="font-semibold">Mapbox Token Missing</p>
        <p className="text-sm mt-1 text-center">Please add VITE_MAPBOX_TOKEN to your .env file</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full" style={{ height }}>
        {isEditable && (
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search for an address..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition"
                      onClick={() => handleSelectPlace(result)}
                    >
                      <p className="text-sm font-medium text-gray-900">{result.text}</p>
                      <p className="text-xs text-gray-500">{result.place_name}</p>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
            >
              Use My Current Location
            </button>
            
            <p className="text-xs text-gray-500 italic">
              Click on the map or drag the marker to set your location
            </p>
          </div>
        )}
        
        <div className="rounded-xl overflow-hidden border border-gray-200 relative" style={{ height }} ref={mapContainerRef}>
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 z-10 bg-white hover:bg-gray-100 p-2 rounded-lg shadow-md border border-gray-200 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 text-gray-700" />
            ) : (
              <Maximize2 className="h-5 w-5 text-gray-700" />
            )}
          </button>

          {/* Selected Location Display - Inside map container */}
          {isEditable && address && (
            <div className="absolute bottom-3 left-3 right-3 z-10 p-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-md">
              <p className="text-xs font-semibold text-indigo-900">Selected Location:</p>
              <p className="text-xs text-indigo-700 mt-0.5">{address}</p>
            </div>
          )}

          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={onMapClick}
            mapboxAccessToken={mapboxToken}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: '100%', height: '100%' }}
            ref={mapRef}
            interactive={true}
            dragPan={true}
            scrollZoom={true}
          >
            {markerPosition && (
              <Marker
                longitude={markerPosition.longitude}
                latitude={markerPosition.latitude}
                draggable={isEditable}
                onDragEnd={onMarkerDragEnd}
              >
                <div className="relative">
                  <MapPin 
                    className="h-10 w-10 text-indigo-600 fill-indigo-600 drop-shadow-lg" 
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      transform: 'translate(-50%, -100%)'
                    }}
                  />
                </div>
              </Marker>
            )}
            
            <NavigationControl position="bottom-right" />
          </Map>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Close Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-[10000] bg-white hover:bg-gray-100 p-3 rounded-lg shadow-lg border border-gray-200 transition-all"
            title="Exit Fullscreen (ESC)"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Address Display (if available) */}
          {address && (
            <div className="absolute top-4 left-4 z-[10000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
              <p className="text-sm font-semibold text-gray-900">📍 Location:</p>
              <p className="text-sm text-gray-700 mt-1">{address}</p>
            </div>
          )}

          {/* Fullscreen Map */}
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={onMapClick}
            mapboxAccessToken={mapboxToken}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: '100vw', height: '100vh' }}
            interactive={true}
            dragPan={true}
            scrollZoom={true}
          >
            {markerPosition && (
              <Marker
                longitude={markerPosition.longitude}
                latitude={markerPosition.latitude}
                draggable={isEditable}
                onDragEnd={onMarkerDragEnd}
              >
                <div className="relative">
                  <MapPin 
                    className="h-12 w-12 text-indigo-600 fill-indigo-600 drop-shadow-lg" 
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      transform: 'translate(-50%, -100%)'
                    }}
                  />
                </div>
              </Marker>
            )}
            
            <NavigationControl position="bottom-right" />
          </Map>
        </div>
      )}
    </>
  );
}
