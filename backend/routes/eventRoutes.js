// // routes/eventRoutes.js
// const express = require('express');
// const eventController = require('../controllers/eventController');
// const { protect, authorize } = require('../middleware/auth');
// const sessionController = require("../controllers/sessionController")

// const router = express.Router();

// // Protect all routes
// router.use(protect);

// // Get all events route is available to all authenticated users
// router.get('/', eventController.getEvents);

// // Get a specific event
// router.get('/:id', eventController.getEventById);

// // Get user's events
// router.get('/my/events', eventController.getMyEvents);

// // Register for an event
// router.post('/:id/register', eventController.registerForEvent);

// // Cancel registration
// router.delete('/:id/register', eventController.cancelRegistration);

// // Routes for organizers and admins
// router.use(authorize('organizer', 'admin'));

// // Create event
// router.post('/', eventController.createEvent);

// // Add session to an event
// router.post('/:id/sessions', eventController.addSession);

// // Update event
// router.put('/:id', eventController.updateEvent);

// // Delete event
// router.delete('/:id', eventController.deleteEvent);

// router.post(
//     '/:id/sessions',
//     protect,
//     authorize('organizer', 'admin'),
//     sessionController.addSession
//   );
  
//   // Update session
//   router.put(
//     '/:id/sessions/:sessionId',
//     protect,
//     authorize('organizer', 'admin'),
//     sessionController.updateSession
//   );
  
//   // Delete session
//   router.delete(
//     '/:id/sessions/:sessionId',
//     protect,
//     authorize('organizer', 'admin'),
//     sessionController.deleteSession
//   );

//   // Get session materials 
// router.get(
//   '/:id/sessions/:sessionId/materials',
//   protect, // Only authenticated users can access materials
//   async (req, res) => {
//     try {
//       const { id: eventId, sessionId } = req.params;

//       // Find the event
//       const event = await Event.findById(eventId);
      
//       if (!event) {
//         return res.status(404).json({
//           success: false,
//           message: 'Event not found'
//         });
//       }

//       // Find the session
//       const session = event.sessions.id(sessionId);
      
//       if (!session) {
//         return res.status(404).json({
//           success: false,
//           message: 'Session not found'
//         });
//       }

//       // Check if user is authorized to view materials
//       // Allow if user is event organizer, admin, speaker, or attendee
//       const isOrganizer = event.organizer.toString() === req.user._id.toString();
//       const isAdmin = req.user.role === 'admin';
//       const isSpeaker = session.speaker && 
//                       session.speaker.toString() === req.user._id.toString();
//       const isAttendee = event.attendees && 
//                         event.attendees.some(id => id.toString() === req.user._id.toString());

//       if (!isOrganizer && !isAdmin && !isSpeaker && !isAttendee) {
//         return res.status(403).json({
//           success: false,
//           message: 'Not authorized to access materials for this session'
//         });
//       }

//       // Return materials with proper formatting
//       const materials = session.resources || [];
      
//       res.status(200).json({
//         success: true,
//         data: materials
//       });
//     } catch (error) {
//       console.error('Error fetching session materials:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to fetch session materials',
//         error: error.message
//       });
//     }
//   }
// );

// module.exports = router;
// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const sessionController = require("../controllers/sessionController");
const Event = require('../models/Event');

// Protect all routes
router.use(protect);

// Get all events route is available to all authenticated users
router.get('/', eventController.getEvents);

// Get a specific event
router.get('/:id', eventController.getEventById);

// Get user's events
router.get('/my/events', eventController.getMyEvents);

// Register for an event
router.post('/:id/register', eventController.registerForEvent);

// Cancel registration
router.delete('/:id/register', eventController.cancelRegistration);

router.get(
  '/:id/attendees',
  protect,
  eventController.getEventAttendees
);

// IMPORTANT FIX: Get session materials - REMOVED authorize middleware to allow speakers access
router.get(
  '/:id/sessions/:sessionId/materials',
  async (req, res) => {
    try {
      const { id: eventId, sessionId } = req.params;
      
      if (!eventId || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Event ID and Session ID are required'
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
      
      // Find the session
      const session = event.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Check if user is authorized to view materials
      // Allow if user is event organizer, admin, speaker, or attendee
      const userId = req.user._id.toString();
      const isOrganizer = event.organizer.toString() === userId;
      const isAdmin = req.user.role === 'admin';
      const isSpeaker = session.speaker && session.speaker.toString() === userId;
      const isAttendee = event.attendees && event.attendees.some(id => id.toString() === userId);
      
      // IMPORTANT: Allow speakers to access their own session materials
      if (!isOrganizer && !isAdmin && !isSpeaker && !isAttendee) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access materials for this session'
        });
      }
      
      // Return materials with proper formatting
      const materials = session.resources || [];
      
      res.status(200).json({
        success: true,
        data: materials
      });
    } catch (error) {
      console.error('Error fetching session materials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch session materials',
        error: error.message
      });
    }
  }
);

// Routes for organizers and admins
router.use(authorize('organizer', 'admin'));

// Create event
router.post('/', eventController.createEvent);

// Add session to an event
router.post('/:id/sessions', eventController.addSession);

// Update event
router.put('/:id', eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

router.post(
  '/:id/sessions',
  sessionController.addSession
);

// Update session
router.put(
  '/:id/sessions/:sessionId',
  sessionController.updateSession
);

// Delete session
router.delete(
  '/:id/sessions/:sessionId',
  sessionController.deleteSession
);

module.exports = router;