import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import axios from "axios";

// Helper function to get days in a month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get first day of month (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

/* Mock timeslots */
const TIMES = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","1:00 PM","1:30 PM","2:00 PM"
];


/* Service option (radio-like) */
function ServiceOption({ service, selected, onSelect }) {
  return (
    <label
      className={`flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border p-3 sm:p-4 cursor-pointer transition ${selected ? "border-violet-600 ring-2 ring-violet-200 bg-violet-50" : "border-gray-200"}`}
      onClick={() => onSelect(service.id)}
    >
      <input
        type="radio"
        name="service"
        checked={selected}
        readOnly
        className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600"
        aria-hidden
      />
      <div className="flex-1">
        <div className="font-medium text-sm sm:text-base">{service.name}</div>
        <div className="text-xs sm:text-sm text-gray-500">{service.duration} min • ${service.price.toFixed(2)}</div>
      </div>
    </label>
  );
}

function Calendar({ selectedDate, onSelectDate }) {
  // Initialize to selected date's month/year, or current month if no selection
  const initialMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  const initialYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);

  // Update calendar view when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get previous month's last days for padding
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
  const prevMonthPadding = Array.from(
    { length: firstDay },
    (_, i) => prevMonthDays - firstDay + i + 1
  );

  // Calculate how many cells we need to fill the last row (complete to multiple of 7)
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
    return (
      selectedDate.getFullYear() === checkDate.getFullYear() &&
      selectedDate.getMonth() === checkDate.getMonth() &&
      selectedDate.getDate() === checkDate.getDate()
    );
  };

  const isDatePast = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(23, 59, 59, 999);
    return checkDate < today;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (!isDatePast(day)) {
      onSelectDate(clickedDate);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition" 
          aria-label="Previous Month"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="font-semibold text-sm sm:text-base">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button 
          onClick={handleNextMonth}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition" 
          aria-label="Next Month"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm mb-2 sm:mb-3 text-gray-500">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="py-1.5 sm:py-2 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-xs sm:text-sm text-center">
        {/* Previous month's days (grayed out) */}
        {prevMonthPadding.map(day => (
          <div key={`prev-${day}`} className="text-gray-300 py-1.5 sm:py-2">
            {day}
          </div>
        ))}
        
        {/* Current month's days */}
        {days.map(day => {
          const isSelected = isDateSelected(day);
          const isPast = isDatePast(day);
          return (
            <div key={day} className="py-1 sm:py-2">
              <button
                onClick={() => handleDateClick(day)}
                disabled={isPast}
                className={`inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full transition ${
                  isSelected 
                    ? "bg-violet-600 text-white font-semibold shadow" 
                    : isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
                aria-pressed={isSelected}
                aria-disabled={isPast}
              >
                {day}
              </button>
            </div>
          );
        })}
        
        {/* Next month's days (grayed out) */}
        {nextMonthPadding.map(day => (
          <div key={`next-${day}`} className="text-gray-300 py-1.5 sm:py-2">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimesGrid({ selectedTime, onSelectTime }) {
  return (
    <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
      {TIMES.map(t => {
        const disabled = t === "1:00 PM"; // keep same disabled example
        const isSelected = t === selectedTime;
        return (
          <button
            key={t}
            onClick={() => !disabled && onSelectTime(t)}
            disabled={disabled}
            className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold border ${isSelected ? "bg-violet-600 text-white border-violet-600 shadow" : "border-gray-300 hover:border-violet-600 hover:text-violet-700"} ${disabled ? "text-gray-400 cursor-not-allowed" : ""} active:scale-95 transition`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function BookingSummary({ service, date, time, onConfirm, loading }) {
  if (!service) return null;
  
  const formatDate = (date) => {
    if (!date) return "-";
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm lg:sticky lg:top-20">
      <h3 className="text-lg sm:text-xl font-bold">Your Booking Summary</h3>
      <div className="text-xs sm:text-sm space-y-2">
        <div className="flex justify-between"><span className="text-gray-600">Service</span><span className="font-semibold">{service.name}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="font-semibold">{formatDate(date)}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Time</span><span className="font-semibold">{time || "-"}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Duration</span><span className="font-semibold">{service.duration} min</span></div>
      </div>
      <hr />
      <div className="flex justify-between items-center">
        <span className="text-base sm:text-lg font-bold">Total</span>
        <span className="text-xl sm:text-2xl font-black text-violet-600">${service.price.toFixed(2)}</span>
      </div>
      <button 
        onClick={onConfirm}
        disabled={loading}
        className="w-full rounded-xl h-11 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-bold shadow active:scale-95 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
}

export default function UserBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Initialize vendor from navigation state
  const [vendor, setVendor] = useState(() => {
    const vendorData = state?.vendor || state?.business;
    console.log('Initial vendor data:', vendorData);
    return vendorData;
  });
  
  const [vendorLoading, setVendorLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  // Set initial date to tomorrow (to ensure it's at least 1 hour in advance)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay-On-Completion");
  const [loading, setLoading] = useState(false);

  // Check authentication and load vendor services on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    console.log('UserBooking - checking auth');
    console.log('User string from localStorage:', userStr);
    
    if (!userStr) {
      alert('Please login first to make a booking');
      navigate('/');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('Parsed user object:', user);
      console.log('User has token:', !!user.token);
      
      if (!user.token) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      alert('Invalid session. Please login again.');
      localStorage.removeItem('user');
      navigate('/');
      return;
    }

    console.log('Vendor state on mount:', vendor);
    
    // Load vendor services
    if (vendor && vendor.services && Array.isArray(vendor.services)) {
      // Transform vendor services to match expected format
      const vendorServices = vendor.services.map((serviceName, index) => ({
        id: `service-${index}`,
        name: serviceName,
        duration: 60, // Default duration
        price: 50, // Default price - can be customized
      }));
      setServices(vendorServices);
      if (vendorServices.length > 0) {
        setSelectedServiceId(vendorServices[0].id);
      }
    } else {
      console.warn('Vendor has no services:', vendor);
    }
  }, [vendor]); // Re-run when vendor changes

  const service = useMemo(() => services.find(s => s.id === selectedServiceId), [selectedServiceId, services]);

  const handleBooking = async () => {
    console.log('handleBooking called');
    console.log('Current vendor state:', vendor);
    console.log('Vendor ID:', vendor?._id);
    
    // Double check vendor exists
    if (!vendor) {
      console.error('Vendor is null!');
      alert("Vendor information is missing. Please go back and select a vendor again.");
      navigate("/main");
      return;
    }

    if (!vendor._id) {
      console.error('Vendor._id is null!', vendor);
      alert("Vendor ID is missing. Please select a vendor again.");
      navigate("/main");
      return;
    }

    setLoading(true);
    try {
      // Get user object from localStorage
      const userStr = localStorage.getItem("user");
      
      if (!userStr) {
        alert("Please login to make a booking");
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);
      const actualToken = user.token;
      
      if (!actualToken) {
        alert("Session expired. Please login again.");
        navigate("/");
        return;
      }

      console.log('Creating booking with vendor ID:', vendor._id);
      console.log('Token available:', !!actualToken);

      // Use the selected date and combine with selected time
      const bookingDate = new Date(selectedDate);
      const bookingData = {
        vendorId: vendor._id,
        serviceType: service.name,
        bookingDate: bookingDate.toISOString(),
        bookingTime: selectedTime,
        duration: service.duration,
        notes,
        paymentMethod: paymentMethod === "Stripe" ? "Stripe" : "Pay-On-Completion",
      };

      console.log('Booking data:', bookingData);

      const response = await axios.post(
        "http://localhost:5000/api/auth/user/bookings",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${actualToken}`,
          },
        }
      );

      if (response.data.success) {
        const bookingId = response.data.booking._id;
        
        // If Stripe payment selected, redirect to Stripe Checkout
        if (paymentMethod === "Stripe") {
          const stripeResponse = await axios.post(
            "http://localhost:5000/api/stripe/create-checkout-session/booking",
            { bookingId },
            {
              headers: {
                Authorization: `Bearer ${actualToken}`,
              },
            }
          );

          if (stripeResponse.data.success) {
            // Redirect to Stripe Checkout
            window.location.href = stripeResponse.data.url;
          } else {
            alert("Failed to create payment session. Please try again.");
          }
        } else {
          alert("Booking created successfully! The vendor will be notified.");
          navigate("/my-bookings");
        }
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {vendorLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      ) : !vendor ? (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">No Vendor Selected</h2>
          <p className="text-gray-600 mb-6">Please select a vendor from the main page to book an appointment.</p>
          <button 
            onClick={() => navigate('/main')}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Go to Main Page
          </button>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {vendor && (
          <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
            <h2 className="text-lg font-bold">{vendor.businessName || "Vendor"}</h2>
            <p className="text-sm text-gray-600">{vendor.category}</p>
          </div>
        )}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">Book Your Appointment</h1>
            <div className="mt-3">
              <p className="text-xs sm:text-sm text-gray-600">Step 1 of 3: Select Service &amp; Time</p>
              <div className="mt-2 sm:mt-3 h-2 rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-violet-600" style={{ width: "33%" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">1. Choose a Service</h2>
                {services.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <p>No services available for this vendor.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {services.map(s => (
                      <ServiceOption
                        key={s.id}
                        service={s}
                        selected={s.id === selectedServiceId}
                        onSelect={(id) => setSelectedServiceId(id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">2. Select a Date &amp; Time</h2>
                <div>
                  <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                  <TimesGrid selectedTime={selectedTime} onSelectTime={setSelectedTime} />
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">3. Select Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "Pay-On-Completion" ? "border-violet-600 ring-2 ring-violet-200 bg-violet-50" : "border-gray-200 hover:border-violet-300"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Pay-On-Completion"
                      checked={paymentMethod === "Pay-On-Completion"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-5 w-5 text-violet-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Pay On Completion</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay after the service is completed
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "Stripe" ? "border-violet-600 ring-2 ring-violet-200 bg-violet-50" : "border-gray-200 hover:border-violet-300"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Stripe"
                      checked={paymentMethod === "Stripe"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-5 w-5 text-violet-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Pay with Card (Stripe)
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Secure</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay now with credit/debit card using Stripe
                      </p>
                    </div>
                  </label>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">4. Special Notes (Optional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes for the vendor..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </section>
            </div>

            <aside className="lg:col-span-1 order-first lg:order-last">
              <BookingSummary 
                service={service} 
                date={selectedDate} 
                time={selectedTime}
                onConfirm={handleBooking}
                loading={loading}
              />
            </aside>
          </div>
        </div>
      </main>
      )}
    </div>
  );
}
