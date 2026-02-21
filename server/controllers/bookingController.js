const Booking = require("../models/Booking");
const Vendor = require("../models/Vendor");
const { createNotification } = require('./notificationController');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    console.log('=== Creating Booking ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const {
      vendorId,
      labourId,
      serviceType,
      bookingDate,
      bookingTime,
      duration,
      notes,
      paymentMethod,
      workDescription,
      estimatedHours,
    } = req.body;

    // Handle both vendor and labour bookings
    const resourceId = vendorId || labourId;
    const isLabourBooking = !!labourId;

    // Validation
    if (!resourceId || !serviceType || !bookingDate || !bookingTime) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check if vendor exists and is active (skip for labour bookings)
    let vendor = null;
    if (!isLabourBooking) {
      vendor = await Vendor.findById(resourceId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      if (vendor.status !== "Approved" || !vendor.isActive) {
        return res.status(403).json({
          message: "This vendor is not available for bookings",
        });
      }
    }

    // BR-12: Booking must be at least 1 hour in advance and ≤ 30 days
    // Combine bookingDate and bookingTime to create full datetime
    const requestedDate = new Date(bookingDate);
    
    // Parse bookingTime - handle both "HH:MM" and "HH:MM AM/PM" formats
    let hours = 0, minutes = 0;
    if (bookingTime) {
      const timeStr = bookingTime.trim().toUpperCase();
      const isPM = timeStr.includes('PM');
      const isAM = timeStr.includes('AM');
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        
        // Convert to 24-hour format
        if (isPM && hours !== 12) {
          hours += 12;
        } else if (isAM && hours === 12) {
          hours = 0;
        }
      }
    }
    
    requestedDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const hoursDiff = (requestedDate - now) / (1000 * 60 * 60);
    const daysDiff = hoursDiff / 24;

    // Allow bookings with at least 1 hour notice (more flexible)
    if (hoursDiff < 1) {
      return res.status(400).json({
        message: "Bookings must be made at least 1 hour in advance",
      });
    }

    if (daysDiff > 30) {
      return res.status(400).json({
        message: "Bookings cannot be made more than 30 days in advance",
      });
    }

    // Parse duration/estimatedHours - handle strings like "2-4" or "2-4 hours"
    let durationInMinutes = 60; // default
    if (estimatedHours) {
      // Extract first number from strings like "2-4", "2-4 hours", "Under 1 hour"
      const match = String(estimatedHours).match(/(\d+)/);
      if (match) {
        durationInMinutes = parseInt(match[1]) * 60; // convert hours to minutes
      } else if (String(estimatedHours).toLowerCase().includes('under')) {
        durationInMinutes = 30; // "Under 1 hour" = 30 minutes
      }
    } else if (duration) {
      durationInMinutes = parseInt(duration) || 60;
    }

    // Calculate pricing (simplified - should be fetched from service pricing)
    const basePrice = 50; // This should come from vendor's service pricing
    const platformFee = basePrice * 0.1; // 10% platform fee
    const tax = basePrice * 0.08; // 8% tax
    const totalAmount = basePrice + platformFee + tax;

    // Set auto-reject timer: 2 hours from now (BR-27)
    const autoRejectAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Create booking
    const bookingData = {
      user: req.user._id,
      vendor: resourceId, // Works for both vendor and labour (stored in vendor field)
      serviceType,
      bookingDate: requestedDate,
      bookingTime,
      duration: durationInMinutes,
      notes: workDescription || notes,
      paymentMethod: paymentMethod || "Prepaid",
      totalAmount,
      platformFee,
      tax,
      status: "Pending Vendor Confirmation", // All bookings start pending vendor confirmation
      autoRejectAt,
    };

    const booking = await Booking.create(bookingData);

    // Populate details - handle both vendor and labour
    if (isLabourBooking) {
      // For labour bookings, vendor field contains Labour ID
      const Labour = require("../models/Labour");
      const User = require("../models/User");
      
      const labour = await Labour.findById(resourceId).select("userId fullName phone email");
      if (labour) {
        // Create vendor-like object for consistency
        booking.vendor = {
          _id: labour._id,
          businessName: labour.fullName,
          email: labour.email,
          phone: labour.phone,
        };
      }
    } else {
      await booking.populate("vendor", "businessName email phone");
    }

    // Create notification for user
    const vendorName = booking.vendor?.businessName || "the service provider";
    await createNotification({
      user: req.user._id,
      type: 'booking',
      title: 'Booking Placed Successfully',
      message: `Your booking with ${vendorName} for ${bookingDate} at ${bookingTime} has been placed and is awaiting confirmation.`,
      link: `/my-bookings/${booking._id}`,
      relatedBooking: booking._id,
      priority: 'medium',
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getUserBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("vendor", "businessName category address images rating")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private (User/Vendor)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("vendor", "businessName category address phone email images");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    const isUser = booking.user._id.toString() === req.user._id.toString();
    const isVendor = booking.vendor._id.toString() === req.user._id.toString();

    if (!isUser && !isVendor && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view this booking",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
const cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking can be cancelled
    if (["Completed", "Cancelled", "Rejected"].includes(booking.status)) {
      return res.status(400).json({
        message: "This booking cannot be cancelled",
      });
    }

    // BR-15: Late cancellation fee (≤ 12 hours before service)
    const hoursUntilService =
      (new Date(booking.bookingDate) - Date.now()) / (1000 * 60 * 60);
    let refundAmount = booking.totalAmount;

    if (hoursUntilService <= 12 && booking.paymentStatus === "Paid") {
      refundAmount = booking.totalAmount * 0.5; // 50% late cancellation fee
    }

    booking.status = "Cancelled";
    booking.cancellationReason = cancellationReason;
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      refundAmount,
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check availability for a service
// @route   GET /api/bookings/check-availability
// @access  Public
const checkAvailability = async (req, res) => {
  try {
    const { vendorId, date } = req.query;

    if (!vendorId || !date) {
      return res.status(400).json({
        message: "Please provide vendorId and date",
      });
    }

    // Get all bookings for this vendor on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      vendor: vendorId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $in: ["Confirmed", "In Progress", "Pending Vendor Confirmation"],
      },
    }).select("bookingTime duration");

    // Generate available slots (simplified - should consider business hours)
    const allSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    const bookedTimes = existingBookings.map((b) => b.bookingTime);
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.json({
      success: true,
      date,
      availableSlots,
      bookedSlots: bookedTimes,
    });
  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
};
