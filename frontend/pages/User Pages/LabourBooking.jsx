import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Briefcase, Award, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

// Helper function to get days in a month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
];

function CalendarComponent({ selectedDate, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
  const prevMonthPadding = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
  const totalCells = prevMonthPadding.length + days.length;
  const nextMonthPaddingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthPadding = Array.from({ length: nextMonthPaddingCount }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    const checkDate = new Date(currentYear, currentMonth, day);
    return selectedDate.getFullYear() === checkDate.getFullYear() &&
           selectedDate.getMonth() === checkDate.getMonth() &&
           selectedDate.getDate() === checkDate.getDate();
  };

  const isDatePast = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(23, 59, 59, 999);
    return checkDate < today;
  };

  const handleDateClick = (day) => {
    if (!isDatePast(day)) {
      onSelectDate(new Date(currentYear, currentMonth, day));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="font-semibold">{monthNames[currentMonth]} {currentYear}</div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-3 text-gray-500">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="py-2 font-medium">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm text-center">
        {prevMonthPadding.map(day => <div key={`prev-${day}`} className="text-gray-300 py-2">{day}</div>)}
        {days.map(day => (
          <div key={day} className="py-2">
            <button
              onClick={() => handleDateClick(day)}
              disabled={isDatePast(day)}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-full transition ${
                isDateSelected(day) ? "bg-blue-600 text-white font-semibold shadow" :
                isDatePast(day) ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          </div>
        ))}
        {nextMonthPadding.map(day => <div key={`next-${day}`} className="text-gray-300 py-2">{day}</div>)}
      </div>
    </div>
  );
}

export default function LabourBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const labour = state?.labour;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [workDescription, setWorkDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("2-4");
  const [paymentMethod, setPaymentMethod] = useState("Pay-On-Completion");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please login first to hire a worker');
      navigate('/');
    }
  }, []);

  if (!labour) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">No Worker Selected</h2>
          <p className="text-gray-600 mb-6">Please select a worker from the main page.</p>
          <button onClick={() => navigate('/main')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Main Page
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("Please login to hire a worker");
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);
      const token = user.token;

      const bookingData = {
        labourId: labour._id,
        serviceType: labour.tradeCategory || labour.skill,
        bookingDate: selectedDate.toISOString(),
        bookingTime: selectedTime,
        workDescription,
        estimatedHours,
        notes: workDescription,
        paymentMethod: paymentMethod === "Stripe" ? "Stripe" : "Pay-On-Completion",
      };

      // Create the booking first
      console.log("=== FRONTEND: Creating Booking ===");
      console.log("Labour ID:", labour._id);
      console.log("Booking Data:", bookingData);
      console.log("Token:", token);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/user/labour-bookings`,
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Booking Response:", response.data);

      if (response.data.success) {
        const bookingId = response.data.booking._id;

        // If Stripe payment, create checkout session
        if (paymentMethod === "Stripe") {
          const stripeResponse = await axios.post(
            `${API_BASE_URL}/api/stripe/create-checkout-session/booking`,
            { bookingId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (stripeResponse.data.url) {
            // Redirect to Stripe checkout
            window.location.href = stripeResponse.data.url;
            return;
          }
        }

        // For Pay-On-Completion
        alert("Worker hired successfully! They will contact you soon.");
        navigate("/main");
      }
    } catch (error) {
      console.error("=== FRONTEND: Booking Error ===");
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      alert(error.response?.data?.message || error.message || "Failed to hire worker. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Worker Info Header */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {labour.businessName?.split(' ')[0]?.charAt(0)}{labour.businessName?.split(' ')[1]?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{labour.businessName}</h2>
                <Award className="h-5 w-5" />
              </div>
              <p className="text-blue-100">{labour.tradeCategory || labour.skill} • {labour.experience || 0} years experience</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{labour.rating || 0}</span>
                <span className="text-blue-100">({labour.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                1. Select Date & Time
              </h3>
              <CalendarComponent selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {TIMES.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedTime === time ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>

            {/* Work Details */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">2. Describe Your Work</h3>
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe the work you need done..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
                <select
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1-2">1-2 hours</option>
                  <option value="2-4">2-4 hours</option>
                  <option value="4-8">4-8 hours (Half day)</option>
                  <option value="8+">Full day or more</option>
                </select>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">3. Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "Pay-On-Completion" ? "border-blue-600 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}>
                  <input type="radio" name="payment" value="Pay-On-Completion" checked={paymentMethod === "Pay-On-Completion"}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Pay After Completion</div>
                    <p className="text-sm text-gray-600 mt-1">Pay after the work is completed</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "Stripe" ? "border-blue-600 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}>
                  <input type="radio" name="payment" value="Stripe" checked={paymentMethod === "Stripe"}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      Pay with Card (Stripe)
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Secure</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay now with credit/debit card</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Summary Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Worker</span>
                  <span className="font-semibold">{labour.businessName?.split(' - ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{labour.tradeCategory || labour.skill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{estimatedHours} hours</span>
                </div>
              </div>
              <hr className="my-4" />
              <p className="text-xs text-gray-500 mb-4">Rate will be discussed with the worker based on your requirements.</p>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
