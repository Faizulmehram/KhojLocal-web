import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Award, Briefcase, MapPin, Phone, Mail, Calendar, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function LabourProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const labour = state?.labour;

  if (!labour) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Worker Not Found</h2>
          <p className="text-gray-600 mb-6">Please select a worker from the main page.</p>
          <button
            onClick={() => navigate('/main')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Main Page
          </button>
        </div>
      </div>
    );
  }

  const workerName = labour.businessName?.split(' - ')[0] || 'Worker';
  const skill = labour.tradeCategory || labour.skill || 'Service Provider';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {labour.images?.logo ? (
                <img
                  src={labour.images.logo}
                  alt={workerName}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold ring-4 ring-white shadow-xl">
                  {workerName.split(' ')[0]?.charAt(0)}{workerName.split(' ')[1]?.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                <Award className="h-6 w-6" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold">{workerName}</h1>
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-xl text-blue-100 mb-3">{skill}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">{labour.rating || 0}</span>
                  <span className="text-blue-100">({labour.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Briefcase className="h-5 w-5" />
                  <span>{labour.experience || 0} years experience</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/labour-booking', { state: { labour } })}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
              >
                Hire Now
              </button>
              {labour.phone && (
                <a
                  href={`tel:${labour.phone}`}
                  className="px-8 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition text-center"
                >
                  Call Now
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {labour.description || `${workerName} is a professional ${skill} with ${labour.experience || 0} years of experience. Verified and trusted by many customers.`}
              </p>
            </section>

            {/* Skills & Experience */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{skill}</h3>
                    <p className="text-sm text-gray-600">{labour.experience || 0}+ years of professional experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Verified Professional</h3>
                    <p className="text-sm text-gray-600">Identity and credentials verified</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality Work</h3>
                    <p className="text-sm text-gray-600">High customer satisfaction rating</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              
              {labour.totalReviews > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= Math.round(labour.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-bold">{labour.rating}</span>
                    <span className="text-gray-600">({labour.totalReviews} reviews)</span>
                  </div>
                  <p className="text-gray-600">Customer reviews will be displayed here once available.</p>
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to hire and review this worker!</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {labour.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <a href={`tel:${labour.phone}`} className="font-medium hover:text-blue-600">
                        {labour.phone}
                      </a>
                    </div>
                  </div>
                )}
                {labour.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a href={`mailto:${labour.email}`} className="font-medium hover:text-blue-600 text-sm">
                        {labour.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </span>
                  <span className="font-bold">{labour.experience || 0} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </span>
                  <span className="font-bold">{labour.rating || 0}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Reviews
                  </span>
                  <span className="font-bold">{labour.totalReviews || 0}</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">Ready to Hire?</h3>
              <p className="text-blue-100 text-sm mb-4">Book now and get quality service from a verified professional.</p>
              <button
                onClick={() => navigate('/labour-booking', { state: { labour } })}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
              >
                Hire {workerName.split(' ')[0]}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
