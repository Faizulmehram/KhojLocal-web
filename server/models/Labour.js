const mongoose = require("mongoose");

const labourSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
      select: false, // Don't return in queries by default
    },
    phoneVerificationExpiry: {
      type: Date,
      select: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    cnicNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{5}-\d{7}-\d{1}$/, 'Please provide valid CNIC format (12345-1234567-1)'],
    },
    documents: {
      cnicFront: {
        type: String, // URL to uploaded image
        required: true,
      },
      cnicBack: {
        type: String, // URL to uploaded image
        required: true,
      },
      selfie: {
        type: String, // URL to uploaded image
        required: true,
      },
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number, // years of experience
      required: true,
      min: 0,
    },
    availability: {
      days: {
        type: [String], // ['Monday', 'Tuesday', ...]
        default: [],
      },
      hours: {
        type: String, // e.g., "9am - 5pm"
        default: "",
      },
    },
    serviceArea: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        default: "",
      },
      radius: {
        type: Number, // service radius in kilometers
        default: 10,
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profileImage: {
      type: String,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
labourSchema.index({ "serviceArea.coordinates": "2dsphere" });

module.exports = mongoose.model("Labour", labourSchema);
