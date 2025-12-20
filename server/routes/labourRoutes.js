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
} = require("../controllers/labourController");
const { protect } = require("../middleware/authMiddleware");
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

// Protected routes (Admin only)
router.get("/pending", protect, getPendingLabour);
router.put("/:id/approve", protect, approveLabour);
router.put("/:id/reject", protect, rejectLabour);

module.exports = router;
