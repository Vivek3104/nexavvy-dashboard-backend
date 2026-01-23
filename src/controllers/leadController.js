const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (User)
const createLead = async (req, res) => {
    try {
        const {
            name,
            clientName,
            businessName,
            mobile,
            email,
            city,
            businessType,
            website,
            productServices,
            servicesProducts,
        } = req.body;

        // Accept both old and new field names for backward compatibility
        const finalClientName = name || clientName;
        const finalProductServices = productServices || servicesProducts;

        // Validate required fields
        if (!finalClientName || !businessName || !mobile || !email || !city || !businessType || !finalProductServices) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Create lead
        const lead = await Lead.create({
            clientName: finalClientName,
            businessName,
            mobile,
            email,
            city,
            businessType,
            website,
            servicesProducts: finalProductServices,
            submittedBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Lead submitted successfully',
            data: lead,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all leads (Admin)
// @route   GET /api/leads
// @access  Private (Admin)
const getAllLeads = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
            ];
        }

        // Pagination
        const skip = (page - 1) * limit;

        const leads = await Lead.find(query)
            .populate('submittedBy', 'name email mobile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments(query);

        res.status(200).json({
            success: true,
            data: leads,
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

// @desc    Get leads by status
// @route   GET /api/leads/status/:status
// @access  Private (Admin)
const getLeadsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const leads = await Lead.find({ status })
            .populate('submittedBy', 'name email mobile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments({ status });

        res.status(200).json({
            success: true,
            data: leads,
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

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('submittedBy', 'name email mobile role')
            .populate('statusHistory.changedBy', 'name email');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        // Check if user is admin or the one who submitted the lead
        if (req.user.role !== 'admin' && lead.submittedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this lead',
            });
        }

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

// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Private (Admin)
const updateLeadStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        // Add to status history
        lead.statusHistory.push({
            status,
            changedBy: req.user._id,
            changedAt: new Date(),
            reason: reason || '',
        });

        // Update status
        lead.status = status;

        // If rejected, save rejection reason
        if (status === 'rejected' && reason) {
            lead.rejectionReason = reason;
        }

        // If joined, mark as commission eligible
        if (status === 'joined') {
            lead.commissionEligible = true;
        }

        await lead.save();

        res.status(200).json({
            success: true,
            message: 'Lead status updated successfully',
            data: lead,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user's leads
// @route   GET /api/leads/my-leads
// @access  Private (User)
const getMyLeads = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = { submittedBy: req.user._id };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Lead.countDocuments(query);

        res.status(200).json({
            success: true,
            data: leads,
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

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin)
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        await lead.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Lead deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private (Admin)
const getLeadStats = async (req, res) => {
    try {
        const stats = await Lead.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const total = await Lead.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                total,
                byStatus: stats,
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
    createLead,
    getAllLeads,
    getLeadsByStatus,
    getLeadById,
    updateLeadStatus,
    getMyLeads,
    deleteLead,
    getLeadStats,
};
