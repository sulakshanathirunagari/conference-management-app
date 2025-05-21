import React, { useState, useEffect } from 'react';
import { Calendar, Upload, Bell, MessageSquare, User, LogOut, Search, Filter, ChevronDown, X, Send, Star, FileText, Check, AlertCircle, FilePlus, Trash2 } from 'lucide-react';
import SpeakerProfile from '../components/profile/SpeakerProfile';
import FeedbackView from '../components/events/feedback/FeedbackView';
import SessionMaterials from './SessionMaterials';

const SpeakerDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  // Q&A state
  const [activeQASession, setActiveQASession] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [qaLoading, setQALoading] = useState(false);
  const [qaError, setQAError] = useState('');
  const [answerSuccess, setAnswerSuccess] = useState(null);
  
  // Materials upload state
  const [uploadSession, setUploadSession] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [sessionMaterials, setSessionMaterials] = useState({});
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);
  
  // Fetch current user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        setCurrentUser(data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch speaker sessions once we have the user data
  useEffect(() => {
    if (currentUser) {
      fetchSpeakerSessions();
    }
  }, [currentUser]);
  
  // Function to fetch sessions assigned to this speaker
  const fetchSpeakerSessions = async () => {
    try {
      setLoading(true);
      
      // Using the my/events endpoint with speaker role filter
      const response = await fetch('http://localhost:5000/api/events/my/events?role=speaker', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch speaker sessions');
      }
      
      const data = await response.json();
      
      // Extract all sessions where this speaker is assigned
      let speakerSessions = [];
      
      data.data.forEach(event => {
        if (event.sessions && event.sessions.length > 0) {
          const filteredSessions = event.sessions.filter(session => 
            session.speaker && 
            (typeof session.speaker === 'object' 
              ? session.speaker._id === currentUser._id
              : session.speaker === currentUser._id)
          );
          
          // Add event details to each session
          filteredSessions.forEach(session => {
            speakerSessions.push({
              ...session,
              eventTitle: event.title,
              eventLocation: event.location,
              eventId: event._id,
              eventDescription: event.description,
              eventStartDate: event.startDate,
              eventEndDate: event.endDate,
              eventOrganizer: event.organizer,
              eventStatus: event.status
            });
          });
        }
      });
      
      // Sort by start time
      speakerSessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      setSessions(speakerSessions);
      
      // If we just loaded sessions and the chats tab is active, set the first session as active
      if (activeTab === 'chats' && speakerSessions.length > 0 && !activeQASession) {
        setActiveQASession(speakerSessions[0]);
      }
      
      // If we're in the uploads tab, set the first session by default
      if (activeTab === 'uploads' && speakerSessions.length > 0 && !uploadSession) {
        setUploadSession(speakerSessions[0]);
        fetchSessionMaterials(speakerSessions[0]._id, speakerSessions[0].eventId);
      }
    } catch (err) {
      console.error('Error fetching speaker sessions:', err);
      setError('Failed to load your assigned sessions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when tab changes
  useEffect(() => {
    if (activeTab === 'notifications' && currentUser) {
      fetchNotifications();
    } else if (activeTab === 'chats' && !activeQASession && sessions.length > 0) {
      // When switching to chats tab, set the first session as active if none is selected
      setActiveQASession(sessions[0]);
    }
  }, [activeTab, currentUser, sessions]);

  // Fetch questions when active session changes
  useEffect(() => {
    if (activeTab === 'chats' && activeQASession) {
      fetchSessionQuestions(activeQASession._id);
    }
  }, [activeQASession]);

  // Fetch materials when upload session changes
  useEffect(() => {
    if (activeTab === 'uploads' && uploadSession) {
      fetchSessionMaterials(uploadSession._id, uploadSession.eventId);
    }
  }, [uploadSession, activeTab]);

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
      
      // In a real app, you would have an API endpoint to delete materials
      // For now, we'll simulate the deletion with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful deletion, remove the material from the state
      setSessionMaterials(prev => ({
        ...prev,
        [sessionId]: prev[sessionId].filter(m => m.id !== materialId)
      }));
      
    } catch (err) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material. Please try again.');
    } finally {
      setDeletingMaterial(null);
    }
  };

  // Function to fetch questions for the active session
  const fetchSessionQuestions = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      setQALoading(true);
      setQAError('');
      
      // Fetch questions from our API
      const response = await fetch(`http://localhost:5000/api/questions/session/${sessionId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session questions');
      }
      
      const data = await response.json();
      
      // Sort questions by creation time (most recent first)
      const sortedQuestions = data.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setSessionQuestions(sortedQuestions);
      
    } catch (err) {
      console.error('Error fetching session questions:', err);
      setQAError('Failed to load questions. Please try again.');
    } finally {
      setQALoading(false);
    }
  };

  // Function to submit an answer to a question
  const submitAnswer = async (questionId) => {
    if (!questionAnswers[questionId]?.trim() || !currentUser) {
      return;
    }
    
    try {
      setQALoading(true);
      
      // Submit the answer to our API
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: questionAnswers[questionId]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      
      // Update the question with the answer in our local state
      setSessionQuestions(prev => 
        prev.map(question => 
          question._id === questionId ? data.data : question
        )
      );
      
      // Clear the answer input
      setQuestionAnswers(prev => ({ ...prev, [questionId]: '' }));
      
      // Show success message
      setAnswerSuccess(`Answer submitted successfully!`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setAnswerSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting answer:', err);
      setQAError('Failed to submit answer. Please try again.');
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setQAError('');
      }, 3000);
    } finally {
      setQALoading(false);
    }
  };

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError('');
      
      const response = await fetch('http://localhost:5000/api/notifications/my', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationsError('Failed to load notifications. Please try again.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state to reflect the change
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId
            ? {
                ...notification,
                isRead: {
                  ...notification.isRead,
                  [currentUser._id]: true
                }
              }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle profile update
  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
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
  
  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Calculate session duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    return Math.round(durationMs / (1000 * 60));
  };
  
  // View session details
  const viewSessionDetails = (session) => {
    setSelectedSession(session);
    setShowDetails(true);
  };
  
  // Close details view
  const closeDetails = () => {
    setSelectedSession(null);
    setShowDetails(false);
  };
  
  // Filter sessions based on search term and filter value
  const getFilteredSessions = () => {
    return sessions.filter(session => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Time filter
      const sessionDate = new Date(session.startTime);
      const today = new Date();
      const isPast = sessionDate < today;
      const isToday = sessionDate.toDateString() === today.toDateString();
      const isUpcoming = sessionDate > today && !isToday;
      
      if (filterValue === 'all') return matchesSearch;
      if (filterValue === 'upcoming') return matchesSearch && isUpcoming;
      if (filterValue === 'today') return matchesSearch && isToday;
      if (filterValue === 'past') return matchesSearch && isPast;
      
      return matchesSearch;
    });
  };
  
  // Handle answer text change
  const handleAnswerChange = (questionId, text) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };
  
  // Get pending questions count
  const getPendingQuestionsCount = () => {
    return sessionQuestions.filter(q => q.status === "pending").length;
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
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get filtered and sorted sessions
  const filteredSessions = getFilteredSessions();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-700 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Conference Hub</h1>
          <p className="text-blue-200 text-sm">Speaker Panel</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-3 bg-blue-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                {currentUser ? (
                  <span className="font-medium">
                    {currentUser.fullName?.charAt(0) || 'S'}
                  </span>
                ) : (
                  <span className="font-medium">S</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {currentUser?.fullName || 'Speaker'}
                </p>
                <p className="text-xs text-blue-200">
                  {currentUser?.email || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
          
          <ul className="mt-6 space-y-1 px-2">
            <li>
              <button 
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center w-full px-4 py-2.5 text-blue-100 ${
                  activeTab === 'sessions' ? 'bg-blue-800' : 'hover:bg-blue-600'
                } rounded-lg group`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>My Sessions</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('uploads')}
                className={`flex items-center w-full px-4 py-2.5 text-blue-100 ${
                  activeTab === 'uploads' ? 'bg-blue-800' : 'hover:bg-blue-600'
                } rounded-lg group`}
              >
                <Upload className="w-5 h-5 mr-3" />
                <span>Materials</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-4 py-2.5 text-blue-100 ${
                  activeTab === 'notifications' ? 'bg-blue-800' : 'hover:bg-blue-600'
                } rounded-lg group`}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('chats')}
                className={`flex items-center w-full px-4 py-2.5 text-blue-100 ${
                  activeTab === 'chats' ? 'bg-blue-800' : 'hover:bg-blue-600'
                } rounded-lg group relative`}
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                <span>Q&A</span>
                
                {/* Badge for pending questions count */}
                {activeTab === 'chats' && getPendingQuestionsCount() > 0 && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {getPendingQuestionsCount()}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center w-full px-4 py-2.5 text-blue-100 ${
                  activeTab === 'feedback' ? 'bg-blue-800' : 'hover:bg-blue-600'
                } rounded-lg group`}
              >
                <Star className="w-5 h-5 mr-3" />
                <span>Feedback</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-4 py-2.5 text-blue-100 ${
                  activeTab === 'profile' ? 'bg-blue-800' : 'hover:bg-blue-600'
                } rounded-lg group`}
              >
                <User className="w-5 h-5 mr-3" />
                <span>My Profile</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-blue-100 hover:bg-blue-600 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'sessions' && 'My Sessions'}
              {activeTab === 'uploads' && 'Session Materials'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'chats' && 'Attendee Questions & Answers'}
              {activeTab === 'feedback' && 'Session Feedback'}
              {activeTab === 'profile' && 'My Profile'}
            </h2>
          </div>
        </header>
        
        <main className="p-6">
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Session Details Modal */}
          {showDetails && selectedSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{selectedSession.title}</h3>
                    <button 
                      onClick={closeDetails}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg text-blue-800 mb-2">Session Details</h4>
                    <p className="text-gray-700 mb-3">{selectedSession.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Date & Time</p>
                          <p className="text-gray-600">
                            {formatDate(selectedSession.startTime)}
                            <br />
                            {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Duration</p>
                          <p className="text-gray-600">
                            {calculateDuration(selectedSession.startTime, selectedSession.endTime)} minutes
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-gray-600">{selectedSession.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Capacity</p>
                          <p className="text-gray-600">
                            {selectedSession.capacity > 0 ? selectedSession.capacity : 'Unlimited'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg text-indigo-800 mb-2">Event Details</h4>
                    <h5 className="text-lg font-medium mb-2">{selectedSession.eventTitle}</h5>
                    <p className="text-gray-700 mb-3">{selectedSession.eventDescription}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Event Dates</p>
                          <p className="text-gray-600">
                            {formatDate(selectedSession.eventStartDate)} - {formatDate(selectedSession.eventEndDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Event Location</p>
                          <p className="text-gray-600">{selectedSession.eventLocation}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" />
                        <div>
                          <p className="font-medium">Event Status</p>
                          <p className="text-gray-600">
                            {selectedSession.eventStatus.charAt(0).toUpperCase() + selectedSession.eventStatus.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setActiveTab('uploads');
                        setUploadSession(selectedSession);
                        closeDetails();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Manage Materials
                    </button>
                    <button
                      onClick={closeDetails}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* My Sessions Tab */}
          {activeTab === 'sessions' && !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Upcoming Sessions</h3>
                  <p className="text-3xl font-bold mt-2">
                    {sessions.filter(session => new Date(session.startTime) > new Date()).length}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Total Events</h3>
                  <p className="text-3xl font-bold mt-2">
                    {new Set(sessions.map(session => session.eventId)).size}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-700">Total Audience</h3>
                  <p className="text-3xl font-bold mt-2">
                    {sessions.reduce((total, session) => total + (session.capacity || 0), 0)}+
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-700">My Sessions</h3>
                  
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    {/* Search input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search sessions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    
                    {/* Filter dropdown */}
                    <div className="relative">
                      <select 
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none w-full"
                      >
                        <option value="all">All Sessions</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="today">Today</option>
                        <option value="past">Past</option>
                      </select>
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">You don't have any assigned sessions yet.</p>
                    <p className="text-gray-500 text-sm">
                      Event organizers will assign sessions to you when they create events.
                    </p>
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">No sessions match your search criteria.</p>
                    <p className="text-gray-500 text-sm">
                      Try adjusting your search or filter settings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => (
                      <div key={session._id} className="border rounded-lg overflow-hidden">
                        <div className="bg-yellow-50 px-4 py-2 border-b flex justify-between items-center">
                          <span className="text-yellow-700 text-sm font-medium">
                            {formatDate(session.startTime)} • {formatTime(session.startTime)}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {session.eventTitle}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-lg">{session.title}</h4>
                          <p className="text-gray-600 mt-1">
                            {session.location}, {session.eventLocation}
                          </p>
                          <p className="text-gray-600 mt-2">
                            Duration: {calculateDuration(session.startTime, session.endTime)} minutes
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button 
                              onClick={() => viewSessionDetails(session)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                            >
                              View Details
                            </button>
                            
                            <button 
                              onClick={() => {
                                setActiveTab('uploads');
                                setUploadSession(session);
                              }}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm flex items-center"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Manage Materials
                            </button>
                            
                            <button 
                              onClick={() => {
                                setActiveTab('chats');
                                setActiveQASession(session);
                              }}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm flex items-center"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              View Q&A
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Materials/Uploads Tab */}
          {activeTab === 'uploads' && !loading && (
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
                                      {material.fileSize}
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
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && !loading && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">Notifications</h3>
              
              {/* Loading state for notifications */}
              {notificationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : notificationsError ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
                  {notificationsError}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">You don't have any notifications yet.</p>
                  <p className="text-gray-500 text-sm">
                    Event organizers will send notifications about your sessions and events here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div 
                      key={notification._id} 
                      className={`border rounded-lg overflow-hidden ${
                        notification.isRead[currentUser?._id] ? 'opacity-75' : 'border-l-4 border-l-blue-500'
                      }`}
                    >
                      <div className={`px-4 py-3 border-b flex justify-between items-center
                        ${notification.type === 'info' ? 'bg-blue-50' : ''}
                        ${notification.type === 'update' ? 'bg-green-50' : ''}
                        ${notification.type === 'warning' ? 'bg-yellow-50' : ''}
                        ${notification.type === 'urgent' ? 'bg-red-50' : ''}
                      `}>
                        <span className={`text-sm font-medium
                          ${notification.type === 'info' ? 'text-blue-700' : ''}
                          ${notification.type === 'update' ? 'text-green-700' : ''}
                          ${notification.type === 'warning' ? 'text-yellow-700' : ''}
                          ${notification.type === 'urgent' ? 'text-red-700' : ''}
                        `}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-lg">{notification.title}</h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            From: {notification.sender?.fullName || 'Event Organizer'}
                          </span>
                          {!notification.isRead[currentUser?._id] && (
                            <button 
                              onClick={() => markAsRead(notification._id)}
                              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Chats & Q&A Tab */}
          {activeTab === 'chats' && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Session selector sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-3 bg-blue-50 border-b">
                    <h3 className="font-medium text-gray-800">Your Sessions</h3>
                    <p className="text-xs text-gray-500 mt-1">Select a session to manage Q&A</p>
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
                          onClick={() => setActiveQASession(session)}
                          className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                            activeQASession?._id === session._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
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
              
              {/* Q&A main content */}
              <div className="md:col-span-3">
                {!activeQASession ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Session</h3>
                    <p className="text-gray-500">
                      Choose a session from the sidebar to view and answer attendee questions
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Session header */}
                    <div className="px-6 py-4 bg-blue-50 border-b">
                      <h3 className="font-medium text-lg text-gray-800">{activeQASession.title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(activeQASession.startTime)} • {formatTime(activeQASession.startTime)} - {formatTime(activeQASession.endTime)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {activeQASession.eventTitle} • {activeQASession.location}
                      </p>
                    </div>
                    
                    {/* Questions container */}
                    <div className="p-6">
                      {/* Success/error messages */}
                      {answerSuccess && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
                          {answerSuccess}
                        </div>
                      )}
                      
                      {qaError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                          {qaError}
                        </div>
                      )}
                      
                      {/* Section header */}
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-800">
                          Attendee Questions
                          {getPendingQuestionsCount() > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {getPendingQuestionsCount()} pending
                            </span>
                          )}
                        </h4>
                        
                        <button 
                          onClick={() => fetchSessionQuestions(activeQASession._id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                        >
                          Refresh
                        </button>
                      </div>
                      
                      {/* Loading state */}
                      {qaLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : sessionQuestions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">No questions from attendees yet</p>
                          <p className="text-gray-500 text-sm">
                            Questions will appear here when attendee submit them
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Pending questions section */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-blue-800 pb-2 border-b border-blue-100">
                              Questions Waiting for Answers
                            </h5>
                            
                            {sessionQuestions.filter(q => q.status === "pending").length === 0 ? (
                              <div className="text-center py-6 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">No pending questions</p>
                                <p className="text-sm text-gray-500 mt-1">All questions have been answered!</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {sessionQuestions
                                  .filter(q => q.status === "pending")
                                  .map(question => (
                                    <div key={question._id} className="border rounded-lg overflow-hidden">
                                      {/* Question header */}
                                      <div className="bg-blue-50 px-4 py-3 border-b">
                                        <div className="flex justify-between">
                                          <div>
                                            <span className="font-medium text-sm">{question.askedBy.fullName}</span>
                                            <span className="mx-2 text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(question.createdAt).toLocaleString()}
                                            </span>
                                          </div>
                                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                            Pending
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Question and answer section */}
                                      <div className="p-4">
                                        <p className="text-gray-800 mb-4">{question.text}</p>
                                        
                                        {/* Answer form */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <label className="block font-medium text-sm text-gray-700 mb-2">
                                            Your Answer
                                          </label>
                                          <textarea
                                            value={questionAnswers[question._id] || ''}
                                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                            placeholder="Type your answer here..."
                                          />
                                          
                                          <div className="mt-2 flex justify-end">
                                            <button
                                              onClick={() => submitAnswer(question._id)}
                                              disabled={!questionAnswers[question._id]?.trim() || qaLoading}
                                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                                            >
                                              <Send className="w-4 h-4 mr-2" />
                                              Submit Answer
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Answered questions section */}
                          {sessionQuestions.filter(q => q.status === "answered").length > 0 && (
                            <div className="space-y-4 pt-4">
                              <h5 className="font-medium text-green-800 pb-2 border-b border-green-100">
                                Answered Questions
                              </h5>
                              
                              <div className="space-y-6">
                                {sessionQuestions
                                  .filter(q => q.status === "answered")
                                  .map(question => (
                                    <div key={question._id} className="border rounded-lg overflow-hidden">
                                      {/* Question header */}
                                      <div className="bg-gray-50 px-4 py-3 border-b">
                                        <div className="flex justify-between">
                                          <div>
                                            <span className="font-medium text-sm">{question.askedBy.fullName}</span>
                                            <span className="mx-2 text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(question.createdAt).toLocaleString()}
                                            </span>
                                          </div>
                                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                            Answered
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Question and answer display */}
                                      <div className="p-4">
                                        <p className="text-gray-800 mb-4">{question.text}</p>
                                        
                                        {/* Answer display */}
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center">
                                              <span className="font-medium text-sm text-blue-800">
                                                {question.answer.answeredBy.fullName}
                                              </span>
                                              <span className="mx-2 text-gray-500">•</span>
                                              <span className="text-xs text-gray-500">
                                                {new Date(question.answer.answeredAt).toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                          <p className="text-gray-800">{question.answer.text}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Feedback Tab */}
          {activeTab === 'feedback' && !loading && (
            <FeedbackView currentUser={currentUser} />
          )}
          
          {/* Profile Tab - Using the separate SpeakerProfile component */}
          {activeTab === 'profile' && !loading && (
            <SpeakerProfile 
              currentUser={currentUser}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
          
          {/* Uploads Tab - Using the SessionMaterials component */}
          {activeTab === 'uploads' && !loading && (
            <SessionMaterials 
              currentUser={currentUser}
              sessions={sessions}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default SpeakerDashboard;