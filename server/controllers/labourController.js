const User = require("../models/User");
const Labour = require("../models/Labour");
const generateToken = require("../utils/generateToken");
const { generateOTP, storeOTP, verifyOTP, sendOTPSMS } = require("../utils/otpService");
// CNIC image verification via Gemini disabled — skipping import
const { isValidCnicFormat } = require("../utils/cnicValidator");

const normalizeCnicDigits = (value = "") => String(value).replace(/\D/g, "");

// @desc    Send OTP to phone number
// @route   POST /api/labour/send-otp
// @access  Public
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    console.log('\n🔔 OTP Request Received');
    console.log('📞 Phone:', phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if phone already registered in Labour collection
    const existingLabour = await Labour.findOne({ phone });
    if (existingLabour) {
      console.log('❌ Phone already registered');
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Generate and send OTP
    console.log('🔐 Generating OTP...');
    const otp = generateOTP();
    storeOTP(phone, otp);
    await sendOTPSMS(phone, otp);
    console.log('✅ OTP sent successfully\n');

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/labour/verify-otp
// @access  Public
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const isValid = verifyOTP(phone, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Validate location is within Pakistan
// @route   Helper function
// @access  Private
const isLocationInPakistan = (latitude, longitude) => {
  // Pakistan approximate boundaries
  const pakistanBounds = {
    north: 37.1,
    south: 23.5,
    west: 60.9,
    east: 77.8,
  };

  return (
    latitude >= pakistanBounds.south &&
    latitude <= pakistanBounds.north &&
    longitude >= pakistanBounds.west &&
    longitude <= pakistanBounds.east
  );
};

// @desc    Register a new labour user
// @route   POST /api/labour/register
// @access  Public
exports.registerLabour = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      phoneVerified,
      email,
      cnicNumber,
      skill,
      experience,
      availability: availabilityString,
      serviceArea: serviceAreaString,
      bio,
      password,
    } = req.body;

    // Parse JSON strings
    let availability, serviceArea;
    try {
      availability = typeof availabilityString === 'string' ? JSON.parse(availabilityString) : availabilityString;
      serviceArea = typeof serviceAreaString === 'string' ? JSON.parse(serviceAreaString) : serviceAreaString;
    } catch (parseError) {
      console.warn('Warning: Failed to parse availability/serviceArea JSON:', parseError.message);
      // Fallback to safe defaults instead of rejecting — allow frontend to send malformed strings
      availability = { days: [], hours: "" };
      serviceArea = { latitude: null, longitude: null, address: "", radius: 10 };
    }

    // Accept simple latitude/longitude form fields as fallback (helps curl/testing)
    if ((!serviceArea || !serviceArea.latitude) && (req.body.latitude || req.body.lat || req.body.serviceAreaLatitude)) {
      serviceArea.latitude = parseFloat(req.body.serviceAreaLatitude || req.body.latitude || req.body.lat);
    }
    if ((!serviceArea || !serviceArea.longitude) && (req.body.longitude || req.body.lng || req.body.long || req.body.serviceAreaLongitude)) {
      serviceArea.longitude = parseFloat(req.body.serviceAreaLongitude || req.body.longitude || req.body.lng || req.body.long);
    }
    if ((!serviceArea || !serviceArea.address) && req.body.serviceAreaAddress) {
      serviceArea.address = req.body.serviceAreaAddress;
    }
    if ((!serviceArea || !serviceArea.radius) && req.body.serviceAreaRadius) {
      serviceArea.radius = parseInt(req.body.serviceAreaRadius);
    }

    // Validation
    const missingFields = [];
    if (!fullName) missingFields.push("fullName");
    if (!phone) missingFields.push("phone");
    if (!skill) missingFields.push("skill");
    if (experience === undefined || experience === null || experience === "") missingFields.push("experience");
    if (!serviceArea) missingFields.push("serviceArea");
    if (!bio) missingFields.push("bio");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check phone verification
    if (!phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number first",
      });
    }

    // Validate CNIC format only if provided
    if (cnicNumber && !isValidCnicFormat(cnicNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CNIC format. Use format: 12345-1234567-1",
      });
    }

    // Check if CNIC already exists
    const existingCNIC = await Labour.findOne({ cnicNumber });
    if (existingCNIC) {
      return res.status(400).json({
        success: false,
        message: "CNIC number already registered",
      });
    }

    // Check if phone already exists in Labour collection
    const existingLabourPhone = await Labour.findOne({ phone });
    if (existingLabourPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Skip server-side CNIC image verification: accept uploads without checking

    // Validate service area coordinates
    if (!serviceArea.latitude || !serviceArea.longitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid service area coordinates",
      });
    }

    // Validate location is within Pakistan
    if (!isLocationInPakistan(serviceArea.latitude, serviceArea.longitude)) {
      return res.status(400).json({
        success: false,
        message: "Service area must be within Pakistan",
      });
    }

    // Generate email if not provided
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const labourEmail = email || `labour_${cleanPhone}@khoojlocal.com`;

    // Check if email already exists
    const existingLabourEmail = await Labour.findOne({ email: labourEmail });
    if (existingLabourEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create Labour profile with email and password (no User account needed)
    const labour = await Labour.create({
      fullName,
      email: labourEmail,
      password, // Will be hashed by pre-save hook
      phone,
      phoneVerified: true,
      cnicNumber,
      documents: {
        cnicFront: req.files?.cnicFront?.[0]?.path || "",
        cnicBack: req.files?.cnicBack?.[0]?.path || "",
        selfie: req.files?.selfie?.[0]?.path || "",
      },
      skill,
      experience: parseInt(experience),
      availability: {
        days: availability?.days || [],
        hours: availability?.hours || "",
      },
      serviceArea: {
        type: "Point",
        coordinates: [serviceArea.longitude, serviceArea.latitude],
        latitude: serviceArea.latitude,
        longitude: serviceArea.longitude,
        address: serviceArea.address || "",
        radius: serviceArea.radius || 10,
      },
      bio,
      verificationStatus: "pending",
      isApproved: false,
    });

    console.log('Labour created:', { id: labour._id.toString(), verificationStatus: labour.verificationStatus, phone: labour.phone });

    // Create notifications for all active admins to review this registration
    try {
      const Admin = require('../models/Admin');
      const { createNotification } = require('./notificationController');
      const admins = await Admin.find({ isActive: true });
      for (const admin of admins) {
        await createNotification({
          user: admin._id,
          type: 'vendor',
          title: 'New Labour Registration',
          message: `New labour ${labour.fullName} submitted for verification`,
          link: `/admin/labour/${labour._id}`,
          priority: 'high',
        });
      }
    } catch (notifyErr) {
      console.error('Failed to notify admins about new labour:', notifyErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Your profile is under verification.",
      labour: {
        _id: labour._id,
        fullName: labour.fullName,
        email: labour.email,
        phone: labour.phone,
        skill: labour.skill,
        verificationStatus: labour.verificationStatus,
        isApproved: labour.isApproved,
      },
      token: generateToken(labour._id, "labour"),
    });
  } catch (error) {
    console.error("Labour registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Get labour profile
// @route   GET /api/labour/profile
// @access  Private
exports.getLabourProfile = async (req, res) => {
  try {
    const labour = await Labour.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email phone"
    );

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour profile not found",
      });
    }

    res.json({
      success: true,
      labour,
    });
  } catch (error) {
    console.error("Get labour profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update labour profile
// @route   PUT /api/labour/profile
// @access  Private
exports.updateLabourProfile = async (req, res) => {
  try {
    const labour = await Labour.findOne({ userId: req.user._id });

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour profile not found",
      });
    }

    const {
      fullName,
      phone,
      email,
      skill,
      experience,
      availability,
      serviceArea,
      bio,
    } = req.body;

    // Update fields
    if (fullName) labour.fullName = fullName;
    if (phone) labour.phone = phone;
    if (email !== undefined) labour.email = email;
    if (skill) labour.skill = skill;
    if (experience !== undefined) labour.experience = experience;
    if (availability) labour.availability = availability;
    if (serviceArea) {
      if (serviceArea.latitude && serviceArea.longitude) {
        labour.serviceArea = {
          type: "Point",
          coordinates: [serviceArea.longitude, serviceArea.latitude],
          latitude: serviceArea.latitude,
          longitude: serviceArea.longitude,
          address: serviceArea.address || labour.serviceArea.address,
          radius: serviceArea.radius || labour.serviceArea.radius,
        };
      }
    }
    if (bio) labour.bio = bio;

    await labour.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      labour,
    });
  } catch (error) {
    console.error("Update labour profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all labour users (for admin or search)
// @route   GET /api/labour/all
// @access  Public
exports.getAllLabour = async (req, res) => {
  try {
    const { skill, minExperience, isApproved } = req.query;

    const filter = {};
    if (skill) filter.skill = skill;
    if (minExperience) filter.experience = { $gte: parseInt(minExperience) };
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";

    const labourList = await Labour.find(filter)
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: labourList.length,
      labour: labourList,
    });
  } catch (error) {
    console.error("Get all labour error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Search labour by location
// @route   GET /api/labour/search
// @access  Public
exports.searchLabourByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, skill } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide latitude and longitude",
      });
    }

    const filter = {
      isApproved: true,
      "serviceArea.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(radius) * 1000, // Convert km to meters
        },
      },
    };

    if (skill) filter.skill = skill;

    const labourList = await Labour.find(filter).populate(
      "userId",
      "name phone"
    );

    res.json({
      success: true,
      count: labourList.length,
      labour: labourList,
    });
  } catch (error) {
    console.error("Search labour by location error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get pending labour profiles for admin review
// @route   GET /api/labour/pending
// @access  Private (Admin only)
exports.getPendingLabour = async (req, res) => {
  try {
    const pendingLabour = await Labour.find({
      $or: [
        { verificationStatus: "pending" },
        { isApproved: false, verificationStatus: { $exists: false } },
      ],
    })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingLabour.length,
      labour: pendingLabour,
    });
  } catch (error) {
    console.error("Get pending labour error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Approve labour profile
// @route   PUT /api/labour/:id/approve
// @access  Private (Admin only)
exports.approveLabour = async (req, res) => {
  try {
    console.log('ApproveLabour invoked. Headers:', {
      authorization: req.headers.authorization,
    });
    console.log('ApproveLabour invoking user:', req.user && { id: req.user._id, role: req.user.role, email: req.user.email });

    const labour = await Labour.findById(req.params.id);

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour profile not found",
      });
    }

    labour.verificationStatus = "approved";
    labour.isApproved = true;
    labour.verifiedAt = new Date();
    labour.verifiedBy = req.user._id; // Admin who approved
    labour.rejectionReason = ""; // Clear any previous rejection reason

    await labour.save();

    res.json({
      success: true,
      message: "Labour profile approved successfully",
      labour,
    });
  } catch (error) {
    console.error("Approve labour error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Reject labour profile
// @route   PUT /api/labour/:id/reject
// @access  Private (Admin only)
exports.rejectLabour = async (req, res) => {
  try {
    const { reason } = req.body;
    const labour = await Labour.findById(req.params.id);

    if (!labour) {
      return res.status(404).json({
        success: false,
        message: "Labour profile not found",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide rejection reason",
      });
    }

    labour.verificationStatus = "rejected";
    labour.isApproved = false;
    labour.rejectionReason = reason;
    labour.verifiedAt = new Date();
    labour.verifiedBy = req.user._id; // Admin who rejected

    await labour.save();

    res.json({
      success: true,
      message: "Labour profile rejected",
      labour,
    });
  } catch (error) {
    console.error("Reject labour error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// @desc    Get labour bookings
// @route   GET /api/labour/bookings
// @access  Private (Labour only)
exports.getLabourBookings = async (req, res) => {
  try {
    const labourId = req.labour._id;

    const Booking = require("../models/Booking");
    
    // Find all bookings where vendor references this labour worker
    const bookings = await Booking.find({ vendor: labourId })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get labour bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching bookings",
      error: error.message,
    });
  }
};