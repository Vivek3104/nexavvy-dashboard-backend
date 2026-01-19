const User = require('../models/User');
const path = require('path');

// @desc    Upload profile picture
// @route   POST /api/upload/profile-pic
// @access  Private
const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        // Get file path relative to uploads directory
        const filePath = `/uploads/profiles/${req.file.filename}`;

        // Update user profile pic
        const user = await User.findById(req.user._id);
        if (user) {
            user.profilePic = filePath;
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename,
                path: filePath,
                size: req.file.size,
            },
            message: 'Profile picture uploaded successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upload KYC document
// @route   POST /api/upload/kyc-document
// @access  Private
const uploadKYCDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        // Get file path relative to uploads directory
        const filePath = `/uploads/kyc/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename,
                path: filePath,
                size: req.file.size,
            },
            message: 'KYC document uploaded successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    uploadProfilePic,
    uploadKYCDocument,
};
