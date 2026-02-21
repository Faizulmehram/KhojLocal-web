const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/userController');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  validateCart,
} = require('../controllers/orderController');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentById,
  getUserPayments,
} = require('../controllers/paymentController');
const { getRecommendations } = require('../controllers/enhancedSearchController');
const { getOrderStatusHistory } = require('../controllers/statusController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Booking Management (User)
router.post('/bookings', protect, createBooking);
router.post('/labour-bookings', protect, createBooking); // Labour bookings use same endpoint
router.get('/bookings/my-bookings', protect, getUserBookings);
router.get('/bookings/:id', protect, getBookingById);
router.put('/bookings/:id/cancel', protect, cancelBooking);

// Order Management (User)
router.post('/orders', protect, createOrder);
router.get('/orders/my-orders', protect, getUserOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/cancel', protect, cancelOrder);
router.post('/orders/validate-cart', protect, validateCart);
router.get('/orders/:id/status-history', protect, getOrderStatusHistory);

// Payment Management (User)
router.post('/payments/create-intent', protect, createPaymentIntent);
router.post('/payments/:id/confirm', protect, confirmPayment);
router.get('/payments/:id', protect, getPaymentById);
router.get('/payments', protect, getUserPayments);

// Search & Recommendations
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
