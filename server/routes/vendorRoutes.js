const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  sendVendorOTP,
  verifyVendorOTP,
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
} = require("../controllers/vendorController");
const { acceptBooking, acceptOrder, getPendingBookings, getPendingOrders, getVendorBookings, getVendorOrders, rejectBooking, rejectOrder, rescheduleBooking } = require("../controllers/vendorRequestController");
const { getActiveBookings, getActiveOrders, updateBookingStatus, updateDeliveryTime, updateOrderStatus } = require("../controllers/statusController");
const { getVendorPayments, processRefund } = require("../controllers/paymentController");

// Public routes - OTP verification
router.post("/send-otp", sendVendorOTP);
router.post("/verify-otp", verifyVendorOTP);
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// Protected routes
router.get("/profile", protect, getVendorProfile);
router.put("/profile", protect, updateVendorProfile);

// Vendor Booking Management
router.get("/vendor/bookings", protect, getVendorBookings);
router.get("/vendor/bookings/pending", protect, getPendingBookings);
router.get("/vendor/bookings/active", protect, getActiveBookings);
router.put("/vendor/bookings/:id/accept", protect, acceptBooking);
router.put("/vendor/bookings/:id/reject", protect, rejectBooking);
router.put("/vendor/bookings/:id/reschedule", protect, rescheduleBooking);
router.put("/vendor/bookings/:id/status", protect, updateBookingStatus);

// Vendor Order Management
router.get("/vendor/orders", protect, getVendorOrders);
router.get("/vendor/orders/pending", protect, getPendingOrders);
router.get("/vendor/orders/active", protect, getActiveOrders);
router.put("/vendor/orders/:id/accept", protect, acceptOrder);
router.put("/vendor/orders/:id/reject", protect, rejectOrder);
router.put("/vendor/orders/:id/status", protect, updateOrderStatus);
router.put("/vendor/orders/:id/delivery-time", protect, updateDeliveryTime);

// Vendor Payment Management
router.get("/vendor/payments", protect, getVendorPayments);
router.post("/payments/:id/refund", protect, processRefund);
module.exports = router;
