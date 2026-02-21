const Order = require("../models/Order");
const Vendor = require("../models/Vendor");
const { createNotification } = require('./notificationController');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (User)
const createOrder = async (req, res) => {
  try {
    const {
      vendorId,
      items,
      orderType,
      deliveryAddress,
      specialInstructions,
      paymentMethod,
    } = req.body;

    // Validation
    if (!vendorId || !items || items.length === 0 || !orderType) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (orderType === "Delivery" && !deliveryAddress) {
      return res.status(400).json({
        message: "Delivery address is required for delivery orders",
      });
    }

    // Check if vendor exists and is active
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.status !== "Approved" || !vendor.isActive) {
      return res.status(403).json({
        message: "This vendor is not available for orders",
      });
    }

    // Calculate order totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = orderType === "Delivery" ? 5.0 : 0;
    const platformFee = subtotal * 0.1; // 10% platform fee
    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + deliveryFee + platformFee + tax;

    // BR-13: Perishable orders must be placed ≥ 2 hours before delivery/pickup
    const estimatedDeliveryTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Set auto-reject timer: 2 hours from now (BR-27)
    const autoRejectAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      vendor: vendorId,
      items,
      orderType,
      deliveryAddress: orderType === "Delivery" ? deliveryAddress : undefined,
      specialInstructions,
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || "Prepaid",
      status:
        paymentMethod === "Pay-On-Delivery"
          ? "Pending Vendor Confirmation"
          : "Pending Payment",
      estimatedDeliveryTime,
      autoRejectAt,
      statusHistory: [
        {
          status: "Pending Vendor Confirmation",
          timestamp: Date.now(),
          updatedBy: "User",
        },
      ],
    });

    // Populate vendor details
    await order.populate("vendor", "businessName email phone category");

    // Create notification for user
    await createNotification({
      user: req.user._id,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order #${order.orderNumber || order._id.toString().slice(-6)} has been placed and is awaiting vendor confirmation.`,
      link: `/my-orders/${order._id}`,
      relatedOrder: order._id,
      priority: 'medium',
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private (User)
const getUserOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("vendor", "businessName category address images rating")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (User/Vendor)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("vendor", "businessName category address phone email images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isUser = order.user._id.toString() === req.user._id.toString();
    const isVendor = order.vendor._id.toString() === req.user._id.toString();

    if (!isUser && !isVendor && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private (User)
const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (
      ["Completed", "Delivered", "Cancelled", "Rejected"].includes(order.status)
    ) {
      return res.status(400).json({
        message: "This order cannot be cancelled",
      });
    }

    // If order is already in progress, may need vendor approval
    if (order.status === "In Progress") {
      return res.status(400).json({
        message:
          "Cannot cancel order that is already in progress. Please contact vendor.",
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = cancellationReason;
    order.statusHistory.push({
      status: "Cancelled",
      timestamp: Date.now(),
      updatedBy: "User",
    });

    await order.save();

    // Create notification for user
    await createNotification({
      user: req.user._id,
      type: 'order',
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber || order._id.toString().slice(-6)} has been cancelled.`,
      link: `/my-orders/${order._id}`,
      relatedOrder: order._id,
      priority: 'medium',
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart (future feature - for now just validation)
// @route   POST /api/orders/validate-cart
// @access  Private (User)
const validateCart = async (req, res) => {
  try {
    const { vendorId, items } = req.body;

    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({
        message: "Please provide vendor and items",
      });
    }

    // Check vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || vendor.status !== "Approved") {
      return res.status(404).json({
        message: "Vendor not available",
      });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const platformFee = subtotal * 0.1;
    const tax = subtotal * 0.08;

    res.json({
      success: true,
      validation: {
        subtotal,
        platformFee,
        tax,
        total: subtotal + platformFee + tax,
      },
    });
  } catch (error) {
    console.error("Validate cart error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder, validateCart };
