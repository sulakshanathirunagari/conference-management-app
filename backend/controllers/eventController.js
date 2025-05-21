// controllers/eventController.js
const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket')

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Add organizer to the request body
    req.body.organizer = req.user.id;
    
    // Create event
    const event = await Event.create(req.body);
    
    // Add event to organizer's event list
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { events: event._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

// Get all events with filtering
exports.getEvents = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      location,
      search,
      organizer,
      price,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query
    let query = {};
    
    // Status filter
    if (status) {
      query.status = status;
    } else {
      // By default, exclude draft events for non-organizers
      if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
        query.status = { $ne: 'draft' };
      }
    }
    
    // Date range filter
    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    
    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Price filter
    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by organizer
    if (organizer) {
      query.organizer = organizer;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('organizer', 'fullName email')
      .populate('speakers', 'fullName email organization');
    
    // Get total count for pagination
    const total = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName email organization')
      .populate('speakers', 'fullName email organization bio')
      .populate('sessions.speaker', 'fullName email organization');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if draft event is accessible
    if (event.status === 'draft' && 
        req.user.role !== 'admin' && 
        event.organizer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this event',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check ownership (only admin or the organizer can update)
    if (req.user.role !== 'admin' && 
        event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }
    
    // Update the event
    event = await Event.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message,
    });
  }
};


exports.deleteEvent = async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }
      
      // Check ownership (only admin or the organizer can delete)
      if (req.user.role !== 'admin' && 
          event.organizer.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this event',
        });
      }
      
      console.log("Attempting to delete event:", req.params.id);
      
      // Remove event from organizer's event list - with error handling
      try {
        await User.findByIdAndUpdate(
          event.organizer,
          { $pull: { events: event._id } }
        );
        console.log("Removed event from organizer's list");
      } catch (err) {
        console.error("Error removing event from organizer:", err);
        // Continue with deletion even if this fails
      }
      
      // Delete the event - with better error handling
      try {
        // Use findByIdAndDelete instead of remove()
        await Event.findByIdAndDelete(req.params.id);
        console.log("Event deleted successfully");
      } catch (err) {
        console.error("Error deleting event:", err);
        throw err; // Re-throw to be caught by the outer catch block
      }
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error.message,
      });
    }
  };

// Register for an event
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for an event that is not published',
      });
    }
    
    // Check if already registered
    const isRegistered = event.attendees.includes(req.user.id);
    
    if (isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }
    
    // Check if event is full
    if (event.isFullyBooked) {
      return res.status(400).json({
        success: false,
        message: 'This event is fully booked',
      });
    }
    
    // Add attendee to event
    event.attendees.push(req.user.id);
    await event.save();
    
    // Add event to user's events
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { events: event._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Successfully registered for the event',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message,
    });
  }
};

// Cancel registration for an event
exports.cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if registered
    const isRegistered = event.attendees.includes(req.user.id);
    
    if (!isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event',
      });
    }
    
    // Remove attendee from event
    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.user.id
    );
    await event.save();
    
    // Remove event from user's events
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { events: event._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Successfully cancelled registration',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message,
    });
  }
};

// Add session to an event
exports.addSession = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check ownership (only admin or the organizer can add sessions)
    if (req.user.role !== 'admin' && 
        event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add sessions to this event',
      });
    }
    
    // Add session
    event.sessions.push(req.body);
    
    // Add speaker to event speakers list if not already included
    if (!event.speakers.includes(req.body.speaker)) {
      event.speakers.push(req.body.speaker);
    }
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Session added successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add session',
      error: error.message,
    });
  }
};

// Get my events (as organizer, speaker, or attendee)
exports.getMyEvents = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    switch (role) {
      case 'organizer':
        query = { organizer: req.user.id };
        break;
      case 'speaker':
        query = { speakers: req.user.id };
        break;
      case 'attendee':
        query = { attendees: req.user.id };
        break;
      default:
        // Get all events associated with the user
        query = {
          $or: [
            { organizer: req.user.id },
            { speakers: req.user.id },
            { attendees: req.user.id }
          ]
        };
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .populate('organizer', 'fullName email')
      .populate('speakers', 'fullName email organization');
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getEventAttendees = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    console.log(`Fetching attendees for event: ${eventId}`);
    
    // Find the event first to verify it exists and check permissions
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is authorized (only organizer, admin, or speakers can see attendee details)
    const isOrganizer = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isSpeaker = event.speakers && event.speakers.some(
      speakerId => speakerId.toString() === req.user.id
    );
    
    if (!isOrganizer && !isAdmin && !isSpeaker) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendee details for this event'
      });
    }

    // First, directly populate the attendees array from the event
    const populatedEvent = await Event.findById(eventId)
      .populate('attendees', 'fullName email organization');
    
    // Get the basic attendee info from the populated event
    const attendeeInfo = populatedEvent.attendees.map(attendee => ({
      _id: attendee._id,
      fullName: attendee.fullName,
      email: attendee.email,
      organization: attendee.organization || 'N/A'
    }));
    
    console.log(`Found ${attendeeInfo.length} attendees from event population`);
    
    // Now also fetch ticket information to get registration dates and ticket types
    const tickets = await Ticket.find({ 
      event: eventId,
      paymentStatus: 'completed' // Only include confirmed tickets
    });
    
    console.log(`Found ${tickets.length} tickets for this event`);
    
    // Create a map of user IDs to their ticket information
    const ticketInfoByUserId = {};
    
    tickets.forEach(ticket => {
      const attendeeId = ticket.attendee.toString();
      ticketInfoByUserId[attendeeId] = {
        registrationDate: ticket.purchaseDate,
        ticketType: ticket.ticketType.name,
        ticketId: ticket._id
      };
    });
    
    // Combine the attendee info with ticket info
    const completeAttendeeInfo = attendeeInfo.map(attendee => {
      const attendeeId = attendee._id.toString();
      const ticketInfo = ticketInfoByUserId[attendeeId] || {
        registrationDate: new Date(),
        ticketType: 'Standard',
        ticketId: null
      };
      
      return {
        ...attendee,
        ...ticketInfo
      };
    });
    
    res.status(200).json({
      success: true,
      count: completeAttendeeInfo.length,
      data: completeAttendeeInfo
    });
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendees',
      error: error.message
    });
  }
};