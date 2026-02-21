// BookingManagement.jsx
// Vendor Booking Management Component

import React, { useState, useEffect } from 'react';
import VendorSidebar from '../../components/VendorSidebar';
import axios from 'axios';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper function to get avatar from name
const getAvatarFromName = (name) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=indigo&color=fff&size=128`;
};

// Map API status to component status
const mapStatus = (apiStatus, type = 'booking') => {
  if (type === 'order') {
    if (['Pending Payment', 'Pending Vendor Confirmation'].includes(apiStatus)) return 'pending';
    if (['Confirmed', 'In Progress', 'Out for Delivery', 'Ready for Pickup'].includes(apiStatus)) return 'active';
    if (apiStatus === 'Completed') return 'completed';
    if (['Cancelled', 'Rejected', 'Auto-Rejected'].includes(apiStatus)) return 'canceled';
  } else {
    if (['Pending Payment', 'Pending Vendor Confirmation'].includes(apiStatus)) return 'pending';
    if (['Confirmed', 'In Progress'].includes(apiStatus)) return 'active';
    if (apiStatus === 'Completed') return 'completed';
    if (['Cancelled', 'Rejected', 'Auto-Rejected'].includes(apiStatus)) return 'canceled';
  }
  return 'pending';
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [vendorServiceType, setVendorServiceType] = useState('both');
  const [isLabour, setIsLabour] = useState(false);

  useEffect(() => {
    // Check if user is labour or vendor
    const labourData = localStorage.getItem("labour");
    const vendorData = localStorage.getItem("vendor");
    
    if (labourData) {
      setIsLabour(true);
      setVendorServiceType('booking'); // Labour only does bookings
    } else if (vendorData) {
      fetchVendorProfile();
    }
  }, []);

  useEffect(() => {
    if (vendorServiceType || isLabour) {
      fetchData();
    }
  }, [activeTab, vendorServiceType, isLabour]);

  const fetchVendorProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/auth/vendor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.serviceType) {
        setVendorServiceType(response.data.serviceType);
      }
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const allItems = [];

      // If labour, only fetch labour bookings
      if (isLabour) {
        try {
          const bookingsResponse = await axios.get(
            "http://localhost:5000/api/labour/bookings",
            { headers }
          );
          
          if (bookingsResponse.data.success && bookingsResponse.data.bookings) {
            const mappedBookings = bookingsResponse.data.bookings.map((booking) => ({
              id: booking._id,
              type: 'booking',
              name: booking.user?.name || 'Unknown User',
              avatar: getAvatarFromName(booking.user?.name || 'User'),
              service: 'Labour Booking',
              date: formatDate(booking.bookingDate),
              time: booking.bookingTime || 'N/A',
              amount: booking.totalAmount || 0,
              paymentMethod: booking.paymentMethod || 'Pay-On-Completion',
              status: mapStatus(booking.status, 'booking'),
              bookingId: booking._id,
              details: {
                phone: booking.user?.phone || 'N/A',
                notes: booking.notes || 'No notes provided',
                workDescription: booking.workDescription || 'No description',
                rawStatus: booking.status,
              },
            }));
            allItems.push(...mappedBookings);
          }
        } catch (error) {
          console.error("Error fetching labour bookings:", error);
        }
      } else {
        // Vendor logic - fetch bookings and/or orders
        // Fetch bookings if vendor offers booking services
        if (vendorServiceType === 'booking' || vendorServiceType === 'both') {
        try {
          const bookingsResponse = await axios.get(
            "http://localhost:5000/api/auth/vendor/vendor/bookings",
            { headers }
          );
          
          if (bookingsResponse.data.success && bookingsResponse.data.bookings) {
            const mappedBookings = bookingsResponse.data.bookings.map((booking) => ({
              id: booking._id,
              type: 'booking',
              name: booking.user?.name || 'Unknown User',
              avatar: getAvatarFromName(booking.user?.name || 'User'),
              service: booking.serviceType || 'Service',
              date: formatDate(booking.bookingDate),
              time: booking.bookingTime || 'N/A',
              price: `$${booking.totalAmount?.toFixed(2) || '0.00'}`,
              notes: booking.notes || '',
              status: mapStatus(booking.status, 'booking'),
              originalStatus: booking.status,
              bookingDate: booking.bookingDate,
              paymentStatus: booking.paymentStatus,
              paymentMethod: booking.paymentMethod,
              user: booking.user,
            }));
            allItems.push(...mappedBookings);
          }
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      }

      // Fetch orders if vendor offers ordering services
      if (vendorServiceType === 'ordering' || vendorServiceType === 'both') {
        try {
          const ordersResponse = await axios.get(
            "http://localhost:5000/api/auth/vendor/vendor/orders",
            { headers }
          );
          
          if (ordersResponse.data.success && ordersResponse.data.orders) {
            const mappedOrders = ordersResponse.data.orders.map((order) => ({
              id: order._id,
              type: 'order',
              name: order.user?.name || 'Unknown User',
              avatar: getAvatarFromName(order.user?.name || 'User'),
              service: `${order.items?.length || 0} item(s) - ${order.orderType || 'Order'}`,
              date: formatDate(order.createdAt),
              time: order.estimatedDeliveryTime ? formatDate(order.estimatedDeliveryTime) : 'N/A',
              price: `$${order.totalAmount?.toFixed(2) || '0.00'}`,
              notes: order.specialInstructions || '',
              status: mapStatus(order.status, 'order'),
              originalStatus: order.status,
              orderType: order.orderType,
              items: order.items,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              user: order.user,
            }));
            allItems.push(...mappedOrders);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
      } // End of vendor else block

      setBookings(allItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on active tab
  const filteredBookings = bookings.filter(item => item.status === activeTab);

  // Get counts for each status
  const statusCounts = {
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    canceled: bookings.filter(b => b.status === 'canceled').length,
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function openDetails(booking) {
    setSelected(booking);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(null);
  }

  const acceptBooking = async () => {
    if (!selected) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ type: 'error', message: 'Please login again' });
        return;
      }

      const endpoint = selected.type === 'booking' 
        ? `http://localhost:5000/api/auth/vendor/vendor/bookings/${selected.id}/accept`
        : `http://localhost:5000/api/auth/vendor/vendor/orders/${selected.id}/accept`;

      const response = await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setToast({ type: 'success', message: `${selected.type === 'booking' ? 'Booking' : 'Order'} successfully accepted.` });
        closeModal();
        fetchData();
      }
    } catch (error) {
      console.error("Error accepting:", error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to accept' });
    }
  };

  const rejectBooking = async () => {
    if (!selected) return;
    
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ type: 'error', message: 'Please login again' });
        return;
      }

      const endpoint = selected.type === 'booking'
        ? `http://localhost:5000/api/auth/vendor/vendor/bookings/${selected.id}/reject`
        : `http://localhost:5000/api/auth/vendor/vendor/orders/${selected.id}/reject`;

      const response = await axios.put(endpoint, { rejectionReason: reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setToast({ type: 'success', message: `${selected.type === 'booking' ? 'Booking' : 'Order'} rejected.` });
        closeModal();
        fetchData();
      }
    } catch (error) {
      console.error("Error rejecting:", error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to reject' });
    }
  };

  const rescheduleBooking = async () => {
    if (!selected || selected.type !== 'booking') {
      setToast({ type: 'info', message: 'Reschedule is only available for bookings.' });
      return;
    }

    const newDate = window.prompt("Enter new date (YYYY-MM-DD):");
    const newTime = window.prompt("Enter new time (HH:MM):");
    
    if (!newDate || !newTime) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ type: 'error', message: 'Please login again' });
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/auth/vendor/vendor/bookings/${selected.id}/reschedule`,
        { proposedDate: newDate, proposedTime: newTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setToast({ type: 'success', message: 'Reschedule proposal sent to customer.' });
        closeModal();
        fetchData();
      }
    } catch (error) {
      console.error("Error rescheduling:", error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to reschedule' });
    }
  };

  function getStatusBadgeColor(status) {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      canceled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <VendorSidebar activePage="Bookings" />

          {/* Main content */}
          <main className="flex-1 w-full lg:w-auto mt-16 lg:mt-0">
            <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {vendorServiceType === 'both' ? 'Bookings & Orders' : 
                 vendorServiceType === 'booking' ? 'Bookings' : 
                 'Orders'}
              </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
              <div className="flex gap-4 sm:gap-8 px-4 sm:px-6 min-w-max">
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`py-3 sm:py-4 font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${activeTab === 'pending' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                  Pending
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    {statusCounts.pending}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('active')}
                  className={`py-3 sm:py-4 font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${activeTab === 'active' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                  Active
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    {statusCounts.active}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('completed')}
                  className={`py-3 sm:py-4 font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${activeTab === 'completed' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                  Completed
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${activeTab === 'completed' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    {statusCounts.completed}
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('canceled')}
                  className={`py-3 sm:py-4 font-semibold transition-colors border-b-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base ${activeTab === 'canceled' ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                >
                  Canceled
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${activeTab === 'canceled' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    {statusCounts.canceled}
                  </span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredBookings.map((b) => (
                  <article key={b.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${b.avatar})` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{b.name}</h3>
                            {b.type === 'order' && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">Order</span>
                            )}
                            {b.type === 'booking' && (
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-xs rounded">Booking</span>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(b.status)}`}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{b.service}</p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <CalendarIcon />
                          <span className="truncate">{b.date}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <ClockIcon />
                          <span>{b.time}</span>
                        </div>
                        <div className="font-bold text-gray-900 ml-auto text-sm sm:text-base">{b.price}</div>
                      </div>
                      <button onClick={() => openDetails(b)} className="text-indigo-600 font-semibold text-xs sm:text-sm hover:text-indigo-700 transition-colors">
                        View Details →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredBookings.length === 0 && (
              <div className="mt-16 text-center py-12 bg-white rounded-2xl border border-gray-200">
                <div className="text-gray-400 mb-4 flex justify-center">
                  <CalendarIcon />
                </div>
                <p className="text-gray-500 font-medium mb-1">No {activeTab} {vendorServiceType === 'both' ? 'bookings or orders' : vendorServiceType === 'booking' ? 'bookings' : 'orders'}</p>
                <p className="text-gray-400 text-sm">Check other tabs or wait for new requests</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4" onClick={closeModal}>
          <div className="w-full max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-h-[90vh] sm:max-h-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${selected.avatar})` }} />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Booking Request</h2>
                    <p className="text-xs sm:text-sm text-gray-500">{selected.name}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 -mr-1">
                  <CloseIconModal />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 font-medium">{selected.service}</p>
            </div>

            <div className="p-4 sm:p-6 flex-1 space-y-4 sm:space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 text-xs sm:text-sm mb-1">
                    <CalendarIcon />
                    <span>{selected.type === 'order' ? 'Order Date' : 'Date & Time'}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{selected.date}</p>
                  {selected.type === 'booking' && (
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selected.time}</p>
                  )}
                  {selected.type === 'order' && selected.orderType && (
                    <p className="text-xs text-gray-600 mt-1">Type: {selected.orderType}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 text-xs sm:text-sm mb-1">
                    <DollarIcon />
                    <span>Total Cost</span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg sm:text-xl">{selected.price}</p>
                  {selected.paymentStatus && (
                    <p className="text-xs text-gray-600 mt-1">Payment: {selected.paymentStatus}</p>
                  )}
                </div>
              </div>

              {selected.type === 'order' && selected.items && selected.items.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Order Items</p>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    {selected.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs sm:text-sm">
                        <span>{item.name || `Item ${idx + 1}`} x {item.quantity || 1}</span>
                        <span className="font-medium">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {selected.type === 'order' ? 'Special Instructions' : 'Customer Notes'}
                </p>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-700">{selected.notes || 'No notes provided'}</p>
                </div>
              </div>

              {selected.user && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Customer Information</p>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-700">Name: {selected.user.name || 'N/A'}</p>
                    <p className="text-xs sm:text-sm text-gray-700">Email: {selected.user.email || 'N/A'}</p>
                    {selected.user.phone && (
                      <p className="text-xs sm:text-sm text-gray-700">Phone: {selected.user.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3">
              {selected.status === 'pending' && (
                <>
                  <button onClick={rejectBooking} className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors order-3 sm:order-1">
                    Reject
                  </button>
                  {selected.type === 'booking' && (
                    <button onClick={rescheduleBooking} className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors order-2 sm:order-2">
                    Reschedule
                  </button>
                  )}
                  <button onClick={acceptBooking} className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors order-1 sm:order-3">
                    Accept {selected.type === 'booking' ? 'Booking' : 'Order'}
                  </button>
                </>
              )}
              {selected.status !== 'pending' && (
                <div className="text-sm text-gray-600">
                  This {selected.type === 'booking' ? 'booking' : 'order'} is {selected.status} and cannot be modified.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-3 sm:bottom-5 right-3 sm:right-5 left-3 sm:left-auto z-50 animate-slide-in">
          <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl shadow-lg sm:min-w-[300px] ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 
            toast.type === 'error' ? 'bg-rose-500 text-white' : 
            'bg-blue-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? <CheckCircleIcon /> : 
               toast.type === 'error' ? <ErrorIcon /> : 
               <InfoIcon />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs sm:text-sm">
                {toast.type === 'success' ? 'Success!' : 
                 toast.type === 'error' ? 'Error' : 
                 'Notice'}
              </p>
              <p className="text-xs sm:text-sm opacity-90 truncate">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/80 hover:text-white transition-colors flex-shrink-0">
              <CloseIconSmall />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



/* ----- Icon Components ----- */
function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 3V7M16 3V7M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIconModal() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIconSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

