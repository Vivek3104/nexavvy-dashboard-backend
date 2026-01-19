const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
    {
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide contact name'],
            trim: true,
        },
        mobile: {
            type: String,
            required: [true, 'Please provide mobile number'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide email'],
            lowercase: true,
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'Please provide city'],
            trim: true,
        },
        businessName: {
            type: String,
            required: [true, 'Please provide business name'],
            trim: true,
        },
        businessType: {
            type: String,
            required: [true, 'Please provide business type'],
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        productServices: {
            type: String,
            required: [true, 'Please provide product/services description'],
        },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'converted', 'rejected'],
            default: 'pending',
        },
        activeClient: {
            type: Boolean,
            default: false,
        },

        // Approval Workflow
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        approvedAt: {
            type: Date,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectionReason: {
            type: String,
        },

        // Commission Tracking
        commissionEligible: {
            type: Boolean,
            default: false,
        },
        commissionPaid: {
            type: Boolean,
            default: false,
        },
        commissionAmount: {
            type: Number,
            default: 750, // ₹750 per converted lead
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
leadSchema.index({ partnerId: 1, status: 1 });
leadSchema.index({ approvalStatus: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
