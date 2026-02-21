const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const { createNotification } = require('./notificationController');

// @desc    Create Stripe Checkout Session for Order
// @route   POST /api/stripe/create-checkout-session/order
// @access  Private
const createOrderCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId).populate('vendor', 'businessName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Order from ${order.vendor.businessName}`,
              description: `Order #${order.orderNumber || order._id.toString().slice(-6)}`,
            },
            unit_amount: Math.round(order.totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders`,
      metadata: {
        orderId: orderId,
        userId: req.user._id.toString(),
        type: 'order',
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe Checkout Session for Booking
// @route   POST /api/stripe/create-checkout-session/booking
// @access  Private
const createBookingCheckoutSession = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING CHECKOUT SESSION ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user?._id);
    
    const { bookingId } = req.body;

    if (!bookingId) {
      console.log('ERROR: No booking ID provided');
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    console.log('Looking for booking:', bookingId);
    const booking = await Booking.findById(bookingId).populate('vendor');

    if (!booking) {
      console.log('ERROR: Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', booking._id);
    console.log('Vendor type:', booking.vendor);

    // Get the display name - handle both Vendor and Labour
    let vendorName = 'Service Provider';
    if (booking.vendor) {
      if (booking.vendor.businessName) {
        // It's a Vendor
        vendorName = booking.vendor.businessName;
      } else if (booking.vendor.fullName) {
        // It's a Labour
        vendorName = booking.vendor.fullName;
      }
    }

    console.log('Vendor name:', vendorName);
    console.log('Booking user:', booking.user.toString());
    console.log('Request user:', req.user._id.toString());

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      console.log('ERROR: User not authorized');
      return res.status(403).json({ message: 'Not authorized' });
    }

    console.log('Creating Stripe session...');
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking with ${vendorName}`,
              description: `${booking.serviceType} - ${new Date(booking.bookingDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(booking.totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-bookings`,
      metadata: {
        bookingId: bookingId,
        userId: req.user._id.toString(),
        type: 'booking',
      },
    });

    console.log('Stripe session created:', session.id);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment and update order/booking
// @route   GET /api/stripe/verify-session/:sessionId
// @access  Private
const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.payment_status === 'paid') {
      const { orderId, bookingId, type } = session.metadata;

      if (type === 'order' && orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'Paid';
          order.status = 'Confirmed';
          order.stripeSessionId = sessionId;
          order.stripePaymentIntentId = session.payment_intent;
          await order.save();

          // Create notification
          await createNotification({
            user: order.user,
            type: 'order',
            title: 'Payment Successful',
            message: `Your payment of $${order.totalAmount.toFixed(2)} has been processed successfully.`,
            link: `/my-orders/${order._id}`,
            relatedOrder: order._id,
            priority: 'high',
          });
        }
      } else if (type === 'booking' && bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'Paid';
          booking.status = 'Confirmed';
          booking.stripeSessionId = sessionId;
          booking.stripePaymentIntentId = session.payment_intent;
          await booking.save();

          // Create notification
          await createNotification({
            user: booking.user,
            type: 'booking',
            title: 'Payment Successful',
            message: `Your payment of $${booking.totalAmount.toFixed(2)} has been processed successfully.`,
            link: `/my-bookings/${booking._id}`,
            relatedBooking: booking._id,
            priority: 'high',
          });
        }
      }

      res.json({
        success: true,
        paymentStatus: 'paid',
        message: 'Payment verified successfully',
      });
    } else {
      res.json({
        success: false,
        paymentStatus: session.payment_status,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/stripe/webhook
// @access  Public (Stripe)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);

      const { orderId, bookingId, type, userId } = session.metadata;

      if (type === 'order' && orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'Paid';
          order.status = 'Confirmed';
          order.stripeSessionId = session.id;
          order.stripePaymentIntentId = session.payment_intent;
          await order.save();

          // Create notification
          await createNotification({
            user: userId,
            type: 'order',
            title: 'Payment Confirmed',
            message: 'Your order payment has been confirmed and the vendor has been notified.',
            link: `/my-orders/${order._id}`,
            relatedOrder: order._id,
            priority: 'high',
          });
        }
      } else if (type === 'booking' && bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking) {
          booking.paymentStatus = 'Paid';
          booking.status = 'Confirmed';
          booking.stripeSessionId = session.id;
          booking.stripePaymentIntentId = session.payment_intent;
          await booking.save();

          // Create notification
          await createNotification({
            user: userId,
            type: 'booking',
            title: 'Payment Confirmed',
            message: 'Your booking payment has been confirmed.',
            link: `/my-bookings/${booking._id}`,
            relatedBooking: booking._id,
            priority: 'high',
          });
        }
      }
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createOrderCheckoutSession,
  createBookingCheckoutSession,
  verifySession,
  handleWebhook,
};
