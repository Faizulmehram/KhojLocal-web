import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Search, CalendarCheck } from "lucide-react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import API_BASE_URL from '../../config/api';

function StatusBadge({ status }) {
  const statusMap = {
    "Pending Payment": { bg: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    "Pending Vendor Confirmation": { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    "Confirmed": { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    "In Progress": { bg: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    "Completed": { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
    "Cancelled": { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
    "Rejected": { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
    "Auto-Rejected": { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
  };
  const cfg = statusMap[status] || statusMap["Pending Vendor Confirmation"];
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium ${cfg.bg}`}>
      <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${cfg.dot}`} />
      {status}
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const canCancel = !["Completed", "Cancelled", "Rejected", "Auto-Rejected"].includes(booking.status);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="hidden sm:flex items-center justify-center rounded-lg p-3 bg-violet-50 text-2xl flex-shrink-0">
              <CalendarCheck className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                {booking.serviceType || "Service Booking"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {booking.vendor?.businessName || "Vendor"}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{booking.bookingTime || "N/A"}</span>
                </div>
                {booking.duration && (
                  <span className="text-gray-600">{booking.duration} minutes</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={booking.status} />
            <p className="font-bold text-base sm:text-lg text-gray-900">
              ${booking.totalAmount?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3 justify-end">
          {canCancel && (
            <button
              onClick={() => onCancel(booking._id)}
              className="rounded-lg h-9 sm:h-10 px-3 sm:px-4 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-200 transition"
            >
              Cancel Booking
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg h-9 sm:h-10 w-9 sm:w-10 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            {expanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            {booking.vendor?.address && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                <p className="text-gray-600">
                  {booking.vendor.address.street || ""}
                  {booking.vendor.address.city && `, ${booking.vendor.address.city}`}
                  {booking.vendor.address.state && `, ${booking.vendor.address.state}`}
                </p>
              </div>
            )}
            {booking.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Special Notes</h4>
                <p className="text-gray-600">{booking.notes}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Payment Status</h4>
              <p className="text-gray-600">{booking.paymentStatus || "Pending"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Payment Method</h4>
              <p className="text-gray-600">{booking.paymentMethod || "N/A"}</p>
            </div>
            {booking.bookingId && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Booking ID</h4>
                <p className="text-gray-600">#{booking._id?.slice(-8) || "N/A"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 mt-6 sm:mt-8">
      <div className="flex justify-center text-gray-300">
        <CalendarCheck className="h-16 w-16 sm:h-20 sm:w-20" />
      </div>
      <h3 className="mt-4 text-lg sm:text-xl font-bold text-gray-900">No bookings yet</h3>
      <p className="mt-2 text-sm sm:text-base text-gray-500">When you book a service, it will appear here.</p>
      <button
        onClick={() => window.location.href = "/main"}
        className="mt-6 rounded-lg h-10 sm:h-11 px-4 sm:px-6 bg-violet-600 text-white text-sm sm:text-base font-semibold hover:bg-violet-700 transition"
      >
        Book a Service
      </button>
    </div>
  );
}

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/user/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setBookings(response.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/auth/user/bookings/${bookingId}/cancel`,
        { cancellationReason: "Cancelled by user" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const upcomingBookings = filteredBookings.filter(
    (b) => !["Completed", "Cancelled", "Rejected", "Auto-Rejected"].includes(b.status)
  );
  const pastBookings = filteredBookings.filter((b) =>
    ["Completed", "Cancelled", "Rejected", "Auto-Rejected"].includes(b.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">My Bookings</h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    className="w-full rounded-lg pl-10 sm:pl-11 pr-4 h-10 sm:h-11 border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    placeholder="Search by service, vendor, date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 h-10 sm:h-11 rounded-lg border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="Pending Payment">Pending Payment</option>
                <option value="Pending Vendor Confirmation">Pending Confirmation</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {bookings.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {upcomingBookings.length > 0 && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold pb-3 sm:pb-4">Upcoming Bookings</h2>
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} />
                    ))}
                  </div>
                </section>
              )}

              {pastBookings.length > 0 && (
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold pt-6 sm:pt-8 pb-3 sm:pb-4">Past Bookings</h2>
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} />
                    ))}
                  </div>
                </section>
              )}

              {filteredBookings.length === 0 && bookings.length > 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-500">No bookings match your search criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

