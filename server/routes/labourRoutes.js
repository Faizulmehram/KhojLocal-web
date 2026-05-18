const express = require("express");
const router = express.Router();
const {
  sendPhoneOTP,
  verifyPhoneOTP,
  registerLabour,
  getLabourProfile,
  updateLabourProfile,
  getAllLabour,
  searchLabourByLocation,
  getPendingLabour,
  approveLabour,
  rejectLabour,
  getLabourBookings,
} = require("../controllers/labourController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { labourDocumentUpload } = require("../middleware/uploadMiddleware");

// Public routes
router.post("/send-otp", sendPhoneOTP);
router.post("/verify-otp", verifyPhoneOTP);
router.post("/register", labourDocumentUpload, registerLabour);
router.get("/all", getAllLabour);
router.get("/search", searchLabourByLocation);

// Protected routes (Labour user)
router.get("/profile", protect, getLabourProfile);
router.put("/profile", protect, updateLabourProfile);
router.get("/bookings", protect, getLabourBookings);

// Protected routes (Admin only)
router.get("/pending", protect, adminOnly, getPendingLabour);
router.put("/:id/approve", protect, adminOnly, approveLabour);
router.put("/:id/reject", protect, adminOnly, rejectLabour);

module.exports = router;
