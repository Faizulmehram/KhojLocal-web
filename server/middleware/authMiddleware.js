const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const Labour = require('../models/Labour');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('Token received:', token ? 'Yes' : 'No');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      
      console.log('Token decoded:', decoded);

      // Get user/vendor/admin/labour from token based on role
      if (decoded.role === 'user') {
        req.user = await User.findById(decoded.id).select('-password');
        console.log('User found:', req.user ? 'Yes' : 'No');
      } else if (decoded.role === 'vendor') {
        req.user = await Vendor.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'labour') {
        req.labour = await Labour.findById(decoded.id).select('-password');
        req.user = req.labour; // For compatibility with existing code
      }

      if (!req.user && !req.labour) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No authorization header or invalid format');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { protect, adminOnly };
