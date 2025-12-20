import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Phone, Navigation, Share2, Star, MapPin } from 'lucide-react';
import VendorMap from '../../components/VendorMap';

// Helper function to get current day of week
const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

// Helper function to format business hours
const formatBusinessHours = (hours) => {
  if (!hours || !hours.open || !hours.close) {
    return 'Closed';
  }
  if (hours.isClosed) {
    return 'Closed';
  }
  
  // Convert 24h to 12h format
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
  };
  
  return `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
};

const GALLERY = [
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800',
  'https://images.unsplash.com/photo-1447078806655-40579c2520d6?w=400',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=400'
];

const POPULAR = [
  { name: 'Almond Croissant', desc: 'Flaky and buttery with almond filling', price: '$4.50' },
  { name: 'Sourdough Loaf', desc: 'Naturally leavened, chewy crust', price: '$8.00' },
  { name: 'Caramel Latte', desc: 'Espresso with milk & caramel', price: '$5.25' },
  { name: 'Chocolate Eclair', desc: 'Choux pastry with cream', price: '$5.00' },
  { name: 'Avocado Toast', desc: 'Sourdough + smashed avocado', price: '$9.50' }
];

const REVIEWS = [
  { name: 'Jane Doe', rating: 5, text: 'Absolutely the best croissants in town! The coffee is fantastic too.' },
  { name: 'John Smith', rating: 4, text: 'Great atmosphere and friendly staff. It can get busy at peak hours.' }
];

export default function EndUserBusinessDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const business = state?.business;

  const name = business?.name || 'The Artisan Bakery';
  const price = business?.price || '$$';
  const distance = business?.distance || '0.2 km';
  
  // Get current day
  const currentDay = getCurrentDay();
  
  // Days of the week for display
  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 sm:mb-8">
          <div className="col-span-2 row-span-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
            <img src={GALLERY[0]} alt="Hero" className="w-full h-full object-cover min-h-[200px] sm:min-h-[260px] md:min-h-[380px]" />
          </div>
          {GALLERY.slice(1).map((src, idx) => (
            <div key={idx} className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              <img src={src} alt="Gallery" className="w-full h-full object-cover aspect-square" />
            </div>
          ))}
        </div>

        {/* Header + actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">{name}</h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">Cafe & Bakery · {price}</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 sm:px-4 py-2 self-start">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-xs sm:text-sm">Trust Score</span>
                <span className="font-bold text-sm sm:text-base">8.2</span>
                <span className="text-xs sm:text-sm">/ 10</span>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {(business?.serviceType === "ordering" || business?.serviceType === "both") && (
                  <button 
                    onClick={() => navigate('/order', { state: { vendor: business } })} 
                    className="flex-1 bg-indigo-600 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl hover:bg-indigo-700 active:scale-95 transition text-sm sm:text-base"
                  >
                    Order Now
                  </button>
                )}
                {(business?.serviceType === "booking" || business?.serviceType === "both") && (
                  <button 
                    onClick={() => navigate('/booking', { state: { vendor: business } })} 
                    className="flex-1 bg-violet-600 text-white font-semibold py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl hover:bg-violet-700 active:scale-95 transition text-sm sm:text-base"
                  >
                    Book Now
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"><Phone className="h-5 w-5 text-violet-600"/><span className="text-xs mt-1">Call</span></button>
                <button className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"><Navigation className="h-5 w-5 text-violet-600"/><span className="text-xs mt-1">Directions</span></button>
                <button className="flex flex-col items-center p-2 sm:p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"><Share2 className="h-5 w-5 text-violet-600"/><span className="text-xs mt-1">Share</span></button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">About this place</h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Welcome to {name}, where the aroma of freshly baked bread and rich, aromatic coffee fills the air. We craft delicious, high‑quality pastries, cakes, and artisanal breads using locally sourced ingredients. Our cozy cafe is perfect to relax, work, or catch up with friends.</p>
            </div>

            {/* Popular items */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold">Popular Items</h2>
                <a className="text-violet-600 font-semibold text-sm sm:text-base" href="#">View All</a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {POPULAR.map((item) => (
                  <div key={item.name} className="border rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.desc}</p>
                    <p className="font-semibold text-sm sm:text-base">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold">Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-yellow-400">
                    {[1,2,3,4].map(i=> <Star key={i} className="h-3 sm:h-4 w-3 sm:w-4 fill-yellow-400" />)}
                    <Star className="h-3 sm:h-4 w-3 sm:w-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm">4.8</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">(512 reviews)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {REVIEWS.map((r, idx) => (
                  <div key={idx} className="flex gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">{r.name.split(' ').map(p=>p[0]).join('')}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">{r.name}</p>
                      <div className="flex items-center text-yellow-400 text-sm">
                        {Array.from({length:r.rating}).map((_,i)=> <Star key={i} className="h-3 sm:h-4 w-3 sm:w-4 fill-yellow-400" />)}
                        {Array.from({length:5-r.rating}).map((_,i)=> <Star key={`e-${i}`} className="h-3 sm:h-4 w-3 sm:w-4 text-gray-300" />)}
                      </div>
                      <p className="mt-2 text-gray-600 text-xs sm:text-sm">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Location</h2>
              <div className="rounded-lg sm:rounded-xl overflow-hidden mb-3">
                <VendorMap
                  isEditable={false}
                  initialLocation={business?.location ? {
                    latitude: business.location.latitude,
                    longitude: business.location.longitude,
                    address: business.location.address || business.address?.fullAddress
                  } : null}
                  height="240px"
                />
              </div>
              <div className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-violet-600 flex-shrink-0" />
                <p>{business?.location?.address || business?.address?.fullAddress || '123 Main Street, San Francisco, CA 94110'}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Hours</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                {daysOfWeek.map((day) => {
                  const isToday = day.key === currentDay;
                  const hours = business?.businessHours?.[day.key];
                  const hoursText = formatBusinessHours(hours);
                  
                  return (
                    <li 
                      key={day.key}
                      className={`flex justify-between ${
                        isToday 
                          ? 'bg-violet-50 text-violet-700 p-2 rounded-lg' 
                          : ''
                      }`}
                    >
                      {isToday ? (
                        <>
                          <strong>{day.label} (Today)</strong>
                          <strong>{hoursText}</strong>
                        </>
                      ) : (
                        <>
                          <span>{day.label}</span>
                          <span className="font-medium">{hoursText}</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
