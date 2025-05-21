// routes/userRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.put('/password', userController.updatePassword);

router.get('/speakers/available', protect, authorize('organizer', 'attendee'), userController.getAvailableSpeakers);

// Admin only routes
router.use(authorize('admin'));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;