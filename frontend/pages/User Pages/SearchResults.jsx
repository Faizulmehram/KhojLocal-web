import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

function SidebarFilters({
  selectedCategory,
  setSelectedCategory,
  rating,
  setRating,
  onReset,
  isMobileOpen,
  onMobileClose,
}) {
  const categories = ['Restaurant', 'Bakery', 'Salon', 'Gym', 'Other'];

  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        {isMobileOpen && (
          <button onClick={onMobileClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => setSelectedCategory('')}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onClick={() => setRating(star)}
              className={`h-6 w-6 cursor-pointer ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Apply/Reset Buttons */}
      {isMobileOpen && (
        <>
          <button 
            onClick={onMobileClose}
            className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition mb-2"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              onReset();
              onMobileClose();
            }}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Reset
          </button>
        </>
      )}

      {!isMobileOpen && (
        <button
          onClick={onReset}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Reset Filters
        </button>
      )}
    </>
  );

  return (
    <>
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-20 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <FilterContent />
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}

function BusinessCard({ business }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="w-full h-48 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
        <span className="text-4xl font-bold text-violet-600">{business.businessName?.charAt(0) || 'B'}</span>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{business.businessName}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{business.description || 'No description available'}</p>
        
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900">{business.rating || 0}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{business.address?.city || 'N/A'}</span>
          </div>
          
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
            {business.category}
          </span>
        </div>

        <button
          className="w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 transition active:scale-95"
          onClick={() => navigate(`/business/${business._id}`, { state: { business } })}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-5">
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('query') || params.get('q') || '';

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch vendors from backend
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category = selectedCategory;

        const response = await axios.get(`${API_BASE_URL}/api/vendors`, { params });
        setBusinesses(response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [searchQuery, selectedCategory]);

  const resetFilters = () => {
    setSelectedCategory('');
    setRating(0);
  };

  // Filter by rating on frontend
  const filtered = useMemo(() => {
    return businesses.filter((b) => b.rating >= rating);
  }, [businesses, rating]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.search.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search businesses..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <SidebarFilters
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            rating={rating}
            setRating={setRating}
            onReset={resetFilters}
            isMobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          <section className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 w-full sm:w-auto px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? selectedCategory : 'All Businesses'}
              </h1>
              <p className="text-gray-600">{`Found ${filtered.length} businesses`}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((business) => (
                  <BusinessCard key={business._id} business={business} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No businesses found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
