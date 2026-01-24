const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');
const { sendOTPWhatsApp } = require('../services/whatsappService');
const crypto = require('crypto');

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP to user
 * @route POST /api/otp/send
 */
const sendOTP = async (req, res) => {
  try {
    const { userId, email, mobile, name, purpose = 'registration' } = req.body;

    if (!userId || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'User ID, email, and mobile are required',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete any existing unverified OTPs for this user
    await OTP.deleteMany({ userId, verified: false });

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const otp = await OTP.create({
      userId,
      email,
      mobile,
      otp: otpCode,
      purpose,
      expiresAt,
    });

    // Send OTP via Email and WhatsApp
    const emailResult = await sendOTPEmail(email, otpCode, name || user.name);
    const whatsappResult = await sendOTPWhatsApp(
      mobile,
      otpCode,
      name || user.name
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        otpId: otp._id,
        expiresAt,
        sentTo: {
          email: email,
          whatsapp: mobile,
        },
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Verify OTP
 * @route POST /api/otp/verify
 */
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required',
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({
      userId,
      otp,
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`,
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update user as verified
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    // Generate JWT token for automatic login
    const generateToken = require('../utils/generateToken');
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        isVerified: user.isVerified,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Resend OTP
 * @route POST /api/otp/resend
 */
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Call sendOTP with user data
    req.body = {
      userId: user._id,
      email: user.email,
      mobile: user.mobile,
      name: user.name,
      purpose: 'registration',
    };

    return sendOTP(req, res);
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
};
