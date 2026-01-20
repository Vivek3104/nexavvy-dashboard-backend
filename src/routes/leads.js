const express = require('express');
const router = express.Router();
const {
    createLead,
    getAllLeads,
    getLeadsByStatus,
    getLeadById,
    updateLeadStatus,
    getMyLeads,
    deleteLead,
    getLeadStats,
} = require('../controllers/leadController');
const { protect, isAdmin, isActive } = require('../middleware/auth');

// User routes
router.post('/', protect, isActive, createLead);
router.get('/my-leads', protect, getMyLeads);

// Admin routes
router.get('/', protect, isAdmin, getAllLeads);
router.get('/stats', protect, isAdmin, getLeadStats);
router.get('/status/:status', protect, isAdmin, getLeadsByStatus);
router.get('/:id', protect, getLeadById);
router.put('/:id/status', protect, isAdmin, updateLeadStatus);
router.delete('/:id', protect, isAdmin, deleteLead);

module.exports = router;
