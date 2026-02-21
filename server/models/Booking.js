const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
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
  serviceType: {
    type: String,
    required: [true, "Please specify the service type"],
  },
  bookingDate: {
    type: Date,
    required: [true, "Please provide a booking date"],
  },
  bookingTime: {
    type: String,
    required: [true, "Please provide a booking time"],
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  status: {
    type: String,
    enum: [
      "Pending Payment",
      "Pending Vendor Confirmation",
      "Confirmed",
      "In Progress",
      "Completed",
      "Cancelled",
      "Rejected",
      "Auto-Rejected",
    ],
    default: "Pending Vendor Confirmation",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["Prepaid", "Pay-On-Completion", "Stripe"],
    default: "Prepaid",
  },
  stripeSessionId: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  cancellationReason: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  proposedRescheduleDate: {
    type: Date,
  },
  proposedRescheduleTime: {
    type: String,
  },
  vendorResponse: {
    respondedAt: Date,
    action: {
      type: String,
      enum: ["Accepted", "Rejected", "Rescheduled"],
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
  // Auto-rejection timer
  autoRejectAt: {
    type: Date,
  },
});

// Update the updatedAt timestamp before saving
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vendor: 1, status: 1 });
bookingSchema.index({ bookingDate: 1, vendor: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
