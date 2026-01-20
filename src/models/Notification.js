const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // Notification Type
        type: {
            type: String,
            enum: ['activation_request', 'payment_request', 'kyc_submitted', 'lead_status', 'general'],
            required: true,
        },

        // For Admin or User
        recipientType: {
            type: String,
            enum: ['admin', 'user'],
            default: 'admin',
        },

        // User who triggered the notification
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Notification Content
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },

        // Related Data
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        relatedModel: {
            type: String,
            enum: ['Lead', 'PaymentRequest', 'User', 'ActivationFee'],
        },

        // Status
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },

        // Action URL (optional)
        actionUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ recipientType: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
