import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function VendorCard({ vendor }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border bg-white border-gray-200 hover:shadow-lg transition">
      {vendor.images?.logo ? (
        <img
          src={vendor.images.logo}
          alt={vendor.businessName}
          className="w-full sm:w-32 h-32 object-cover rounded-xl"
        />
      ) : (
        <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold">
          {vendor.businessName?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-indigo-600 font-medium uppercase mb-1">{vendor.category}</p>
            <h3 className="text-lg font-bold">{vendor.businessName}</h3>
            <p className="text-sm text-gray-600 mt-1">{vendor.description || 'Quality service provider'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{vendor.rating || 4.5}</span>
              <span className="text-xs text-gray-500">({vendor.reviewCount || 0} reviews)</span>
            </div>
            {vendor.address?.city && (
              <span className="text-xs text-gray-500">{vendor.address.city}</span>
            )}
          </div>
          <div className="flex gap-2">
            {(vendor.serviceType === "ordering" || vendor.serviceType === "both") && (
              <button 
                onClick={() => navigate(`/order`, { state: { vendor: vendor } })}
                className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition active:scale-95"
              >
                Order
              </button>
            )}
            {(vendor.serviceType === "booking" || vendor.serviceType === "both") && (
              <button 
                onClick={() => navigate(`/booking`, { state: { vendor: vendor } })}
                className="px-3 py-2 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition active:scale-95"
              >
                Book
              </button>
            )}
            <button 
              onClick={() => navigate(`/business/${vendor._id}`, { state: { business: vendor } })}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition active:scale-95"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
