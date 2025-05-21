// controllers/notificationController.js
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const User = require('../models/User');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { eventId, title, message, recipients, specificRecipients, type } = req.body;
    
    console.log("Creating notification:", {
      eventId, title, message, recipients, type,
      specificsCount: specificRecipients ? specificRecipients.length : 0
    });
    
    // Check if event exists and user is authorized
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Only organizers or admins can send notifications
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send notifications for this event'
      });
    }
    
    // Create the notification
    const notification = await Notification.create({
      sender: req.user.id,
      event: eventId,
      title,
      message,
      recipients: recipients || 'all',
      specificRecipients: specificRecipients || [],
      type: type || 'info'
    });
    
    // Populate sender details
    await notification.populate('sender', 'fullName email');
    
    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

// Get notifications for user
exports.getUserNotifications = async (req, res) => {
  try {
    console.log("Fetching notifications for user:", req.user.id);
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find events the user is involved with
    const userEvents = await Event.find({
      $or: [
        { attendees: req.user.id },
        { speakers: req.user.id },
        { organizer: req.user.id }
      ]
    }).select('_id');
    
    console.log("User is involved in events:", userEvents.map(e => e._id));
    
    const eventIds = userEvents.map(event => event._id);
    
    // Build query based on user role and read status
    let query = {
      event: { $in: eventIds },
      $or: [
        { recipients: 'all' },
        { specificRecipients: req.user.id }
      ]
    };
    
    // Add role-specific conditions
    if (req.user.role === 'speaker') {
      query.$or.push({ recipients: 'speakers' });
    } else if (req.user.role === 'attendee') {
      query.$or.push({ recipients: 'attendees' });
    }
    
    // Add unread filter if requested
    if (unreadOnly === 'true') {
      query[`isRead.${req.user.id}`] = { $ne: true };
    }
    
    console.log("Notification query:", JSON.stringify(query));
    
    // Execute query with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'fullName')
      .populate('event', 'title');
    
    console.log("Found notifications:", notifications.length);
    
    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: notifications
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Update the isRead map for this user
    notification.isRead.set(req.user.id, true);
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Get all event notifications (for organizers)
exports.getEventNotifications = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log("Fetching notifications for event:", eventId, {page, limit});
    
    // Check if event exists and user is authorized
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Only organizers or admins can view all notifications
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all notifications for this event'
      });
    }
    
    // Find notifications for this event with pagination
    const notifications = await Notification.find({ event: eventId })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('sender', 'fullName')
      .populate('specificRecipients', 'fullName email role');
    
    console.log("Found event notifications:", notifications.length);
    
    // Get total count
    const total = await Notification.countDocuments({ event: eventId });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: notifications
    });
  } catch (error) {
    console.error("Error fetching event notifications:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event notifications',
      error: error.message
    });
  }
};