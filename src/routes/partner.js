const express = require('express');
const {
  getMyLeads,
  getMyStats,
  createLead,
} = require('../controllers/partnerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// All routes are protected and require partner role
router.use(protect);
router.use(authorize('partner'));

router.get('/leads', getMyLeads);
router.get('/stats', getMyStats);

module.exports = router;
