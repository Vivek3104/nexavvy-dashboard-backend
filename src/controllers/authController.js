const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

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

        // Create token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Register new partner
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'partner', // Default role is partner
        });

        // Create token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
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

// @desc    Register admin
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password, mobile } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create admin user
        const user = await User.create({
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            password,
            mobile,
            role: 'admin',
            registrationStep: 3,
            isProfileComplete: true,
            profileScore: 25, // Basic info only
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
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
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
        const { firstName, lastName, address, dateOfBirth, gender, profilePic } = req.body;

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
