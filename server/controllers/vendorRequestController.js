const Booking = require("../models/Booking");
const Order = require("../models/Order");


// @desc    Get vendor's incoming booking requests
// @route   GET /api/vendor/bookings
// @access  Private (Vendor)
const getVendorBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { vendor: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get vendor bookings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending booking requests
// @route   GET /api/vendor/bookings/pending
// @access  Private (Vendor)
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      vendor: req.user._id,
      status: { $in: ["Pending Vendor Confirmation", "Pending Payment"] },
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get pending bookings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept booking request
// @route   PUT /api/vendor/bookings/:id/accept
// @access  Private (Vendor)
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to accept this booking",
      });
    }

    // Check if booking is in correct status - allow both pending statuses
    if (booking.status !== "Pending Vendor Confirmation" && booking.status !== "Pending Payment") {
      return res.status(400).json({
        message: "This booking cannot be accepted",
      });
    }

    // Check if booking time has passed - combine date and time
    const bookingDateTime = new Date(booking.bookingDate);
    if (booking.bookingTime) {
      // Parse bookingTime - handle both "HH:MM" and "HH:MM AM/PM" formats
      const timeStr = booking.bookingTime.trim().toUpperCase();
      const isPM = timeStr.includes('PM');
      const isAM = timeStr.includes('AM');
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        
        // Convert to 24-hour format
        if (isPM && hours !== 12) {
          hours += 12;
        } else if (isAM && hours === 12) {
          hours = 0;
        }
        
        bookingDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    
    if (bookingDateTime < new Date()) {
      booking.status = "Auto-Rejected";
      await booking.save();
      return res.status(400).json({
        message: "Cannot accept - requested slot has already passed",
      });
    }

    // Accept booking
    booking.status =
      booking.paymentMethod === "Pay-On-Completion"
        ? "Confirmed"
        : "Pending Payment";
    booking.vendorResponse = {
      respondedAt: Date.now(),
      action: "Accepted",
    };

    await booking.save();
    await booking.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject booking request
// @route   PUT /api/vendor/bookings/:id/reject
// @access  Private (Vendor)
const rejectBooking = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Please provide a rejection reason",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to reject this booking",
      });
    }

    // Reject booking
    booking.status = "Rejected";
    booking.rejectionReason = rejectionReason;
    booking.vendorResponse = {
      respondedAt: Date.now(),
      action: "Rejected",
    };

    await booking.save();
    await booking.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Booking rejected",
      booking,
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Propose reschedule for booking
// @route   PUT /api/vendor/bookings/:id/reschedule
// @access  Private (Vendor)
const rescheduleBooking = async (req, res) => {
  try {
    const { proposedDate, proposedTime } = req.body;

    if (!proposedDate || !proposedTime) {
      return res.status(400).json({
        message: "Please provide proposed date and time",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to reschedule this booking",
      });
    }

    // Store reschedule proposal
    booking.proposedRescheduleDate = new Date(proposedDate);
    booking.proposedRescheduleTime = proposedTime;
    booking.vendorResponse = {
      respondedAt: Date.now(),
      action: "Rescheduled",
    };

    await booking.save();
    await booking.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Reschedule proposal sent to customer",
      booking,
    });
  } catch (error) {
    console.error("Reschedule booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== ORDER REQUEST HANDLERS ====================

// @desc    Get vendor's incoming orders
// @route   GET /api/vendor/orders
// @access  Private (Vendor)
const getVendorOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { vendor: req.user._id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending order requests
// @route   GET /api/vendor/orders/pending
// @access  Private (Vendor)
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      vendor: req.user._id,
      status: { $in: ["Pending Vendor Confirmation", "Pending Payment"] },
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get pending orders error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept order request
// @route   PUT /api/vendor/orders/:id/accept
// @access  Private (Vendor)
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    console.log('=== ACCEPT ORDER ===');
    console.log('Order ID:', req.params.id);
    console.log('Order found:', !!order);
    if (order) {
      console.log('Order status:', order.status);
      console.log('Order vendor:', order.vendor.toString());
      console.log('Request vendor:', req.user._id.toString());
      console.log('Payment method:', order.paymentMethod);
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns this order
    if (order.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to accept this order",
      });
    }

    // Check if order is in correct status
    if (order.status !== "Pending Vendor Confirmation" && order.status !== "Pending Payment") {
      console.log('ERROR: Order status is not valid for acceptance, it is:', order.status);
      return res.status(400).json({
        message: `This order cannot be accepted. Current status: ${order.status}`,
      });
    }

    // For Pending Payment orders, verify payment is actually completed
    if (order.status === "Pending Payment" && order.paymentMethod === "Stripe") {
      if (order.paymentStatus !== "Paid") {
        return res.status(400).json({
          message: "Cannot accept order - payment has not been completed yet",
        });
      }
    }

    // Accept order based on payment method
    if (order.paymentMethod === "Stripe") {
      // For Stripe orders, check payment status
      if (order.paymentStatus !== "Paid") {
        order.status = "Pending Payment";
      } else {
        order.status = "Confirmed";
      }
    } else if (order.paymentMethod === "Pay-On-Delivery") {
      order.status = "Confirmed";
    } else {
      // Prepaid
      order.status = "Pending Payment";
    }

    order.vendorResponse = {
      respondedAt: Date.now(),
      action: "Accepted",
    };
    order.statusHistory.push({
      status: order.status,
      timestamp: Date.now(),
      updatedBy: "Vendor",
    });

    await order.save();
    await order.populate("user", "name email phone");

    console.log('Order accepted successfully, new status:', order.status);

    res.json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Accept order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject order request
// @route   PUT /api/vendor/orders/:id/reject
// @access  Private (Vendor)
const rejectOrder = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Please provide a rejection reason",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns this order
    if (order.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to reject this order",
      });
    }

    // Reject order
    order.status = "Rejected";
    order.rejectionReason = rejectionReason;
    order.vendorResponse = {
      respondedAt: Date.now(),
      action: "Rejected",
    };
    order.statusHistory.push({
      status: "Rejected",
      timestamp: Date.now(),
      updatedBy: "Vendor",
    });

    await order.save();
    await order.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Order rejected",
      order,
    });
  } catch (error) {
    console.error("Reject order error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Booking handlers
  getVendorBookings,
  getPendingBookings,
  acceptBooking,
  rejectBooking,
  rescheduleBooking,
  // Order handlers
  getVendorOrders,
  getPendingOrders,
  acceptOrder,
  rejectOrder,
};
