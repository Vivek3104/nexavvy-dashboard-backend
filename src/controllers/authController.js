const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../services/emailService');
const { sendOTPWhatsApp } = require('../services/whatsappService');
const OTP = require('../models/OTP');
const crypto = require('crypto');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate mobile & password
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and password',
      });
    }

    // Check for user by mobile (include password for comparison)
    const user = await User.findOne({ mobile }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Password is correct - now send OTP for verification
    // Delete old OTPs
    await OTP.deleteMany({ userId: user._id, verified: false });

    // Generate and send new OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      userId: user._id,
      email: user.email,
      mobile: user.mobile,
      otp: otpCode,
      purpose: 'login',
      expiresAt,
    });

    // Send OTP
    await sendOTPEmail(user.email, otpCode, user.name);
    await sendOTPWhatsApp(user.mobile, otpCode, user.name);

    return res.status(200).json({
      success: true,
      requiresOTP: true,
      userId: user._id,
      mobile: user.mobile,
      email: user.email,
      message: 'Password verified. OTP sent to your mobile and email.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register new user (simplified with OTP)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, mobile, password, role = 'partner' } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, mobile (WhatsApp), and password',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user (not verified yet)
    const user = await User.create({
      name,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || '',
      email,
      mobile,
      phone: mobile, // For backward compatibility
      password,
      role,
      isVerified: false,
      profileCompleted: false,
    });

    console.log('User created:', {
      id: user._id,
      email: user.email,
      mobile: user.mobile,
    });

    // Generate OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Validate mobile before creating OTP
    if (!mobile) {
      console.error('Mobile is missing!', { name, email, mobile });
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    console.log('Creating OTP with:', {
      userId: user._id,
      email,
      mobile,
      otpCode,
    });

    // Save OTP
    await OTP.create({
      userId: user._id,
      email,
      mobile,
      otp: otpCode,
      purpose: 'registration',
      expiresAt,
    });

    // Send OTP via Email and WhatsApp
    await sendOTPEmail(email, otpCode, name);
    await sendOTPWhatsApp(mobile, otpCode, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful! OTP sent to your email and WhatsApp.',
      data: {
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Register admin (simplified with OTP)
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, mobile, and password',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create admin user (not verified yet)
    const user = await User.create({
      name,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || '',
      email,
      mobile,
      phone: mobile,
      password,
      role: 'admin',
      isVerified: false,
      profileCompleted: false,
    });

    // Generate OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await OTP.create({
      userId: user._id,
      email,
      mobile,
      otp: otpCode,
      purpose: 'registration',
      expiresAt,
    });

    // Send OTP
    await sendOTPEmail(email, otpCode, name);
    await sendOTPWhatsApp(mobile, otpCode, name);

    res.status(201).json({
      success: true,
      message:
        'Admin registration successful! OTP sent to your email and WhatsApp.',
      data: {
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register partner - Step 1 (Basic Info)
// @route   POST /api/auth/register/step1
// @access  Public
const registerStep1 = async (req, res) => {
  try {
    const { email, password, mobile } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user with basic info
    const user = await User.create({
      email,
      password,
      mobile,
      role: 'partner',
      registrationStep: 1,
      profileScore: 25,
      profileCompleteness: {
        basicInfo: true,
        personalDetails: false,
        kycVerified: false,
        bankDetailsAdded: false,
      },
    });

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        registrationStep: user.registrationStep,
        profileScore: user.profileScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete personal details - Step 2
// @route   POST /api/auth/register/step2
// @access  Private
const registerStep2 = async (req, res) => {
  try {
    const { firstName, lastName, address, dateOfBirth, gender, profilePic } =
      req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update personal details
    user.firstName = firstName;
    user.lastName = lastName;
    user.name = `${firstName} ${lastName}`;
    user.address = address;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    if (profilePic) user.profilePic = profilePic;
    user.registrationStep = 2;
    user.profileScore = 50; // Basic + Personal
    user.profileCompleteness.personalDetails = true;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        registrationStep: user.registrationStep,
        profileScore: user.profileScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete KYC and bank details - Step 3
// @route   POST /api/auth/register/step3
// @access  Private
const registerStep3 = async (req, res) => {
  try {
    const { kyc, bankDetails } = req.body;
    const { encrypt } = require('../utils/encryption');

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update KYC details
    if (kyc) {
      user.kyc = {
        documentType: kyc.documentType,
        documentNumber: encrypt(kyc.documentNumber),
        documentImage: kyc.documentImage,
        verified: false, // Admin will verify
      };
      user.profileCompleteness.kycVerified = false; // Will be true after admin verification
    }

    // Update bank details
    if (bankDetails) {
      user.bankDetails = {
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName,
        accountNumber: encrypt(bankDetails.accountNumber),
        branch: bankDetails.branch,
        ifscCode: bankDetails.ifscCode,
        accountType: bankDetails.accountType,
      };
      user.profileCompleteness.bankDetailsAdded = true;
      user.profileScore = 70; // Basic + Personal + Bank (KYC pending verification)
    }

    user.registrationStep = 3;
    user.isProfileComplete = true;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        registrationStep: user.registrationStep,
        profileScore: user.profileScore,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  registerAdmin,
  registerStep1,
  registerStep2,
  registerStep3,
};
