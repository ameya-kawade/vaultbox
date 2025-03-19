const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/auth/login', authController.login);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/logout', authenticateToken, authController.logout);
// router.get('/auth/validate-session', authenticateToken, authController.validateSession);
router.get('/auth/user/:id', authenticateToken, authController.getUserById);

// Meeting-related routes
router.post('/auth/create-meeting', authenticateToken, authController.createMeeting);
router.post('/auth/delete-meeting', authenticateToken, authController.deleteMeeting);

module.exports = router;