// // controllers/uploadController.js
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = process.env.UPLOAD_PATH || './uploads';
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // Create unique filename with original extension
//     const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname);
//     cb(null, uniquePrefix + ext);
//   }
// });

// // File filter - only allow images
// const fileFilter = (req, file, cb) => {
//   // Accept only image files
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

// // Configure upload middleware
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880, 10) // 5MB default
//   }
// });

// // Upload single file
// exports.uploadSingle = (fieldName) => {
//   return (req, res, next) => {
//     // Use multer upload instance
//     const uploadMiddleware = upload.single(fieldName);
    
//     uploadMiddleware(req, res, (err) => {
//       if (err) {
//         if (err instanceof multer.MulterError) {
//           // Multer error (e.g., file size exceeded)
//           return res.status(400).json({
//             success: false,
//             message: `Upload error: ${err.message}`
//           });
//         } else {
//           // Other error
//           return res.status(400).json({
//             success: false,
//             message: err.message
//           });
//         }
//       }
      
//       // No file uploaded
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: 'No file uploaded'
//         });
//       }
      
//       // File uploaded successfully
//       next();
//     });
//   };
// };

// // Handle file upload
// exports.handleFileUpload = (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }
    
//     // Create file URL based on server configuration
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
//     res.status(200).json({
//       success: true,
//       file: req.file,
//       fileUrl
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// // Upload multiple files
// exports.uploadMultiple = (fieldName, maxCount) => {
//   return (req, res, next) => {
//     const uploadMiddleware = upload.array(fieldName, maxCount);
    
//     uploadMiddleware(req, res, (err) => {
//       if (err) {
//         if (err instanceof multer.MulterError) {
//           return res.status(400).json({
//             success: false,
//             message: `Upload error: ${err.message}`
//           });
//         } else {
//           return res.status(400).json({
//             success: false,
//             message: err.message
//           });
//         }
//       }
      
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'No files uploaded'
//         });
//       }
      
//       next();
//     });
//   };
// };

// // Handle multiple file uploads
// exports.handleMultipleFileUpload = (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No files uploaded'
//       });
//     }
    
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     const fileUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    
//     res.status(200).json({
//       success: true,
//       files: req.files,
//       fileUrls
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// controllers/uploadController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

// File filter - allow document files for materials
const materialFileFilter = (req, file, cb) => {
  // Accept document file types
  const allowedTypes = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, XLSX and PPT files are allowed!'), false);
  }
};

// Image file filter (for profile pictures, event banners, etc.)
const imageFileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure upload middleware for materials
const materialUpload = multer({
  storage,
  fileFilter: materialFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 10485760, 10) // 10MB default
  }
});

// Configure upload middleware for images
const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880, 10) // 5MB default
  }
});

// Upload single image
exports.uploadSingleImage = (fieldName) => {
  return (req, res, next) => {
    // Use multer upload instance
    const uploadMiddleware = imageUpload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Multer error (e.g., file size exceeded)
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        } else {
          // Other error
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
      }
      
      next();
    });
  };
};

// Upload single file (for backward compatibility)
exports.uploadSingle = exports.uploadSingleImage;

// Upload multiple materials
exports.uploadMaterials = (fieldName, maxCount) => {
  return (req, res, next) => {
    const uploadMiddleware = materialUpload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        } else {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
      }
      
      next();
    });
  };
};

// Upload multiple files (general-purpose, backward compatibility)
exports.uploadMultiple = (fieldName, maxCount) => {
  return (req, res, next) => {
    const uploadMiddleware = imageUpload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        } else {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
      }
      
      next();
    });
  };
};

// Handle file upload
exports.handleFileUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create file URL based on server configuration
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      file: {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadDate: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Handle multiple file uploads
exports.handleMultipleFileUpload = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const files = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadDate: Date.now()
    }));
    
    res.status(200).json({
      success: true,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};