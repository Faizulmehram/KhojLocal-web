const crypto = require("crypto");

// In-memory store for OTPs (In production, use Redis or database)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Store OTP with expiry (5 minutes)
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 */
const storeOTP = (phone, otp) => {
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now
  otpStore.set(phone, { otp, expiry });
  
  // Cleanup expired OTPs
  setTimeout(() => {
    otpStore.delete(phone);
  }, 5 * 60 * 1000);
};

/**
 * Verify OTP
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code to verify
 * @returns {boolean} True if OTP is valid
 */
const verifyOTP = (phone, otp) => {
  const stored = otpStore.get(phone);
  
  if (!stored) {
    return false; // No OTP found
  }
  
  if (Date.now() > stored.expiry) {
    otpStore.delete(phone);
    return false; // OTP expired
  }
  
  if (stored.otp !== otp) {
    return false; // OTP mismatch
  }
  
  // OTP is valid, delete it
  otpStore.delete(phone);
  return true;
};

/**
 * Send OTP via SMS (Mock implementation)
 * In production, integrate with SMS service like Twilio, SendGrid, etc.
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 */
const sendOTPSMS = async (phone, otp) => {
  // Mock implementation - log to console
  console.log(`📱 SMS OTP to ${phone}: ${otp}`);
  console.log(`⏰ OTP valid for 5 minutes`);
  
  // In production, use SMS service:
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: `Your Khooj Local verification code is: ${otp}. Valid for 5 minutes.`,
  //   from: '+1234567890',
  //   to: phone
  // });
  
  return true;
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTPSMS,
};
