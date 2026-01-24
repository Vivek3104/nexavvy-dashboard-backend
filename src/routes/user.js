const express = require('express');
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getUserStats,
} = require('../controllers/userController');
const {
  login,
  register,
  registerStep1,
  registerStep2,
  registerStep3,
  logout,
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// User authentication routes (public)
router.post('/login', login);
router.post('/register', register);
router.post('/register/step1', registerStep1);
router.post('/register/step2', protect, registerStep2);
router.post('/register/step3', protect, registerStep3);
router.post('/logout', protect, logout);

// User profile routes (protected)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin user management routes (admin only)
router.get('/', protect, isAdmin, getAllUsers);
router.get('/:id', protect, isAdmin, getUserById);
router.put('/:id/toggle-status', protect, isAdmin, toggleUserStatus);
router.get('/:id/stats', protect, isAdmin, getUserStats);

module.exports = router;
