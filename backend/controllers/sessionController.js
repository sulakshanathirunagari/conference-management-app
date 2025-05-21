// controllers/sessionController.js
const Event = require('../models/Event');
const User = require('../models/User');

// Add a session to an event
exports.addSession = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.title || !sessionData.description || 
        !sessionData.startTime || !sessionData.endTime || 
        !sessionData.location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required session fields'
      });
    }
    
    // Validate speaker (MANDATORY)
    if (!sessionData.speaker) {
      return res.status(400).json({
        success: false,
        message: 'Speaker assignment is mandatory for sessions'
      });
    }
    
    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if the user is authorized to add a session
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this event'
      });
    }
    
    // Verify that speaker exists
    const speaker = await User.findById(sessionData.speaker);
    if (!speaker || speaker.role !== 'speaker') {
      return res.status(400).json({
        success: false,
        message: 'Invalid speaker specified'
      });
    }
    
    // Add the session to the event
    event.sessions.push(sessionData);
    
    // Add speaker to event.speakers array if not already included
    if (!event.speakers.includes(sessionData.speaker)) {
      event.speakers.push(sessionData.speaker);
    }
    
    // Save the updated event
    await event.save();
    
    // Return the updated event with populated fields
    const updatedEvent = await Event.findById(eventId)
      .populate('organizer', 'fullName email')
      .populate('speakers', 'fullName email organization bio')
      .populate('sessions.speaker', 'fullName email organization');
    
    res.status(201).json({
      success: true,
      message: 'Session added successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add session',
      error: error.message
    });
  }
};

// Update a session
exports.updateSession = async (req, res) => {
  try {
    const { id: eventId, sessionId } = req.params;
    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.title || !sessionData.description || 
        !sessionData.startTime || !sessionData.endTime || 
        !sessionData.location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required session fields'
      });
    }
    
    // Validate speaker (MANDATORY)
    if (!sessionData.speaker) {
      return res.status(400).json({
        success: false,
        message: 'Speaker assignment is mandatory for sessions'
      });
    }
    
    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if the user is authorized to update a session
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this event'
      });
    }
    
    // Find the session index
    const sessionIndex = event.sessions.findIndex(
      session => session._id.toString() === sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Verify that speaker exists
    const speaker = await User.findById(sessionData.speaker);
    if (!speaker || speaker.role !== 'speaker') {
      return res.status(400).json({
        success: false,
        message: 'Invalid speaker specified'
      });
    }
    
    // Update the session
    event.sessions[sessionIndex] = {
      ...event.sessions[sessionIndex].toObject(),
      ...sessionData,
      _id: event.sessions[sessionIndex]._id // Ensure ID is preserved
    };
    
    // Check if we need to add a new speaker to the event.speakers array
    if (!event.speakers.includes(sessionData.speaker)) {
      event.speakers.push(sessionData.speaker);
    }
    
    // Update event.speakers array by checking which speakers are still needed
    const activeSpeakers = new Set(
      event.sessions.map(session => session.speaker.toString())
    );
    
    event.speakers = event.speakers.filter(speaker => 
      activeSpeakers.has(speaker.toString())
    );
    
    // Save the updated event
    await event.save();
    
    // Return the updated event with populated fields
    const updatedEvent = await Event.findById(eventId)
      .populate('organizer', 'fullName email')
      .populate('speakers', 'fullName email organization bio')
      .populate('sessions.speaker', 'fullName email organization');
    
    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update session',
      error: error.message
    });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const { id: eventId, sessionId } = req.params;
    
    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if the user is authorized to delete a session
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this event'
      });
    }
    
    // Find the session index
    const sessionIndex = event.sessions.findIndex(
      session => session._id.toString() === sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Remove the session
    event.sessions.splice(sessionIndex, 1);
    
    // Update event.speakers array by checking which speakers are still needed
    const activeSpeakers = new Set(
      event.sessions.map(session => session.speaker.toString())
    );
    
    event.speakers = event.speakers.filter(speaker => 
      activeSpeakers.has(speaker.toString())
    );
    
    // Save the updated event
    await event.save();
    
    // Return the updated event with populated fields
    const updatedEvent = await Event.findById(eventId)
      .populate('organizer', 'fullName email')
      .populate('speakers', 'fullName email organization bio')
      .populate('sessions.speaker', 'fullName email organization');
    
    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
};