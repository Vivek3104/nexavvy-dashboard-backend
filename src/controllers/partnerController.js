const Lead = require('../models/Lead');

// @desc    Get partner's leads
// @route   GET /api/partner/leads
// @access  Private (Partner)
const getMyLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ partnerId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get partner statistics
// @route   GET /api/partner/stats
// @access  Private (Partner)
const getMyStats = async (req, res) => {
    try {
        const partnerId = req.user._id;

        // Get total leads
        const totalLeads = await Lead.countDocuments({ partnerId });

        // Get pending leads
        const pendingLeads = await Lead.countDocuments({
            partnerId,
            status: 'pending',
        });

        // Get converted leads
        const convertedLeads = await Lead.countDocuments({
            partnerId,
            status: 'converted',
        });

        // Get active clients
        const activeClients = await Lead.countDocuments({
            partnerId,
            activeClient: true,
        });

        // Calculate estimated monthly earnings (5% of ₹15,000 per client)
        const monthlyEarnings = activeClients * 750; // ₹750 per client (5% of ₹15,000)

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                pendingLeads,
                convertedLeads,
                activeClients,
                monthlyEarnings,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Partner)
const createLead = async (req, res) => {
    try {
        const leadData = {
            ...req.body,
            partnerId: req.user._id,
        };

        const lead = await Lead.create(leadData);

        res.status(201).json({
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

module.exports = {
    getMyLeads,
    getMyStats,
    createLead,
};
