// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const User = require('../models/User');

// Submit feedback for a session
exports.submitFeedback = async (req, res) => {
  try {
    const { eventId, sessionId, rating, comment, isAnonymous = false } = req.body;
    
    // Validate required fields
    if (!eventId || !sessionId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, Session ID, rating, and comment are required'
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if event exists and user is registered
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Verify user is registered for the event
    const isAttendee = event.attendees.some(
      attendee => attendee.toString() === req.user.id
    );
    
    if (!isAttendee) {
      return res.status(403).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }
    
    // Find the session in the event
    const session = event.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Check if user has already submitted feedback for this session
    const existingFeedback = await Feedback.findOne({
      attendee: req.user.id,
      sessionId: sessionId
    });
    
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this session'
      });
    }
    
    // Create new feedback
    const feedback = await Feedback.create({
      eventId,
      sessionId,
      attendee: req.user.id,
      speaker: session.speaker,
      rating,
      comment,
      isAnonymous
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Get feedback for a specific session (for event organizers and session speakers)
exports.getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find session in events to verify permissions
    const event = await Event.findOne({ 'sessions._id': sessionId });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Find the session
    const session = event.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Check permissions - only organizers, admins, or the session speaker can view
    const isOrganizer = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isSpeaker = session.speaker && 
                      session.speaker.toString() === req.user.id;
    
    if (!isOrganizer && !isAdmin && !isSpeaker) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view feedback for this session'
      });
    }
    
    // Fetch feedback for the session
    const feedback = await Feedback.find({ sessionId })
      .populate({
        path: 'attendee',
        select: 'fullName email'
      })
      .sort({ createdAt: -1 });
    
    // Process feedback to respect anonymity settings
    const processedFeedback = feedback.map(item => {
      if (item.isAnonymous) {
        return {
          ...item.toObject(),
          attendee: {
            fullName: 'Anonymous Attendee',
            email: ''
          }
        };
      }
      return item;
    });
    
    // Calculate average rating
    const totalRatings = feedback.length;
    const sumRatings = feedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;
    
    // Count ratings by star
    const ratingCounts = {
      1: feedback.filter(f => f.rating === 1).length,
      2: feedback.filter(f => f.rating === 2).length,
      3: feedback.filter(f => f.rating === 3).length,
      4: feedback.filter(f => f.rating === 4).length,
      5: feedback.filter(f => f.rating === 5).length
    };
    
    res.status(200).json({
      success: true,
      data: {
        feedback: processedFeedback,
        stats: {
          totalFeedback: totalRatings,
          averageRating,
          ratingCounts
        }
      }
    });
  } catch (error) {
    console.error('Error getting session feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session feedback',
      error: error.message
    });
  }
};

// Get all feedback for a speaker's sessions
exports.getSpeakerFeedback = async (req, res) => {
  try {
    // Check if requesting own feedback or if admin
    const speakerId = req.params.speakerId || req.user.id;
    
    if (speakerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this feedback'
      });
    }
    
    // Find all feedback for the speaker
    const feedback = await Feedback.find({ speaker: speakerId })
      .populate({
        path: 'attendee',
        select: 'fullName email'
      })
      .populate({
        path: 'eventId',
        select: 'title'
      })
      .sort({ createdAt: -1 });
    
    // Process feedback to respect anonymity
    const processedFeedback = feedback.map(item => {
      if (item.isAnonymous) {
        return {
          ...item.toObject(),
          attendee: {
            fullName: 'Anonymous Attendee',
            email: ''
          }
        };
      }
      return item;
    });
    
    // Group feedback by event and session
    const feedbackBySession = {};
    
    for (const item of processedFeedback) {
      const sessionId = item.sessionId.toString();
      
      if (!feedbackBySession[sessionId]) {
        // Find the event and session information
        const event = await Event.findById(item.eventId);
        const session = event?.sessions?.id(sessionId);
        
        if (session) {
          feedbackBySession[sessionId] = {
            sessionId: sessionId,
            sessionTitle: session.title,
            eventId: event._id,
            eventTitle: event.title,
            feedback: [],
            stats: {
              totalFeedback: 0,
              averageRating: 0,
              ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
          };
        }
      }
      
      if (feedbackBySession[sessionId]) {
        feedbackBySession[sessionId].feedback.push(item);
        feedbackBySession[sessionId].stats.totalFeedback++;
        feedbackBySession[sessionId].stats.ratingCounts[item.rating]++;
      }
    }
    
    // Calculate average ratings for each session
    Object.values(feedbackBySession).forEach(session => {
      const sumRatings = session.feedback.reduce((sum, item) => sum + item.rating, 0);
      session.stats.averageRating = session.stats.totalFeedback > 0 
        ? (sumRatings / session.stats.totalFeedback).toFixed(1) 
        : 0;
    });
    
    res.status(200).json({
      success: true,
      data: Object.values(feedbackBySession)
    });
  } catch (error) {
    console.error('Error getting speaker feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get speaker feedback',
      error: error.message
    });
  }
};

