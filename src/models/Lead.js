const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
    {
        // Submitted By (renamed from partnerId)
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Client Information
        clientName: {
            type: String,
            required: [true, 'Please provide client name'],
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
        servicesProducts: {
            type: String,
            required: [true, 'Please provide services/products description'],
        },

        // Lead Status (updated enum values)
        status: {
            type: String,
            enum: ['pending', 'pipeline', 'joined', 'rejected'],
            default: 'pending',
        },

        // Additional Information
        notes: {
            type: String,
        },
        rejectionReason: {
            type: String,
        },

        // Status History
        statusHistory: [
            {
                status: String,
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                reason: String,
            },
        ],

        // Commission Tracking (kept for backward compatibility)
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
            default: 750,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
leadSchema.index({ submittedBy: 1, status: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
