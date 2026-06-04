import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import { UserCheck, Phone, Shield, MapPin, Briefcase, X, CheckCircle, FileText, Image } from 'lucide-react';
import API_BASE_URL from '../../config/api';

export default function LabourVerification() {
  const [labourList, setLabourList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingLabour();
  }, []);

  const fetchPendingLabour = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/labour/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabourList(response.data.labour || []);
    } catch (error) {
      console.error('Error fetching pending labour:', error);
      alert(error.response?.data?.message || 'Failed to fetch labour applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (labourId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/labour/${labourId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert('✅ Labour verified and approved!');
      setShowModal(false);
      setSelectedLabour(null);
      fetchPendingLabour();
    } catch (error) {
      console.error('Error approving labour:', error);
      alert(error.response?.data?.message || 'Failed to approve labour');
    }
  };

  const handleReject = async (labourId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/labour/${labourId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert('❌ Labour application rejected');
      setShowModal(false);
      setSelectedLabour(null);
      setRejectionReason('');
      fetchPendingLabour();
    } catch (error) {
      console.error('Error rejecting labour:', error);
      alert(error.response?.data?.message || 'Failed to reject labour');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-[#174f48]" />
            Labour Verification
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">Review and verify labour registration applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 text-sm font-medium">Pending Verification</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-900 mt-1">{labourList.length}</p>
              </div>
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Labour List */}
        {labourList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
            <UserCheck className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Pending Applications</h3>
            <p className="text-sm md:text-base text-gray-500">All labour applications have been reviewed</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Labour Details</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Skill</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">CNIC</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {labourList.map((labour) => (
                    <tr key={labour._id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm md:text-base">{labour.fullName}</p>
                          <p className="text-xs md:text-sm text-gray-500">Registered: {new Date(labour.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs md:text-sm">
                            <Phone className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                            <span>{labour.phone}</span>
                          </div>
                          {labour.email && (
                            <div className="text-xs md:text-sm text-gray-500">{labour.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-[#174f48]" />
                          <span className="font-medium text-sm md:text-base">{labour.skill}</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">{labour.experience} years exp</p>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-xs md:text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {labour.cnicNumber}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <Shield className="h-3 w-3" />
                          {labour.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedLabour(labour);
                            setShowModal(true);
                          }}
                          className="text-[#174f48] hover:text-[#0f3d37] font-medium text-xs md:text-sm whitespace-nowrap"
                        >
                          Review Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedLabour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Labour Verification Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLabour(null);
                    setRejectionReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Personal Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-[#174f48]" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-sm md:text-base">{selectedLabour.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Phone</p>
                      <p className="font-semibold flex items-center gap-2 text-sm md:text-base">
                        {selectedLabour.phone}
                        {selectedLabour.phoneVerified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </p>
                    </div>
                    {selectedLabour.email && (
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-sm md:text-base">{selectedLabour.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">CNIC Number</p>
                      <p className="font-semibold font-mono text-sm md:text-base">{selectedLabour.cnicNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Work Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-[#174f48]" />
                    Work Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Skill / Trade</p>
                      <p className="font-semibold text-sm md:text-base">{selectedLabour.skill}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Experience</p>
                      <p className="font-semibold text-sm md:text-base">{selectedLabour.experience} years</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Available Days</p>
                      <p className="font-semibold text-sm md:text-base">{selectedLabour.availability?.days?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Working Hours</p>
                      <p className="font-semibold text-sm md:text-base">{selectedLabour.availability?.hours}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#174f48]" />
                    Service Area
                  </h3>
                  <p className="text-sm md:text-base">{selectedLabour.serviceArea?.address}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Radius: {selectedLabour.serviceArea?.radius} km
                  </p>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-[#174f48]" />
                    Bio
                  </h3>
                  <p className="text-sm md:text-base">{selectedLabour.bio}</p>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                    <Image className="h-4 w-4 md:h-5 md:w-5 text-[#174f48]" />
                    Verification Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 mb-2">CNIC Front</p>
                      <img
                        src={`${API_BASE_URL}${selectedLabour.documents?.cnicFront}`}
                        alt="CNIC Front"
                        className="w-full h-32 md:h-40 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(`${API_BASE_URL}${selectedLabour.documents?.cnicFront}`, '_blank')}
                      />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 mb-2">CNIC Back</p>
                      <img
                        src={`${API_BASE_URL}${selectedLabour.documents?.cnicBack}`}
                        alt="CNIC Back"
                        className="w-full h-32 md:h-40 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(`${API_BASE_URL}${selectedLabour.documents?.cnicBack}`, '_blank')}
                      />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-500 mb-2">Selfie Photo</p>
                      <img
                        src={`${API_BASE_URL}${selectedLabour.documents?.selfie}`}
                        alt="Selfie"
                        className="w-full h-32 md:h-40 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(`${API_BASE_URL}${selectedLabour.documents?.selfie}`, '_blank')}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click on any image to view full size</p>
                </div>

                {/* Rejection Reason */}
                <div className="bg-red-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (required if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-sm md:text-base"
                    rows={3}
                    placeholder="Provide a reason for rejection..."
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedLabour._id)}
                    className="flex-1 bg-[#174f48] hover:bg-[#0f3d37] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve & Verify
                  </button>
                  <button
                    onClick={() => handleReject(selectedLabour._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <X className="h-5 w-5" />
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
