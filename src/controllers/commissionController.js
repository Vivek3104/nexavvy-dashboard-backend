const Commission = require('../models/Commission');
const Lead = require('../models/Lead');
const { startOfMonth, endOfMonth, format } = require('date-fns');

// @desc    Request commission
// @route   POST /api/commission/request
// @access  Private (Partner)
const requestCommission = async (req, res) => {
    try {
        const { month } = req.body; // Format: "January 2024"
        const partnerId = req.user._id;

        // Check if commission already requested for this month
        const existingRequest = await Commission.findOne({
            partnerId,
            month,
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Commission already requested for this month',
            });
        }

        // Get all converted leads for the month
        const monthDate = new Date(month);
        const leads = await Lead.find({
            partnerId,
            status: 'converted',
            activeClient: true,
            approvalStatus: 'approved',
            commissionEligible: true,
            commissionPaid: false,
            createdAt: {
                $gte: startOfMonth(monthDate),
                $lte: endOfMonth(monthDate),
            },
        });

        if (leads.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No eligible leads found for commission',
            });
        }

        // Calculate commission
        const commissionPerLead = 750; // ₹750
        const totalAmount = leads.length * commissionPerLead;

        // Create commission request
        const commission = await Commission.create({
            partnerId,
            amount: totalAmount,
            month,
            leads: leads.map((l) => l._id),
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            data: commission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get my commission requests
// @route   GET /api/commission/my-requests
// @access  Private (Partner)
const getMyCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find({ partnerId: req.user._id })
            .populate('leads', 'businessName name')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: commissions.length,
            data: commissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all commission requests (Admin)
// @route   GET /api/admin/commissions
// @access  Private (Admin)
const getAllCommissions = async (req, res) => {
    try {
        const { status } = req.query;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const commissions = await Commission.find(query)
            .populate('partnerId', 'name email mobile')
            .populate('leads', 'businessName name')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: commissions.length,
            data: commissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Approve commission
// @route   PATCH /api/admin/commissions/:id/approve
// @access  Private (Admin)
const approveCommission = async (req, res) => {
    try {
        const commission = await Commission.findById(req.params.id);

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found',
            });
        }

        commission.status = 'approved';
        commission.approvedAt = Date.now();
        commission.approvedBy = req.user._id;

        await commission.save();

        res.status(200).json({
            success: true,
            data: commission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Reject commission
// @route   PATCH /api/admin/commissions/:id/reject
// @access  Private (Admin)
const rejectCommission = async (req, res) => {
    try {
        const { reason } = req.body;
        const commission = await Commission.findById(req.params.id);

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found',
            });
        }

        commission.status = 'rejected';
        commission.rejectionReason = reason;
        commission.approvedBy = req.user._id;

        await commission.save();

        res.status(200).json({
            success: true,
            data: commission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Mark commission as paid
// @route   PATCH /api/admin/commissions/:id/paid
// @access  Private (Admin)
const markAsPaid = async (req, res) => {
    try {
        const { paymentMethod, transactionId, remarks } = req.body;
        const commission = await Commission.findById(req.params.id);

        if (!commission) {
            return res.status(404).json({
                success: false,
                message: 'Commission not found',
            });
        }

        if (commission.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Commission must be approved before marking as paid',
            });
        }

        commission.status = 'paid';
        commission.paidAt = Date.now();
        commission.paymentMethod = paymentMethod;
        commission.transactionId = transactionId;
        commission.remarks = remarks;

        await commission.save();

        // Mark leads as commission paid
        await Lead.updateMany(
            { _id: { $in: commission.leads } },
            { commissionPaid: true }
        );

        res.status(200).json({
            success: true,
            data: commission,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    requestCommission,
    getMyCommissions,
    getAllCommissions,
    approveCommission,
    rejectCommission,
    markAsPaid,
};
