import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, Clock, Phone, Award } from 'lucide-react';

export default function LabourCard({ labour }) {
  const navigate = useNavigate();

  const handleBookLabour = () => {
    navigate('/labour-booking', { state: { labour } });
  };

  const handleViewProfile = () => {
    navigate(`/labour/${labour._id}`, { state: { labour } });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border bg-white border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Profile Picture */}
      <div className="flex flex-col items-center sm:items-start">
        <div className="relative">
          {labour.images?.logo ? (
            <img
              src={labour.images.logo}
              alt={labour.businessName}
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full ring-4 ring-blue-100"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-100">
              {labour.businessName?.split(' ')[0]?.charAt(0).toUpperCase()}
              {labour.businessName?.split(' ')[1]?.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Verified Badge */}
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
            <Award className="h-4 w-4" />
          </div>
        </div>
        {/* Mobile: Rating below picture */}
        <div className="flex items-center gap-1 mt-3 sm:hidden">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">{labour.rating || 0}</span>
          <span className="text-xs text-gray-500">({labour.totalReviews || 0})</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-3">
        {/* Name & Category */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {labour.tradeCategory || 'Labour'}
            </span>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
              ✓ Verified
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{labour.businessName}</h3>
        </div>

        {/* Description */}
        {labour.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {labour.description}
          </p>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Experience */}
          <div className="flex items-center gap-2 text-gray-700">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <span>{labour.experience || 0} years exp</span>
          </div>

          {/* Rating - Desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{labour.rating || 0}</span>
            <span className="text-gray-500">({labour.totalReviews || 0})</span>
          </div>

          {/* Phone */}
          {labour.phone && (
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="text-xs">{labour.phone}</span>
            </div>
          )}

          {/* Location */}
          {labour.address?.city && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="text-xs">{labour.address.city}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleBookLabour}
            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Hire Now
          </button>
          <button
            onClick={handleViewProfile}
            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 active:scale-95"
          >
            View Profile
          </button>
          {labour.phone && (
            <a
              href={`tel:${labour.phone}`}
              className="hidden sm:flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 active:scale-95"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
