

// controllers/questionController.js
const Question = require('../models/Question');
const Event = require('../models/Event');

// Get questions for a session
exports.getSessionQuestions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Find all questions for this session
    const questions = await Question.find({ sessionId })
      .populate({
        path: 'askedBy',
        select: 'fullName email'
      })
      .populate({
        path: 'answer.answeredBy',
        select: 'fullName email'
      })
      .sort({ createdAt: -1 });
    
    // Return the questions
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching session questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
};

// Answer a question
exports.answerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text } = req.body;
    
    // Validate required fields
    if (!questionId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Question ID and answer text are required'
      });
    }
    
    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    // Verify that the user is the session speaker
    const event = await Event.findById(question.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const session = event.sessions.id(question.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Check if user is the speaker
    const isSpeaker = session.speaker && 
                      session.speaker.toString() === req.user._id.toString();
    
    if (!isSpeaker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to answer questions for this session'
      });
    }
    
    // Update the question with the answer
    question.answer = {
      text,
      answeredBy: req.user._id,
      answeredAt: Date.now()
    };
    question.status = 'answered';
    await question.save();
    
    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message
    });
  }
};

exports.askQuestion = async (req, res) => {
  try {
    const { sessionId, eventId, text, isAnonymous } = req.body;
    
    // Validate required fields
    if (!sessionId || !eventId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, Event ID, and question text are required'
      });
    }
    
    // Check if the event and session exist
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const session = event.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Create the new question
    const question = await Question.create({
      sessionId,
      eventId,
      askedBy: req.user._id,
      text,
      isAnonymous: isAnonymous === true,
      status: 'pending'
    });
    
    // Populate user info for the response
    await question.populate({
      path: 'askedBy',
      select: 'fullName email profileImage'
    });
    
    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error asking question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit question',
      error: error.message
    });
  }
};