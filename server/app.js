const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (restrict access later with authentication)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const labourRoutes = require('./routes/labourRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminManagementRoutes = require('./routes/adminManagementRoutes');
const publicRoutes = require('./routes/publicRoutes');

// API Routes
app.use('/api/auth/user', userRoutes);
app.use('/api/auth/vendor', vendorRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/auth/admin', adminRoutes);
app.use('/api/admin', adminManagementRoutes);
app.use('/api/vendors', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
