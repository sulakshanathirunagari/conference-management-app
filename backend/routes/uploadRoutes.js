// // routes/uploadRoutes.js
// const express = require('express');
// const uploadController = require('../controllers/uploadController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// // Protect all routes
// router.use(protect);

// // Upload a single file
// router.post(
//   '/single',
//   uploadController.uploadSingle('file'),
//   uploadController.handleFileUpload
// );

// // Upload event banner
// router.post(
//   '/banner',
//   uploadController.uploadSingle('banner'),
//   uploadController.handleFileUpload
// );

// // Upload multiple files
// router.post(
//   '/multiple',
//   uploadController.uploadMultiple('files', 5), // Allow up to 5 files
//   uploadController.handleMultipleFileUpload
// );


// // Upload session materials
// router.post(
//   '/materials',
//   uploadController.uploadMultiple('files', 10), // Allow up to 10 files
//   async (req, res) => {
//     try {
//       const { sessionId, eventId } = req.body;
      
//       if (!sessionId || !eventId) {
//         return res.status(400).json({
//           success: false,
//           message: 'Session ID and Event ID are required'
//         });
//       }
      
//       // Get base URL for files
//       const baseUrl = `${req.protocol}://${req.get('host')}`;
      
//       // Prepare materials data
//       const materials = req.files.map(file => ({
//         fileName: file.originalname,
//         fileUrl: `${baseUrl}/uploads/${file.filename}`,
//         fileType: file.mimetype,
//         fileSize: file.size,
//         uploadDate: Date.now(),
//         uploader: req.user.id
//       }));
      
//       // Add materials to the session
//       const event = await Event.findById(eventId);
//       if (!event) {
//         return res.status(404).json({
//           success: false,
//           message: 'Event not found'
//         });
//       }
      
//       const session = event.sessions.id(sessionId);
//       if (!session) {
//         return res.status(404).json({
//           success: false,
//           message: 'Session not found'
//         });
//       }
      
//       // Initialize resources array if it doesn't exist
//       if (!session.resources) {
//         session.resources = [];
//       }
      
//       // Add new materials
//       session.resources.push(...materials);
      
//       // Save the updated event
//       await event.save();
      
//       res.status(200).json({
//         success: true,
//         message: 'Materials uploaded successfully',
//         files: materials
//       });
//     } catch (error) {
//       console.error('Error uploading materials:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to upload materials',
//         error: error.message
//       });
//     }
//   }
// );

// module.exports = router;

// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const Event = require('../models/Event');

// Apply auth middleware to all routes
router.use(protect);

// Upload single image (for profile pics, event banners, etc.)
router.post(
  '/image',
  uploadController.uploadSingleImage('image'),
  uploadController.handleFileUpload
);

// Upload event banner
router.post(
  '/banner',
  uploadController.uploadSingleImage('banner'),
  uploadController.handleFileUpload
);

// Upload multiple files (general purpose)
router.post(
  '/multiple',
  uploadController.uploadMultiple('files', 5), // Allow up to 5 files
  uploadController.handleMultipleFileUpload
);

// Upload session materials
router.post(
  '/materials',
  uploadController.uploadMaterials('files', 10), // Allow up to 10 files
  async (req, res) => {
    try {
      const { sessionId, eventId } = req.body;
      
      if (!sessionId || !eventId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and Event ID are required'
        });
      }
      
      // Get base URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Format materials
      const materials = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `${baseUrl}/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadDate: Date.now(),
        uploader: req.user._id
      }));
      
      // Find event and update session
      const event = await Event.findById(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      // Find session in the event
      const session = event.sessions.id(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Check if user is authorized to upload materials
      // Allow if user is event organizer, admin, or the session speaker
      const isOrganizer = event.organizer.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      const isSpeaker = session.speaker && 
                        session.speaker.toString() === req.user._id.toString();
      
      if (!isOrganizer && !isAdmin && !isSpeaker) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to upload materials to this session'
        });
      }
      
      // Initialize resources array if it doesn't exist
      if (!session.resources) {
        session.resources = [];
      }
      
      // Add new materials
      session.resources.push(...materials);
      
      // Save the event with updated session
      await event.save();
      
      res.status(200).json({
        success: true,
        message: 'Materials uploaded successfully',
        files: materials
      });
    } catch (error) {
      console.error('Error uploading materials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload materials',
        error: error.message
      });
    }
  }
);

module.exports = router;