const express = require('express');
const {
    getAllLeads,
    getAdminStats,
    updateLeadStatus,
    getAllPartners,
    getPendingLeads,
    approveLead,
    rejectLead,
    verifyKYC,
} = require('../controllers/adminController');
const {
    getAllCommissions,
    approveCommission,
    rejectCommission,
    markAsPaid,
} = require('../controllers/commissionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Lead routes
router.get('/leads', getAllLeads);
router.get('/leads/pending', getPendingLeads);
router.patch('/leads/:id/status', updateLeadStatus);
router.patch('/leads/:id/approve', approveLead);
router.patch('/leads/:id/reject', rejectLead);

// Stats and partners
router.get('/stats', getAdminStats);
router.get('/partners', getAllPartners);
router.patch('/partners/:id/verify-kyc', verifyKYC);

// Commission routes
router.get('/commissions', getAllCommissions);
router.patch('/commissions/:id/approve', approveCommission);
router.patch('/commissions/:id/reject', rejectCommission);
router.patch('/commissions/:id/paid', markAsPaid);

module.exports = router;
