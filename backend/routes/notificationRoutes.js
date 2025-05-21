// routes/notificationRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get user's notifications
router.get('/my', notificationController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Get event notifications (for organizers)
router.get('/event/:eventId', authorize('organizer', 'admin'), 
  notificationController.getEventNotifications);

// Create notification (for organizers and admins)
router.post('/', authorize('organizer', 'admin'), 
  notificationController.createNotification);

module.exports = router;