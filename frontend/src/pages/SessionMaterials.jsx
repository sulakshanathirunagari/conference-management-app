import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, FilePlus, Check, AlertCircle, Trash2 } from 'lucide-react';

const SessionMaterials = ({ currentUser, sessions }) => {
  // State management
  const [uploadSession, setUploadSession] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [sessionMaterials, setSessionMaterials] = useState({});
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);

  // Set first session as default when component mounts
  useEffect(() => {
    if (sessions && sessions.length > 0 && !uploadSession) {
      setUploadSession(sessions[0]);
    }
  }, [sessions, uploadSession]);

  // Fetch materials when upload session changes
  useEffect(() => {
    if (uploadSession) {
      fetchSessionMaterials(uploadSession._id, uploadSession.eventId);
    }
  }, [uploadSession]);

  // Function to fetch session materials
  const fetchSessionMaterials = async (sessionId, eventId) => {
    if (!sessionId || !eventId) return;
    
    try {
      setMaterialsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/sessions/${sessionId}/materials`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session materials');
      }
      
      const data = await response.json();
      
      // Store the materials in the sessionMaterials state object
      setSessionMaterials(prev => ({
        ...prev,
        [sessionId]: data.data || []
      }));
      
    } catch (err) {
      console.error('Error fetching session materials:', err);
      // Don't show error, just set empty materials
      setSessionMaterials(prev => ({
        ...prev,
        [sessionId]: []
      }));
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Function to handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  // Function to remove a file from the upload list
  const removeFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Function to submit the file upload
  const submitFileUpload = async () => {
    if (!uploadSession || uploadFiles.length === 0) {
      return;
    }
    
    try {
      setUploadLoading(true);
      setUploadError('');
      
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('sessionId', uploadSession._id);
      formData.append('eventId', uploadSession.eventId);
      
      const response = await fetch('http://localhost:5000/api/upload/materials', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload materials');
      }
      
      // Clear the upload files and show success message
      setUploadFiles([]);
      setUploadSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
      // Refresh the materials list
      fetchSessionMaterials(uploadSession._id, uploadSession.eventId);
      
    } catch (err) {
      console.error('Error uploading materials:', err);
      setUploadError(err.message || 'Failed to upload materials. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Function to delete a material
  const deleteMaterial = async (materialId, sessionId, eventId) => {
    if (!sessionId || !eventId || !materialId) return;
    
    try {
      setDeletingMaterial(materialId);
      
      // In a real implementation, you would have an API endpoint to delete materials
      // For example:
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/sessions/${sessionId}/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete material');
      }
      
      // After successful deletion, remove the material from the state
      setSessionMaterials(prev => ({
        ...prev,
        [sessionId]: prev[sessionId].filter(m => m._id !== materialId)
      }));
      
    } catch (err) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material. Please try again.');
    } finally {
      setDeletingMaterial(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    } else if (fileType?.includes('spreadsheet') || fileType?.includes('excel') || fileType?.includes('sheet')) {
      return <FileText className="w-5 h-5 text-green-500" />;
    } else if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) {
      return <FileText className="w-5 h-5 text-orange-500" />;
    } else if (fileType?.includes('zip') || fileType?.includes('compressed')) {
      return <FileText className="w-5 h-5 text-purple-500" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Session selector sidebar */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-purple-50 border-b">
            <h3 className="font-medium text-gray-800">Your Sessions</h3>
            <p className="text-xs text-gray-500 mt-1">Select a session to manage materials</p>
          </div>
          
          {sessions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No sessions found</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[70vh]">
              {sessions.map(session => (
                <button
                  key={session._id}
                  onClick={() => setUploadSession(session)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                    uploadSession?._id === session._id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                  }`}
                >
                  <h4 className="font-medium text-gray-800 line-clamp-1">{session.title}</h4>
                  <p className="text-xs text-gray-500">{formatDate(session.startTime)}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{session.eventTitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Materials management content */}
      <div className="md:col-span-3">
        {!uploadSession ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Session</h3>
            <p className="text-gray-500">
              Choose a session from the sidebar to manage your presentation materials
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upload section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-purple-50 border-b">
                <h3 className="font-medium text-lg text-gray-800">{uploadSession.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(uploadSession.startTime)} • {uploadSession.eventTitle}
                </p>
              </div>
              
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Upload Session Materials</h4>
                
                {/* Success/error messages */}
                {uploadSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Materials uploaded successfully!
                  </div>
                )}
                
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {uploadError}
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-3">
                    Upload presentation slides, handouts, code samples, or other materials for attendees.
                    Supported file types: PDF, DOCX, XLSX, PPTX, ZIP.
                  </p>
                  
                  {/* File input */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 bg-white">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.pptx,.zip,.doc,.xls,.ppt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                    >
                      Select Files
                    </label>
                  </div>
                  
                  {/* Selected files */}
                  {uploadFiles.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Selected Files:</h5>
                      <ul className="space-y-2">
                        {uploadFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex items-center">
                              {file.type.includes('pdf') ? (
                                <FileText className="w-5 h-5 text-red-500 mr-2" />
                              ) : file.type.includes('word') ? (
                                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                              ) : file.type.includes('sheet') || file.type.includes('excel') ? (
                                <FileText className="w-5 h-5 text-green-500 mr-2" />
                              ) : file.type.includes('presentation') ? (
                                <FileText className="w-5 h-5 text-orange-500 mr-2" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-500 mr-2" />
                              )}
                              <span className="text-sm truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={submitFileUpload}
                          disabled={uploadLoading}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                        >
                          {uploadLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FilePlus className="w-4 h-4 mr-2" />
                              Upload Materials
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Materials list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-purple-50 border-b">
                <h3 className="font-medium text-gray-800">Current Session Materials</h3>
              </div>
              
              <div className="p-6">
                {/* Loading state */}
                {materialsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : !sessionMaterials[uploadSession._id] || sessionMaterials[uploadSession._id].length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No materials uploaded yet</p>
                    <p className="text-gray-500 text-sm">
                      Upload files above to share with session attendees
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sessionMaterials[uploadSession._id].map((material) => (
                          <tr key={material._id || material.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {getFileIcon(material.fileType)}
                                <span className="ml-2 text-sm text-gray-900">{material.fileName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {material.fileType?.split('/')[1]?.toUpperCase() || 'File'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {typeof material.fileSize === 'number' 
                                ? formatFileSize(material.fileSize) 
                                : material.fileSize}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(material.uploadDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <a 
                                  href={material.fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  View
                                </a>
                                <button
                                  onClick={() => deleteMaterial(
                                    material._id || material.id, 
                                    uploadSession._id, 
                                    uploadSession.eventId
                                  )}
                                  disabled={deletingMaterial === (material._id || material.id)}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  {deletingMaterial === (material._id || material.id) ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                                  ) : (
                                    <Trash2 className="w-3 h-3 mr-1" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionMaterials;