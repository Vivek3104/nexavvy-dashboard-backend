const express = require('express');
const router = express.Router();
const {
  createPaymentRequest,
  getAllPaymentRequests,
  getPendingRequests,
  getMyPaymentRequests,
  approvePayment,
  rejectPayment,
} = require('../controllers/paymentController');
const { protect, isAdmin, isActive } = require('../middleware/auth');

// User routes
router.post('/request', protect, isActive, createPaymentRequest);
router.get('/my-requests', protect, getMyPaymentRequests);

// Admin routes
router.get('/', protect, isAdmin, getAllPaymentRequests);
router.get('/pending', protect, isAdmin, getPendingRequests);
router.put('/:id/approve', protect, isAdmin, approvePayment);
router.put('/:id/reject', protect, isAdmin, rejectPayment);

module.exports = router;
