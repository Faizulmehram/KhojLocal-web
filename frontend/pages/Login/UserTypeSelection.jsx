import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Wrench, ArrowRight } from 'lucide-react';

/**
 * UserTypeSelection - Entry point for registration
 * User selects between Vendor or Labour registration
 */
export default function UserTypeSelection() {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    navigate(`/register/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Khooj Local
          </h1>
          <p className="text-lg text-gray-600">
            Choose how you want to register and start your journey with us
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vendor Card */}
          <div
            onClick={() => handleSelection('vendor')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-500 overflow-hidden"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Store className="h-8 w-8 text-indigo-600" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Register as Vendor
              </h2>
              <p className="text-gray-600 mb-6">
                Own a business? Register your shop, restaurant, salon, or service center and reach more customers.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>Business profile with location mapping</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>Manage bookings and orders</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>Customer reviews and ratings</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>Analytics and insights</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors group-hover:gap-4">
                Get Started as Vendor
                <ArrowRight className="h-5 w-5 transition-all" />
              </button>
            </div>
          </div>

          {/* Labour Card */}
          <div
            onClick={() => handleSelection('labour')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500 overflow-hidden"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="h-8 w-8 text-purple-600" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Register as Labour
              </h2>
              <p className="text-gray-600 mb-6">
                Skilled worker? Register your services as an electrician, plumber, painter, or other professional.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Showcase your skills and experience</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Set your availability and service area</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Build your reputation with reviews</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Get hired directly by customers</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors group-hover:gap-4">
                Get Started as Labour
                <ArrowRight className="h-5 w-5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
