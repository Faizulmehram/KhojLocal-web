import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Sparkles, Home as HomeIcon, ShoppingBag, Star, Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import LabourCard from '../../components/LabourCard';
import VendorCard from '../../components/VendorCard';
import axios from 'axios';

export default function MainPage() {
  const navigate = useNavigate();
  const [recommendedVendors, setRecommendedVendors] = useState([]);
  const [labourWorkers, setLabourWorkers] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedVendors();
    fetchLabourWorkers();
  }, []);

  useEffect(() => {
    filterVendorsByCategory();
  }, [selectedCategory, recommendedVendors, labourWorkers]);

  const fetchRecommendedVendors = async () => {
    try {
      console.log('Fetching vendors from API...');
      const response = await axios.get('http://localhost:5000/api/vendors');
      console.log('API Response:', response.data);
      console.log('Total vendors received:', response.data.length);
      setRecommendedVendors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommended vendors:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const fetchLabourWorkers = async () => {
    try {
      console.log('Fetching labour workers from API...');
      const response = await axios.get('http://localhost:5000/api/labour/all?isApproved=true');
      console.log('Labour workers response:', response.data);
      
      // The API returns { success, count, labour: [...] }
      const labourData = response.data.labour || [];
      
      // Transform labour workers to match vendor format for display
      const transformedLabour = labourData.map(labour => ({
        _id: labour._id,
        businessName: `${labour.userId?.name || labour.fullName} - ${labour.tradeCategory || labour.skill}`,
        category: 'Labour',
        description: labour.tradeDescription || labour.bio || `${labour.tradeCategory || labour.skill} professional with ${labour.experience || 0} years experience`,
        rating: labour.rating || 0,
        totalReviews: labour.totalReviews || 0,
        images: {
          logo: labour.profileImage || 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
          banner: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
        },
        phone: labour.userId?.phone || labour.phone,
        experience: labour.experience,
        tradeCategory: labour.tradeCategory || labour.skill,
        isLabour: true, // Flag to identify labour workers
      }));
      
      setLabourWorkers(transformedLabour);
      console.log('Transformed labour workers:', transformedLabour.length);
    } catch (error) {
      console.error('Error fetching labour workers:', error);
      console.error('Labour error details:', error.response?.data || error.message);
    }
  };

  const filterVendorsByCategory = () => {
    if (selectedCategory === 'all') {
      const combined = [...recommendedVendors, ...labourWorkers];
      setFilteredVendors(combined.slice(0, 10));
    } else if (selectedCategory === 'Labour') {
      setFilteredVendors(labourWorkers);
    } else {
      const filtered = recommendedVendors.filter(v => v.category === selectedCategory);
      setFilteredVendors(filtered);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const categories = [
    { name: 'All Categories', value: 'all', icon: ShoppingBag, desc: 'Show all services' },
    { name: 'Restaurant', value: 'Restaurant', icon: Utensils, desc: 'Dining & food services' },
    { name: 'Bakery', value: 'Bakery', icon: Utensils, desc: 'Fresh baked goods' },
    { name: 'Labour', value: 'Labour', icon: Users, desc: 'Skilled workers & professionals' },
    { name: 'Salon', value: 'Salon', icon: Sparkles, desc: 'Hair & beauty services' },
    { name: 'Spa', value: 'Spa', icon: Sparkles, desc: 'Wellness & relaxation' },
    { name: 'Gym', value: 'Gym', icon: Sparkles, desc: 'Fitness & training' },
    { name: 'Florist', value: 'Florist', icon: ShoppingBag, desc: 'Flowers & arrangements' },
    { name: 'Mechanic', value: 'Mechanic', icon: HomeIcon, desc: 'Auto repair services' },
    { name: 'Other', value: 'Other', icon: HomeIcon, desc: 'Other services' },
  ];

  const recommendedServices = [
    {
      id: 1,
      name: 'La Trattoria',
      category: 'Italian Restaurant',
      rating: 4.8,
      reviews: 120,
      distance: '0.5 km away',
      price: '₹₹₹',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      description: 'Based on your interest in Italian food.',
    },
    {
      id: 2,
      name: 'The Daily Grind',
      category: 'Coffee Shop',
      rating: 4.8,
      reviews: 250,
      distance: '1.2 km away',
      price: '₹₹',
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
      description: 'Popular cafe near your location.',
    },
    {
      id: 3,
      name: 'Elite Fitness Studio',
      category: 'Gym & Fitness',
      rating: 4.9,
      reviews: 180,
      distance: '2.0 km away',
      price: '₹₹',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      description: 'Top-rated fitness center with modern equipment.',
    },
    {
      id: 4,
      name: 'Glamour Hair Salon',
      category: 'Beauty & Spa',
      rating: 4.7,
      reviews: 95,
      distance: '1.5 km away',
      price: '₹₹',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      description: 'Professional styling and beauty services.',
    },
    {
      id: 5,
      name: 'Quick Fix Repairs',
      category: 'Home Services',
      rating: 4.6,
      reviews: 210,
      distance: '3.5 km away',
      price: '₹',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      description: 'Reliable plumbing and electrical repairs.',
    },
  ];

  const featuredServices = [
    {
      id: 6,
      name: "Artisan's Boutique",
      description: 'Unique handmade goods',
      category: 'Shopping',
      rating: 4.8,
      reviews: 85,
      distance: '1.0 km away',
      price: '₹₹',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
      buttonText: 'View Store',
    },
    {
      id: 7,
      name: 'Burger Bliss',
      description: 'Gourmet burgers & fries',
      category: 'Restaurant',
      rating: 4.7,
      reviews: 320,
      distance: '0.8 km away',
      price: '₹₹',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      buttonText: 'View Menu',
    },
    {
      id: 8,
      name: 'Serenity Spa',
      description: 'Massage and wellness',
      category: 'Health & Beauty',
      rating: 4.9,
      reviews: 145,
      distance: '2.2 km away',
      price: '₹₹₹',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
      buttonText: 'Book Now',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCategoryClick(cat.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition text-left ${
                      selectedCategory === cat.value
                        ? 'bg-indigo-50 border-indigo-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <cat.icon className={`h-5 w-5 ${selectedCategory === cat.value ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <div className="flex-1">
                      <h3 className={`text-sm font-semibold ${selectedCategory === cat.value ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Promotional Banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-2">Get 20% off your first order!</h3>
              <p className="text-sm mb-4 opacity-90">Find and book local services with our special discount. Limited time offer.</p>
              <button className="w-full bg-white text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition">
                Claim Offer
              </button>
            </div>
          </aside>

          {/* Content - Recommended & Featured */}
          <div className="lg:col-span-3 space-y-8">
            {/* Recommended For You */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === 'all' ? 'Recommended For You' : 
                   selectedCategory === 'Labour' ? 'Available Workers' : 
                   `${selectedCategory} Services`}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredVendors.length} {selectedCategory === 'Labour' ? 
                    (filteredVendors.length === 1 ? 'worker' : 'workers') : 
                    (filteredVendors.length === 1 ? 'business' : 'businesses')}
                </span>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-500">
                    {selectedCategory === 'all' 
                      ? 'No services available yet.' 
                      : selectedCategory === 'Labour'
                      ? 'No workers available in this category yet.'
                      : `No ${selectedCategory} businesses available yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVendors.map((item, idx) => (
                    item.isLabour ? (
                      <LabourCard key={item._id} labour={item} />
                    ) : (
                      <VendorCard key={item._id} vendor={item} />
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Featured This Week */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Featured This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border bg-white border-gray-200 overflow-hidden hover:shadow-lg transition"
                  >
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                      <button 
                        onClick={() => navigate(`/business/${service.id}`, { state: { business: service } })}
                        className="w-full py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition active:scale-95"
                      >
                        {service.buttonText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
