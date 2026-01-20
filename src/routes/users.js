const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    getUserStats,
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/auth');

// All routes are admin-only
router.get('/', protect, isAdmin, getAllUsers);
router.get('/:id', protect, isAdmin, getUserById);
router.put('/:id/toggle-status', protect, isAdmin, toggleUserStatus);
router.get('/:id/stats', protect, isAdmin, getUserStats);

module.exports = router;
