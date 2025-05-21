// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// Protect all routes
router.use(protect);

// Submit feedback
router.post('/', feedbackController.submitFeedback);

// Get the current user's submitted feedback
router.get('/user', feedbackController.getUserFeedback);

// Check if user has already submitted feedback for a session
router.get('/check/:sessionId', feedbackController.checkFeedbackExists);

// Get feedback for a specific session (speakers, organizers, admins)
router.get('/session/:sessionId', feedbackController.getSessionFeedback);

// Get all feedback for a speaker's sessions (default: current user)
router.get('/speaker', feedbackController.getSpeakerFeedback);

// Get all feedback for a specific speaker (admin only)
router.get('/speaker/:speakerId', authorize('admin'), feedbackController.getSpeakerFeedback);

// Get event feedback statistics (organizers, admins)
router.get('/event/:eventId', feedbackController.getEventFeedbackStats);

module.exports = router;