// Get feedback statistics for a specific event (for organizers)
exports.getEventFeedbackStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized (admin or event organizer)
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this event\'s feedback'
      });
    }
    
    // Get all feedback for the event
    const allFeedback = await Feedback.find({ eventId });
    
    // Group feedback by session
    const sessionIds = event.sessions.map(session => session._id.toString());
    const feedbackBySession = {};
    
    sessionIds.forEach(id => {
      const sessionFeedback = allFeedback.filter(
        feedback => feedback.sessionId.toString() === id
      );
      
      const session = event.sessions.id(id);
      
      if (session) {
        // Calculate session statistics
        const totalFeedback = sessionFeedback.length;
        const sumRatings = sessionFeedback.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = totalFeedback > 0 ? (sumRatings / totalFeedback).toFixed(1) : 0;
        
        // Count ratings by star
        const ratingCounts = {
          1: sessionFeedback.filter(f => f.rating === 1).length,
          2: sessionFeedback.filter(f => f.rating === 2).length,
          3: sessionFeedback.filter(f => f.rating === 3).length,
          4: sessionFeedback.filter(f => f.rating === 4).length,
          5: sessionFeedback.filter(f => f.rating === 5).length
        };
        
        feedbackBySession[id] = {
          sessionId: id,
          sessionTitle: session.title,
          speakerId: session.speaker,
          totalFeedback,
          averageRating,
          ratingCounts
        };
      }
    });
    
    // Get overall event statistics
    const totalFeedback = allFeedback.length;
    const sumRatings = allFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalFeedback > 0 ? (sumRatings / totalFeedback).toFixed(1) : 0;
    
    // Count overall ratings by star
    const overallRatingCounts = {
      1: allFeedback.filter(f => f.rating === 1).length,
      2: allFeedback.filter(f => f.rating === 2).length,
      3: allFeedback.filter(f => f.rating === 3).length,
      4: allFeedback.filter(f => f.rating === 4).length,
      5: allFeedback.filter(f => f.rating === 5).length
    };
    
    res.status(200).json({
      success: true,
      data: {
        eventStats: {
          totalFeedback,
          averageRating,
          ratingCounts: overallRatingCounts
        },
        sessionStats: Object.values(feedbackBySession)
      }
    });
  } catch (error) {
    console.error('Error getting event feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event feedback statistics',
      error: error.message
    });
  }
};

// Add these methods to your feedbackController.js file

// Get all feedback submitted by the current user
exports.getUserFeedback = async (req, res) => {
    try {
      // Find all feedback submitted by this user
      const feedback = await Feedback.find({ attendee: req.user.id })
        .populate({
          path: 'eventId',
          select: 'title'
        })
        .populate({
          path: 'speaker',
          select: 'fullName email'
        })
        .sort({ createdAt: -1 });
  
      // Enhance the feedback data with session information
      const enhancedFeedback = await Promise.all(feedback.map(async (item) => {
        try {
          // Find the event to get session information
          const event = await Event.findById(item.eventId);
          const session = event?.sessions?.id(item.sessionId);
          
          return {
            ...item.toObject(),
            sessionName: session?.title || 'Unknown Session',
            eventName: event?.title || 'Unknown Event'
          };
        } catch (err) {
          console.error(`Error enhancing feedback ${item._id}:`, err);
          // Return the original item if enhancement fails
          return {
            ...item.toObject(),
            sessionName: 'Session',
            eventName: item.eventId?.title || 'Event'
          };
        }
      }));
      
      res.status(200).json({
        success: true,
        count: feedback.length,
        data: enhancedFeedback
      });
    } catch (error) {
      console.error('Error getting user feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get your submitted feedback',
        error: error.message
      });
    }
  };
  
  // Check if a user has already submitted feedback for a session
  exports.checkFeedbackExists = async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }
      
      // Check if user has already submitted feedback for this session
      const existingFeedback = await Feedback.findOne({
        attendee: req.user.id,
        sessionId: sessionId
      });
      
      res.status(200).json({
        success: true,
        exists: !!existingFeedback,
        data: existingFeedback
      });
    } catch (error) {
      console.error('Error checking feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feedback status',
        error: error.message
      });
    }
  };