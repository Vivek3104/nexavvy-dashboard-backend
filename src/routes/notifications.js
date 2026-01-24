const express = require('express');
const router = express.Router();
const {
  createNotification,
  getAdminNotifications,
  markAsRead,
  contactAdmin,
} = require('../controllers/notificationController');
const { protect, isAdmin } = require('../middleware/auth');

// User routes
router.post('/contact-admin', protect, contactAdmin);

// Admin routes
router.get('/admin', protect, isAdmin, getAdminNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
