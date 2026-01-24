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
  getAdminProfile,
  updateAdminProfile,
} = require('../controllers/adminController');
const {
  getAllCommissions,
  approveCommission,
  rejectCommission,
  markAsPaid,
} = require('../controllers/commissionController');
const {
  login,
  registerAdmin,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

const router = express.Router();

// Admin authentication routes (public)
router.post('/login', login);
router.post('/register', registerAdmin);
router.post('/logout', protect, logout);

// All other routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Profile routes
router.get('/profile', getAdminProfile);
router.put('/profile', upload.single('profilePic'), updateAdminProfile);

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
