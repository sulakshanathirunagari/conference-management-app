// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

// Apply auth middleware to all routes
router.use(protect);

// Get all questions for a session
router.get(
  '/session/:sessionId',
  questionController.getSessionQuestions
);

// Submit a new question
router.post(
  '/ask',
  questionController.askQuestion
);

// Answer a question
router.post(
  '/:questionId/answer',
  questionController.answerQuestion
);

module.exports = router;