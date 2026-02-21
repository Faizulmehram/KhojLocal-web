const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOrderCheckoutSession,
  createBookingCheckoutSession,
  verifySession,
  handleWebhook,
} = require('../controllers/stripeController');

// Webhook route (must be before express.json() middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-checkout-session/order', protect, createOrderCheckoutSession);
router.post('/create-checkout-session/booking', protect, createBookingCheckoutSession);
router.get('/verify-session/:sessionId', protect, verifySession);

module.exports = router;
