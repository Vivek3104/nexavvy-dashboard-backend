const express = require('express');
const {
    login,
    register,
    logout,
    registerAdmin,
    registerStep1,
    registerStep2,
    registerStep3
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // Legacy route
router.post('/register-admin', registerAdmin);
router.post('/register/step1', registerStep1);
router.post('/register/step2', protect, registerStep2);
router.post('/register/step3', protect, registerStep3);
router.post('/logout', protect, logout);

module.exports = router;
