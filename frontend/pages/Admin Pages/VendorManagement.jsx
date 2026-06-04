import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editForm, setEditForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    category: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  });

  useEffect(() => {
    fetchAllVendors();
  }, []);

  const fetchAllVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      alert(error.response?.data?.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setEditForm({
      businessName: vendor.businessName || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      category: vendor.category || '',
      address: vendor.address?.street || '',
      city: vendor.address?.city || '',
      state: vendor.address?.state || '',
      pincode: vendor.address?.pincode || '',
      description: vendor.description || '',
      ownerName: vendor.ownerName || '',
      ownerEmail: vendor.ownerEmail || '',
      ownerPhone: vendor.ownerPhone || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/admin/vendors/${selectedVendor._id}`,
        {
          businessName: editForm.businessName,
          email: editForm.email,
          phone: editForm.phone,
          category: editForm.category,
          address: {
            street: editForm.address,
            city: editForm.city,
            state: editForm.state,
            pincode: editForm.pincode,
          },
          description: editForm.description,
          ownerName: editForm.ownerName,
          ownerEmail: editForm.ownerEmail,
          ownerPhone: editForm.ownerPhone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Vendor updated successfully!');
      setShowEditModal(false);
      fetchAllVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert(error.response?.data?.message || 'Failed to update vendor');
    }
  };

  const handleDeleteClick = (vendor) => {
    setSelectedVendor(vendor);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/api/admin/vendors/${selectedVendor._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Vendor deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedVendor(null);
      fetchAllVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert(error.response?.data?.message || 'Failed to delete vendor');
    }
  };

  const handleToggleActive = async (vendor) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/admin/vendors/${vendor._id}`,
        { isActive: !vendor.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllVendors();
    } catch (error) {
      console.error('Error toggling vendor status:', error);
      alert(error.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      vendor.status.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesCategory = 
      filterCategory === 'all' || 
      vendor.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = ['Restaurant', 'Bakery', 'Florist', 'Mechanic', 'Salon', 'Spa', 'Gym', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <AdminSidebar />

      <div className="lg:ml-64 p-4">
        {/* Main Content Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-emerald-600 mb-1">
              Vendor Management
            </h1>
            <p className="text-sm text-gray-600">Manage all vendors - Edit, Delete, and Toggle Status</p>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
              <div className="text-sm text-gray-700 font-semibold flex items-center justify-center bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-200">
                Total: <span className="ml-1 text-emerald-700">{filteredVendors.length}</span> vendors
              </div>
            </div>
          </div>

          {/* Vendors List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-sm md:text-base">No vendors found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Active
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVendors.map((vendor) => (
                      <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {vendor.images?.logo ? (
                              <img 
                                src={vendor.images.logo} 
                                alt={vendor.businessName}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {vendor.businessName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{vendor.businessName}</p>
                              <p className="text-sm text-gray-500 truncate">{vendor.ownerName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {vendor.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900 truncate">{vendor.email}</p>
                            <p className="text-gray-500">{vendor.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            vendor.status === 'Approved' 
                              ? 'bg-green-100 text-green-800'
                              : vendor.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(vendor)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                              vendor.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                            title={vendor.isActive ? 'Active' : 'Inactive'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                vendor.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEdit(vendor)}
                              className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(vendor)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filteredVendors.map((vendor) => (
                <div key={vendor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  {/* Vendor Header */}
                  <div className="flex items-start space-x-3 mb-4">
                    {vendor.images?.logo ? (
                      <img 
                        src={vendor.images.logo} 
                        alt={vendor.businessName}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {vendor.businessName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{vendor.businessName}</h3>
                      <p className="text-sm text-gray-500 mb-2">{vendor.ownerName}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {vendor.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vendor.status === 'Approved' 
                            ? 'bg-green-100 text-green-800'
                            : vendor.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600 truncate">{vendor.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{vendor.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Active:</span>
                      <button
                        onClick={() => handleToggleActive(vendor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          vendor.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            vendor.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vendor)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full my-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center rounded-t-xl md:rounded-t-2xl">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Edit Vendor</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4 md:p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {/* Business Information */}
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={editForm.businessName}
                        onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows="3"
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Owner Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                      <input
                        type="text"
                        value={editForm.ownerName}
                        onChange={(e) => setEditForm({...editForm, ownerName: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Owner Email</label>
                      <input
                        type="email"
                        value={editForm.ownerEmail}
                        onChange={(e) => setEditForm({...editForm, ownerEmail: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Owner Phone</label>
                      <input
                        type="text"
                        value={editForm.ownerPhone}
                        onChange={(e) => setEditForm({...editForm, ownerPhone: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={editForm.state}
                        onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={editForm.pincode}
                        onChange={(e) => setEditForm({...editForm, pincode: e.target.value})}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 border-t border-gray-200 rounded-b-xl md:rounded-b-2xl">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg md:rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg md:rounded-xl hover:from-emerald-700 hover:to-green-700 font-medium shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6">
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-2">Delete Vendor</h3>
              <p className="text-sm md:text-base text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedVendor?.businessName}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg md:rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg md:rounded-xl hover:bg-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
