const express = require('express');
const { createLead } = require('../controllers/partnerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Lead creation route (accessible by partners)
router.post('/', protect, authorize('partner'), createLead);

module.exports = router;
