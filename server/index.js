const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('./config/database');

// Import routes
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminManagementRoutes = require('./routes/adminManagementRoutes');
const publicRoutes = require('./routes/publicRoutes');
const labourRoutes = require('./routes/labourRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const verifyCnicRoute = require('./routes/verifyCnicRoute');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth/user', userRoutes);
app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/auth/admin', adminRoutes);
app.use('/api/admin', adminManagementRoutes);
app.use('/api/vendors', publicRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api', verifyCnicRoute);

console.log('✅ All routes registered including Stripe routes');

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
