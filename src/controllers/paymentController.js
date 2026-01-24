const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');

// @desc    Create payment request
// @route   POST /api/payments/request
// @access  Private (User)
const createPaymentRequest = async (req, res) => {
  try {
    const {
      amount,
      month,
      year,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branch,
    } = req.body;

    // Validate required fields
    if (
      !amount ||
      !month ||
      !year ||
      !accountHolderName ||
      !accountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create payment request
    const paymentRequest = await PaymentRequest.create({
      userId: req.user._id,
      amount,
      month,
      year,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      branch,
    });

    res.status(201).json({
      success: true,
      message: 'Payment request submitted successfully',
      data: paymentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all payment requests (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPaymentRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const payments = await PaymentRequest.find(query)
      .populate('userId', 'name email mobile')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PaymentRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
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

// @desc    Get pending payment requests
// @route   GET /api/payments/pending
// @access  Private (Admin)
const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await PaymentRequest.find({ status: 'pending' })
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PaymentRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: payments,
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

// @desc    Get user's payment requests
// @route   GET /api/payments/my-requests
// @access  Private (User)
const getMyPaymentRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await PaymentRequest.find({ userId: req.user._id })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PaymentRequest.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: payments,
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

// @desc    Approve payment request
// @route   PUT /api/payments/:id/approve
// @access  Private (Admin)
const approvePayment = async (req, res) => {
  try {
    const { transactionId, approvalNotes } = req.body;

    const payment = await PaymentRequest.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found',
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment request is already ${payment.status}`,
      });
    }

    payment.status = 'approved';
    payment.processedBy = req.user._id;
    payment.processedAt = new Date();
    payment.transactionId = transactionId;
    payment.approvalNotes = approvalNotes;
    payment.paidAt = new Date();

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment request approved successfully',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject payment request
// @route   PUT /api/payments/:id/reject
// @access  Private (Admin)
const rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const payment = await PaymentRequest.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found',
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment request is already ${payment.status}`,
      });
    }

    payment.status = 'rejected';
    payment.processedBy = req.user._id;
    payment.processedAt = new Date();
    payment.rejectionReason = rejectionReason;

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment request rejected',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPaymentRequest,
  getAllPaymentRequests,
  getPendingRequests,
  getMyPaymentRequests,
  approvePayment,
  rejectPayment,
};
