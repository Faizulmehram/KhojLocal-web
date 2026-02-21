const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      description: String,
    },
  ],
  orderType: {
    type: String,
    enum: ["Delivery", "Pickup"],
    required: true,
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  specialInstructions: {
    type: String,
    maxlength: 500,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Prepaid", "Pay-On-Delivery", "Stripe"],
    default: "Prepaid",
  },
  stripeSessionId: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },
  status: {
    type: String,
    enum: [
      "Pending Payment",
      "Pending Vendor Confirmation",
      "Confirmed",
      "In Progress",
      "Out for Delivery",
      "Ready for Pickup",
      "Completed",
      "Cancelled",
      "Rejected",
      "Auto-Rejected",
    ],
    default: "Pending Vendor Confirmation",
  },
  estimatedDeliveryTime: {
    type: Date,
  },
  actualDeliveryTime: {
    type: Date,
  },
  autoRejectAt: {
    type: Date,
  },
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      updatedBy: String,
      notes: String,
    },
  ],
  cancellationReason: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  vendorResponse: {
    respondedAt: Date,
    action: {
      type: String,
      enum: ["Accepted", "Rejected"],
    },
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, status: 1 });
orderSchema.index({ createdAt: 1, vendor: 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

