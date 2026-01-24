const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true, // Format: "January 2024"
    },
    leads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque', 'cash'],
    },
    transactionId: {
      type: String,
    },
    remarks: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
commissionSchema.index({ partnerId: 1, status: 1 });
commissionSchema.index({ month: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
