const Vendor = require("../models/Vendor");
const Labour = require("../models/Labour");
const generateToken = require("../utils/generateToken");
const { generateOTP, storeOTP, verifyOTP, sendOTPSMS } = require("../utils/otpService");

// @desc    Send OTP to phone number for vendor registration
// @route   POST /api/auth/vendor/send-otp
// @access  Public
const sendVendorOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if phone already registered
    const existingVendor = await Vendor.findOne({ phone });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    storeOTP(phone, otp);
    await sendOTPSMS(phone, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send vendor OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Verify OTP for vendor registration
// @route   POST /api/auth/vendor/verify-otp
// @access  Public
const verifyVendorOTP = async (req, res) => {
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
    console.error("Verify vendor OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Register new vendor
// @route   POST /api/auth/vendor/register
// @access  Public
const registerVendor = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      password,
      phone,
      phoneVerified,
      category,
      address,
      description,
      services,
      serviceType,
      images,
      location,
    } = req.body;

    // Validation
    if (
      !businessName ||
      !ownerName ||
      !email ||
      !password ||
      !phone ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check phone verification
    if (!phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number first",
      });
    }

    // Validate location data if provided
    if (location) {
      if (location.latitude && location.longitude) {
        // Validate latitude range (-90 to 90)
        if (location.latitude < -90 || location.latitude > 90) {
          return res.status(400).json({ 
            message: "Invalid latitude value. Must be between -90 and 90." 
          });
        }
        // Validate longitude range (-180 to 180)
        if (location.longitude < -180 || location.longitude > 180) {
          return res.status(400).json({ 
            message: "Invalid longitude value. Must be between -180 and 180." 
          });
        }
      }
    }

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res
        .status(400)
        .json({ message: "Vendor already exists with this email" });
    }

    // Prepare vendor data
    const vendorData = {
      businessName,
      ownerName,
      email,
      password,
      phone,
      category,
      address,
      description,
      services,
      serviceType: serviceType || "both", // booking, ordering, or both
      images: images || { logo: "", banner: "", gallery: [] },
      status: "Pending", // Vendor needs admin approval
    };

    // Add location if provided
    if (location && location.latitude && location.longitude) {
      vendorData.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }

    // Create vendor
    const vendor = await Vendor.create(vendorData);

    if (vendor) {
      res.status(201).json({
        _id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        phone: vendor.phone,
        category: vendor.category,
        status: vendor.status,
        location: vendor.location,
        message:
          "Registration successful! Your application is pending admin approval.",
        token: generateToken(vendor._id, "vendor"),
      });
    } else {
      res.status(400).json({ message: "Invalid vendor data" });
    }
  } catch (error) {
    console.error("Register vendor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login vendor
// @route   POST /api/auth/vendor/login
// @access  Public
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check for vendor first
    let vendor = await Vendor.findOne({ email }).select("+password");
    let isLabour = false;
    let labour = null;

    // If not vendor, check for labour
    if (!vendor) {
      labour = await Labour.findOne({ email }).select("+password");
      if (labour) {
        isLabour = true;
      }
    }

    if (!vendor && !labour) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const account = vendor || labour;

    // Check if account is active (vendors only)
    if (vendor && !vendor.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated" });
    }

    // Check approval status
    if (account.status === "Pending") {
      return res
        .status(403)
        .json({ message: "Your application is still pending admin approval" });
    }

    if (account.status === "Rejected") {
      return res
        .status(403)
        .json({ message: "Your application has been rejected" });
    }

    if (vendor && vendor.status === "Suspended") {
      return res
        .status(403)
        .json({ message: "Your account has been suspended" });
    }

    // Check if labour is approved
    if (labour && !labour.isApproved) {
      return res
        .status(403)
        .json({ message: "Your application is still pending admin approval" });
    }

    // Check password
    const isPasswordMatch = await account.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    if (vendor) {
      await Vendor.findByIdAndUpdate(vendor._id, { lastLogin: Date.now() });
    }

    // Return response based on account type
    if (isLabour) {
      res.json({
        _id: labour._id,
        fullName: labour.fullName,
        email: labour.email,
        phone: labour.phone,
        skill: labour.skill,
        experience: labour.experience,
        isApproved: labour.isApproved,
        rating: labour.rating,
        role: "labour",
        token: generateToken(labour._id, "labour"),
      });
    } else {
      res.json({
        _id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        phone: vendor.phone,
        category: vendor.category,
        status: vendor.status,
        token: generateToken(vendor._id, "vendor"),
        role: "vendor",
      });
    }
  } catch (error) {
    console.error("Login vendor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor profile
// @route   GET /api/auth/vendor/profile
// @access  Private
const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user._id);

    if (vendor) {
      res.json(vendor);
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (error) {
    console.error("Get vendor profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/auth/vendor/profile
// @access  Private
const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user._id);

    if (vendor) {
      vendor.businessName = req.body.businessName || vendor.businessName;
      vendor.ownerName = req.body.ownerName || vendor.ownerName;
      vendor.phone = req.body.phone || vendor.phone;
      vendor.address = req.body.address || vendor.address;
      vendor.description = req.body.description || vendor.description;
      vendor.services = req.body.services || vendor.services;
      vendor.businessHours = req.body.businessHours || vendor.businessHours;

      const updatedVendor = await vendor.save();
      res.json(updatedVendor);
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (error) {
    console.error("Update vendor profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  sendVendorOTP,
  verifyVendorOTP,
  registerVendor, 
  loginVendor, 
  getVendorProfile, 
  updateVendorProfile 
};
