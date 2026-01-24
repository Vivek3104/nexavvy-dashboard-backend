const User = require('../models/User');
const Lead = require('../models/Lead');
const PaymentRequest = require('../models/PaymentRequest');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    let query = { role: 'partner' }; // Only get partners, not admins

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Toggle status
    user.isActive = !user.isActive;

    if (!user.isActive) {
      user.deactivatedAt = new Date();
      user.deactivatedBy = req.user._id;
    } else {
      user.deactivatedAt = null;
      user.deactivatedBy = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (Admin)
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get lead stats
    const totalLeads = await Lead.countDocuments({ submittedBy: userId });
    const pendingLeads = await Lead.countDocuments({
      submittedBy: userId,
      status: 'pending',
    });
    const pipelineLeads = await Lead.countDocuments({
      submittedBy: userId,
      status: 'pipeline',
    });
    const joinedLeads = await Lead.countDocuments({
      submittedBy: userId,
      status: 'joined',
    });
    const rejectedLeads = await Lead.countDocuments({
      submittedBy: userId,
      status: 'rejected',
    });

    // Get payment stats
    const totalPaymentRequests = await PaymentRequest.countDocuments({
      userId,
    });
    const pendingPayments = await PaymentRequest.countDocuments({
      userId,
      status: 'pending',
    });
    const approvedPayments = await PaymentRequest.countDocuments({
      userId,
      status: 'approved',
    });
    const rejectedPayments = await PaymentRequest.countDocuments({
      userId,
      status: 'rejected',
    });

    // Calculate total earnings
    const approvedPaymentsList = await PaymentRequest.find({
      userId,
      status: 'approved',
    });
    const totalEarnings = approvedPaymentsList.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        leads: {
          total: totalLeads,
          pending: pendingLeads,
          pipeline: pipelineLeads,
          joined: joinedLeads,
          rejected: rejectedLeads,
        },
        payments: {
          total: totalPaymentRequests,
          pending: pendingPayments,
          approved: approvedPayments,
          rejected: rejectedPayments,
          totalEarnings,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name',
      'email',
      'mobile',
      'address',
      'city',
      'state',
      'pincode',
    ];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getUserStats,
  getProfile,
  updateProfile,
};
