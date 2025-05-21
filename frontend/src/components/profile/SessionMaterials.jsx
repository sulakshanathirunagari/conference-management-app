import React, { useState, useEffect } from 'react';
import { Calendar, File, Upload, X, FileText, Check, AlertCircle } from 'lucide-react';

const SessionMaterials = ({ currentUser, sessions }) => {
  // State for tracking uploaded files and upload status
  const [uploadState, setUploadState] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedMaterials, setUploadedMaterials] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch existing uploaded materials for each session when component mounts
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;
    
    const fetchMaterials = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Create an object to store materials by session ID
        const materialsMap = {};
        
        // Fetch materials for each session
        for (const session of sessions) {
          try {
            console.log(`Fetching materials for session ${session._id}`);
            const response = await fetch(`http://localhost:5000/api/events/${session.eventId}/sessions/${session._id}/materials`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              materialsMap[session._id] = data.data || [];
              console.log(`Found ${data.data?.length || 0} materials for session ${session._id}`);
            } else {
              console.error(`Error response for session ${session._id}:`, 
                `Status: ${response.status}`, 
                await response.text());
            }
          } catch (err) {
            console.error(`Error fetching materials for session ${session._id}:`, err);
          }
        }
        
        setUploadedMaterials(materialsMap);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Failed to load session materials');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [sessions]);

  // Handle file selection for a session
  const handleFileSelect = (e, sessionId) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      setUploadState(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          error: 'Some files were rejected. Only PDF, DOCX, XLSX and PPT files are allowed.'
        }
      }));
    }
    
    if (validFiles.length === 0) return;
    
    // Store selected files in state
    setUploadState(prev => ({
      ...prev,
      [sessionId]: {
        files: validFiles,
        error: validFiles.length !== files.length ? 
          'Some files were rejected. Only PDF, DOCX, XLSX and PPT files are allowed.' : null
      }
    }));
  };

  // Handle file upload for a session
  const handleUpload = async (sessionId, eventId) => {
    const files = uploadState[sessionId]?.files;
    if (!files || files.length === 0) return;
    
    setUploadState(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        uploading: true,
        error: null
      }
    }));
    
    try {
      // Create form data with the files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add session and event IDs
      formData.append('sessionId', sessionId);
      formData.append('eventId', eventId);
      
      console.log(`Uploading ${files.length} files for session ${sessionId}, event ${eventId}`);
      
      // Upload the files
      const response = await fetch('http://localhost:5000/api/upload/materials', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      // Handle response
      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        throw new Error(`Server returned invalid JSON: ${await response.text()}`);
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to upload materials: ${response.status}`);
      }
      
      console.log('Upload successful:', responseData);
      
      // Update the uploaded materials state
      setUploadedMaterials(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), ...responseData.files]
      }));
      
      // Clear upload state
      setUploadState(prev => ({
        ...prev,
        [sessionId]: {
          success: true,
          error: null,
          uploading: false
        }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({
          ...prev,
          [sessionId]: {
            ...prev[sessionId],
            success: false
          }
        }));
      }, 3000);
      
    } catch (err) {
      console.error('Error uploading files:', err);
      setUploadState(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          error: err.message || 'Failed to upload files',
          uploading: false
        }
      }));
    }
  };

  // Clear selected files for a session
  const clearFiles = (sessionId) => {
    setUploadState(prev => ({
      ...prev,
      [sessionId]: {
        files: null,
        error: null,
        uploading: false,
        success: false
      }
    }));
  };

  // Helper to get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (fileType.includes('word')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    } else if (fileType.includes('sheet')) {
      return <FileText className="w-4 h-4 text-green-500" />;
    } else if (fileType.includes('presentation')) {
      return <FileText className="w-4 h-4 text-orange-500" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">You don't have any assigned sessions yet.</p>
          <p className="text-gray-500 text-sm">
            Event organizers will assign sessions to you when they create events.
          </p>
        </div>
      ) : (
        sessions.map(session => (
          <div key={session._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Session header */}
            <div className="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
              <div>
                <h3 className="font-medium text-blue-800">{session.title}</h3>
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(session.startTime)} • {formatTime(session.startTime)}
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {session.eventTitle}
              </span>
            </div>
            
            {/* Upload section */}
            <div className="p-4 border-b">
              <h4 className="font-medium text-gray-700 mb-3">Upload Materials</h4>
              
              {/* Upload status messages */}
              {uploadState[session._id]?.error && (
                <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{uploadState[session._id].error}</p>
                </div>
              )}
              
              {uploadState[session._id]?.success && (
                <div className="mb-3 p-2 bg-green-50 text-green-700 text-sm rounded flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Materials uploaded successfully!</p>
                </div>
              )}
              
              {/* File selection display */}
              {uploadState[session._id]?.files && uploadState[session._id].files.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm text-gray-700 mb-2">Selected files:</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded">
                    {uploadState[session._id].files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <span className="ml-2 truncate max-w-xs">{file.name}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleUpload(session._id, session.eventId)}
                      disabled={uploadState[session._id]?.uploading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {uploadState[session._id]?.uploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => clearFiles(session._id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              
              {/* File input */}
              {(!uploadState[session._id]?.files || uploadState[session._id]?.files.length === 0) && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-xs text-gray-500 mb-3">Supported formats: PDF, DOCX, XLSX, PPT (Max 10MB per file)</p>
                  
                  <label className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">
                    Select Files
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect(e, session._id)}
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.ppt,.pptx"
                    />
                  </label>
                </div>
              )}
            </div>
            
            {/* Previously uploaded materials */}
            <div className="p-4">
              <h4 className="font-medium text-gray-700 mb-3">Uploaded Materials</h4>
              
              {!uploadedMaterials[session._id] || uploadedMaterials[session._id].length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No materials have been uploaded for this session yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {uploadedMaterials[session._id].map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        {getFileIcon(material.fileType)}
                        <span className="ml-2 text-sm font-medium">{material.title || material.fileName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(material.fileSize)} • {new Date(material.uploadDate).toLocaleDateString()}
                        </span>
                        
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SessionMaterials;