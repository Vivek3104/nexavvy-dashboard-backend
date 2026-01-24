const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get all leads (with filtering)
// @route   GET /api/admin/leads
// @access  Private (Admin)
const getAllLeads = async (req, res) => {
  try {
    const { status, partnerId, search } = req.query;

    // Build query
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (partnerId) {
      query.partnerId = partnerId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    // Get leads with partner info
    const leads = await Lead.find(query)
      .populate('partnerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Format response to include partnerName
    const formattedLeads = leads.map(lead => ({
      ...lead,
      partnerName: lead.partnerId?.name || 'Unknown',
      partnerId: lead.partnerId?._id,
    }));

    res.status(200).json({
      success: true,
      count: formattedLeads.length,
      data: formattedLeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    // Get total leads
    const totalLeads = await Lead.countDocuments();

    // Get total partners
    const totalPartners = await User.countDocuments({ role: 'partner' });

    // Get converted leads
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });

    // Get active clients
    const activeClients = await Lead.countDocuments({ activeClient: true });

    // Calculate monthly revenue (₹15,000 per active client)
    const monthlyRevenue = activeClients * 15000;

    // Get lead status distribution
    const statusDistribution = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        totalPartners,
        convertedLeads,
        activeClients,
        monthlyRevenue,
        statusDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update lead status
// @route   PATCH /api/admin/leads/:id/status
// @access  Private (Admin)
const updateLeadStatus = async (req, res) => {
  try {
    const { status, activeClient } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    if (status) {
      lead.status = status;
    }

    if (typeof activeClient !== 'undefined') {
      lead.activeClient = activeClient;
    }

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all partners
// @route   GET /api/admin/partners
// @access  Private (Admin)
const getAllPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Get lead count for each partner
    const partnersWithStats = await Promise.all(
      partners.map(async partner => {
        const leadCount = await Lead.countDocuments({ partnerId: partner._id });
        const convertedCount = await Lead.countDocuments({
          partnerId: partner._id,
          status: 'converted',
        });

        return {
          ...partner,
          leadCount,
          convertedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: partnersWithStats.length,
      data: partnersWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pending leads for approval
// @route   GET /api/admin/leads/pending
// @access  Private (Admin)
const getPendingLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ approvalStatus: 'pending' })
      .populate('partnerId', 'name email mobile')
      .sort({ createdAt: -1 })
      .lean();

    const formattedLeads = leads.map(lead => ({
      ...lead,
      partnerName: lead.partnerId?.name || 'Unknown',
      partnerEmail: lead.partnerId?.email,
      partnerMobile: lead.partnerId?.mobile,
    }));

    res.status(200).json({
      success: true,
      count: formattedLeads.length,
      data: formattedLeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve lead
// @route   PATCH /api/admin/leads/:id/approve
// @access  Private (Admin)
const approveLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.approvalStatus = 'approved';
    lead.approvedAt = Date.now();
    lead.approvedBy = req.user._id;
    lead.commissionEligible = true; // Eligible for commission once approved

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
      message: 'Lead approved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject lead
// @route   PATCH /api/admin/leads/:id/reject
// @access  Private (Admin)
const rejectLead = async (req, res) => {
  try {
    const { reason } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.approvalStatus = 'rejected';
    lead.rejectionReason = reason;
    lead.approvedBy = req.user._id;
    lead.commissionEligible = false;

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead,
      message: 'Lead rejected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify partner KYC
// @route   PATCH /api/admin/partners/:id/verify-kyc
// @access  Private (Admin)
const verifyKYC = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.kyc || !user.kyc.documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'No KYC documents found for this user',
      });
    }

    user.kyc.verified = true;
    user.kyc.verifiedAt = Date.now();
    user.kyc.verifiedBy = req.user._id;
    user.profileCompleteness.kycVerified = true;
    user.profileScore = 100; // Full score when KYC verified

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        kycVerified: user.kyc.verified,
        profileScore: user.profileScore,
      },
      message: 'KYC verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || user.mobile,
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        profilePic: user.profilePic || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, pincode } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) {
      user.phone = phone;
      user.mobile = phone;
    }

    // Update address
    if (!user.address) {
      user.address = {};
    }
    if (address) user.address.street = address;
    if (city) user.address.city = city;
    if (state) user.address.state = state;
    if (pincode) user.address.pincode = pincode;

    // Handle profile picture if uploaded
    if (req.file) {
      // req.file.path gives us the full path, we need to extract the relative path
      // The file is saved in uploads/profiles/, so we construct the path
      const relativePath = `/uploads/profiles/${req.file.filename}`;
      user.profilePic = relativePath;
      console.log('Profile picture saved:', relativePath);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        profilePic: user.profilePic,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllLeads,
  getAdminStats,
  updateLeadStatus,
  getAllPartners,
  getPendingLeads,
  approveLead,
  rejectLead,
  verifyKYC,
  getAdminProfile,
  updateAdminProfile,
};
