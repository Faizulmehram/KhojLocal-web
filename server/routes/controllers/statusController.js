import Booking from "../models/Booking.js";
import Order from "../models/Order.js";
const { createNotification } = require('../../controllers/notificationController');

// ==================== BOOKING STATUS UPDATES ====================

// @desc    Update booking status (Vendor)
// @route   PUT /api/vendor/bookings/:id/status
// @access  Private (Vendor)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Please provide a status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if vendor owns this booking
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this booking",
      });
    }

    // BR-30: Validate booking status transitions
    const validTransitions = {
      Confirmed: ["In Progress", "Cancelled"],
      "In Progress": ["Completed", "Cancelled"],
    };

    // Check if transition is valid
    if (
      !validTransitions[booking.status] ||
      !validTransitions[booking.status].includes(status)
    ) {
      return res.status(400).json({
        message: `Cannot transition from ${booking.status} to ${status}`,
      });
    }

    // Additional validation for "In Progress"
    if (status === "In Progress") {
      const bookingDateTime = new Date(booking.bookingDate);
      if (bookingDateTime > new Date()) {
        return res.status(400).json({
          message: "Cannot mark as 'In Progress' before scheduled time",
        });
      }
    }

    // Additional validation for "Completed"
    if (status === "Completed") {
      booking.completedAt = Date.now();

      // If payment method is Pay-On-Completion, trigger payment request
      if (booking.paymentMethod === "Pay-On-Completion") {
        booking.paymentStatus = "Pending";
        // In production: Generate payment invoice and send to user
      }
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Create notification for user
    const statusMessages = {
      'In Progress': 'Your booking is now in progress.',
      'Completed': 'Your booking has been completed.',
      'Cancelled': 'Your booking has been cancelled.',
    };
    
    if (statusMessages[status]) {
      await createNotification({
        user: booking.user._id,
        type: 'booking',
        title: `Booking ${status}`,
        message: statusMessages[status],
        link: `/my-bookings/${booking._id}`,
        relatedBooking: booking._id,
        priority: status === 'Completed' ? 'high' : 'medium',
      });
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active bookings for vendor
// @route   GET /api/vendor/bookings/active
// @access  Private (Vendor)
const getActiveBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      vendor: req.user._id,
      status: { $in: ["Confirmed", "In Progress"] },
    })
      .populate("user", "name email phone")
      .sort({ bookingDate: 1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get active bookings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== ORDER STATUS UPDATES ====================

// @desc    Update order status (Vendor)
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Please provide a status",
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns this order
    if (order.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this order",
      });
    }

    // BR-31: Validate order status transitions
    const validTransitions = {
      Confirmed: ["In Progress", "Cancelled"],
      "In Progress": [
        "Out for Delivery",
        "Ready for Pickup",
        "Completed",
        "Cancelled",
      ],
      "Out for Delivery": ["Delivered", "Cancelled"],
      "Ready for Pickup": ["Completed", "Cancelled"],
      Delivered: ["Completed"],
    };

    // Check if transition is valid
    if (
      !validTransitions[order.status] ||
      !validTransitions[order.status].includes(status)
    ) {
      return res.status(400).json({
        message: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    // Additional validation based on order type
    if (status === "Out for Delivery" && order.orderType !== "Delivery") {
      return res.status(400).json({
        message: "Cannot set 'Out for Delivery' for pickup orders",
      });
    }

    if (status === "Ready for Pickup" && order.orderType !== "Pickup") {
      return res.status(400).json({
        message: "Cannot set 'Ready for Pickup' for delivery orders",
      });
    }

    // Handle special status updates
    if (status === "Delivered" || status === "Completed") {
      order.actualDeliveryTime = Date.now();

      // If payment method is Pay-On-Delivery, trigger payment
      if (order.paymentMethod === "Pay-On-Delivery") {
        order.paymentStatus = "Pending";
        // In production: Generate payment invoice and send to user
      }
    }

    // Update status and add to history
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: Date.now(),
      updatedBy: "Vendor",
    });

    await order.save();

    // Create notification for user
    const statusMessages = {
      'In Progress': 'Your order is now being prepared.',
      'Out for Delivery': 'Your order is out for delivery.',
      'Ready for Pickup': 'Your order is ready for pickup.',
      'Delivered': 'Your order has been delivered.',
      'Completed': 'Your order has been completed.',
      'Cancelled': 'Your order has been cancelled.',
    };
    
    if (statusMessages[status]) {
      await createNotification({
        user: order.user._id,
        type: 'order',
        title: `Order ${status}`,
        message: statusMessages[status],
        link: `/my-orders/${order._id}`,
        relatedOrder: order._id,
        priority: ['Delivered', 'Ready for Pickup', 'Out for Delivery'].includes(status) ? 'high' : 'medium',
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active orders for vendor
// @route   GET /api/vendor/orders/active
// @access  Private (Vendor)
const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      vendor: req.user._id,
      status: {
        $in: [
          "Confirmed",
          "In Progress",
          "Out for Delivery",
          "Ready for Pickup",
        ],
      },
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get active orders error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update estimated delivery time
// @route   PUT /api/vendor/orders/:id/delivery-time
// @access  Private (Vendor)
const updateDeliveryTime = async (req, res) => {
  try {
    const { estimatedDeliveryTime } = req.body;

    if (!estimatedDeliveryTime) {
      return res.status(400).json({
        message: "Please provide estimated delivery time",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if vendor owns this order
    if (order.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this order",
      });
    }

    order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    await order.save();

    res.json({
      success: true,
      message: "Delivery time updated",
      order,
    });
  } catch (error) {
    console.error("Update delivery time error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order status history
// @route   GET /api/orders/:id/history
// @access  Private (User/Vendor)
const getOrderStatusHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select("statusHistory status")
      .populate("user", "name")
      .populate("vendor", "businessName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isUser = order.user._id.toString() === req.user._id.toString();
    const isVendor = order.vendor._id.toString() === req.user._id.toString();

    if (!isUser && !isVendor && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view this order history",
      });
    }

    res.json({
      success: true,
      currentStatus: order.status,
      history: order.statusHistory,
    });
  } catch (error) {
    console.error("Get order status history error:", error);
    res.status(500).json({ message: error.message });
  }
};

export {
  // Booking status
  updateBookingStatus,
  getActiveBookings,
  // Order status
  updateOrderStatus,
  getActiveOrders,
  updateDeliveryTime,
  getOrderStatusHistory,
};
