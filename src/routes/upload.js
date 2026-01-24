const express = require('express');
const {
  uploadProfilePic,
  uploadKYCDocument,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/profile-pic', upload.single('profilePic'), uploadProfilePic);
router.post('/kyc-document', upload.single('kycDocument'), uploadKYCDocument);

module.exports = router;
