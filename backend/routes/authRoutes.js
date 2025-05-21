// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verifyAuth);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;