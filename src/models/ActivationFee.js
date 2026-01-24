const mongoose = require('mongoose');

const activationFeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Fee Details
    amount: {
      type: Number,
      default: 999,
      required: true,
    },

    // Payment Status
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    // Payment Details
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },

    // Payment Link (if generated)
    paymentLink: {
      type: String,
    },

    // Admin Actions
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
activationFeeSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('ActivationFee', activationFeeSchema);
