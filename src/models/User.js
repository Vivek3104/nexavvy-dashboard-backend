const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    mobile: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['partner', 'admin'],
      default: 'partner',
    },

    // Personal Details
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    profilePic: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    // KYC Details
    kyc: {
      documentType: {
        type: String,
        enum: ['aadhaar', 'pan'],
      },
      documentNumber: {
        type: String, // Will be encrypted
      },
      documentImage: {
        type: String, // File path
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Bank Details
    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String, // Will be encrypted
      branch: String,
      ifscCode: String,
      accountType: {
        type: String,
        enum: ['savings', 'current'],
      },
    },

    // Profile Scoring
    profileScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    profileCompleteness: {
      basicInfo: { type: Boolean, default: false },
      personalDetails: { type: Boolean, default: false },
      kycVerified: { type: Boolean, default: false },
      bankDetailsAdded: { type: Boolean, default: false },
    },

    // Registration Status
    registrationStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },

    // Profile Completion
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'submitted', 'verified', 'rejected'],
      default: 'pending',
    },
    kycVerifiedAt: {
      type: Date,
    },
    kycVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deactivatedAt: {
      type: Date,
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Legacy fields for backward compatibility
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
