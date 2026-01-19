const express = require('express');
const {
    requestCommission,
    getMyCommissions,
} = require('../controllers/commissionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// All routes are protected and require partner role
router.use(protect);
router.use(authorize('partner'));

router.post('/request', requestCommission);
router.get('/my-requests', getMyCommissions);

module.exports = router;
