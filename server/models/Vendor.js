const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, "Please provide a business name"],
    trim: true,
  },
  ownerName: {
    type: String,
    required: [true, "Please provide owner name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: [
      "Restaurant",
      "Bakery",
      "Florist",
      "Mechanic",
      "Salon",
      "Spa",
      "Gym",
      "Other",
    ],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "USA" },
    fullAddress: String, // Complete formatted address
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    latitude: Number,
    longitude: Number,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  images: {
    logo: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    gallery: [
      {
        type: String,
      },
    ],
  },
  services: [
    {
      type: String,
    },
  ],
  serviceType: {
    type: String,
    enum: ["booking", "ordering", "both"],
    default: "both",
    required: true,
  },
  businessHours: {
    monday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
    tuesday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
    wednesday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
    thursday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
    friday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
    saturday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
    sunday: {
      open: String,
      close: String,
      isClosed: { type: Boolean, default: false },
    },
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
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Suspended"],
    default: "Pending",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
});

// Hash password before saving
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
vendorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
