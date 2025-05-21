// import React, { useState, useEffect } from 'react';
// import { Calendar, User, Bell, MessageSquare, Ticket, Star, FileText, ChevronDown, MapPin, Clock, Tag, Users, Search, Filter, LogOut, Mail, Download, Eye, ChevronLeft } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import ProfilePage from '../components/profile/ProfilePage';
// import NotificationPanel from '../components/notifications/NotificationPanel';
// import MyTickets from '../components/tickets/MyTickets';
// import FeedbackForm from '../components/events/feedback/FeedbackForm';

// const AttendeeDashboard = () => {
//   // Navigation and user state
//   const [activeTab, setActiveTab] = useState('events');
//   const [currentUser, setCurrentUser] = useState(null);
//   const navigate = useNavigate();
  
//   // Events state
//   const [events, setEvents] = useState([]);
//   const [featuredEvents, setFeaturedEvents] = useState([]);
//   const [upcomingEvents, setUpcomingEvents] = useState([]);
//   const [registeredEvents, setRegisteredEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterValue, setFilterValue] = useState('all');
  
//   // Notifications state
//   const [notifications, setNotifications] = useState([]);
//   const [notificationsLoading, setNotificationsLoading] = useState(false);
//   const [notificationsError, setNotificationsError] = useState('');
  
//   // Speakers directory state
//   const [speakers, setSpeakers] = useState([]);
//   const [filteredSpeakers, setFilteredSpeakers] = useState([]);
//   const [speakerSearch, setSpeakerSearch] = useState('');
//   const [speakersLoading, setSpeakersLoading] = useState(false);
//   const [speakersError, setSpeakersError] = useState('');
  
//   // Event details view state
//   const [showEventDetails, setShowEventDetails] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [selectedEventTab, setSelectedEventTab] = useState('overview');
//   const [sessionMaterials, setSessionMaterials] = useState([]);
//   const [materialsLoading, setMaterialsLoading] = useState(false);
  
//   // Live Q&A feature state
//   const [userSessions, setUserSessions] = useState([]);
//   const [selectedQASession, setSelectedQASession] = useState(null);
//   const [sessionQuestions, setSessionQuestions] = useState([]);
//   const [newQuestion, setNewQuestion] = useState('');
//   const [questionsLoading, setQuestionsLoading] = useState(false);
//   const [questionsError, setQuestionsError] = useState('');

//   // Feedback state
//   const [submittedFeedback, setSubmittedFeedback] = useState([]);
//   const [feedbackLoading, setFeedbackLoading] = useState(false);
//   const [feedbackError, setFeedbackError] = useState('');
  
//   // ===== EFFECT HOOKS =====

//   // Fetch current user data
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/auth/me', {
//           credentials: 'include'
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch user profile');
//         }
        
//         const data = await response.json();
//         setCurrentUser(data.user);
//       } catch (err) {
//         console.error('Error fetching user data:', err);
//         setError('Failed to load user profile');
//       }
//     };
    
//     fetchUserData();
//   }, []);

//   // Fetch events data based on active tab
//   useEffect(() => {
//     if (activeTab === 'events' || activeTab === 'registered') {
//       fetchEvents();
//     }
//   }, [activeTab]);

//   // Fetch available speakers when speakers tab is active
//   useEffect(() => {
//     if (activeTab === 'speakers') {
//       fetchSpeakers();
//     }
//   }, [activeTab]);

//   // Fetch notifications when in notifications tab
//   useEffect(() => {
//     if (activeTab === 'notifications' && currentUser) {
//       fetchNotifications();
//     }
//   }, [activeTab, currentUser]);

//   // Fetch session materials when an event is selected
//   useEffect(() => {
//     if (selectedEvent && selectedEventTab === 'materials') {
//       fetchSessionMaterials();
//     }
//   }, [selectedEvent, selectedEventTab]);

//   // Fetch user's sessions for Q&A
//   useEffect(() => {
//     if (activeTab === 'liveqa' && currentUser) {
//       fetchUserSessions();
//     }
//   }, [activeTab, currentUser]);

//   // Fetch questions when a session is selected for Q&A
//   useEffect(() => {
//     if (selectedQASession) {
//       fetchSessionQuestions(selectedQASession._id);
//     }
//   }, [selectedQASession]);

//   // Fetch submitted feedback when feedback tab is active
//   useEffect(() => {
//     if (activeTab === 'feedback' && currentUser) {
//       fetchSubmittedFeedback();
//     }
//   }, [activeTab, currentUser]);

//   // ===== DATA FETCHING FUNCTIONS =====

//   // Fetch events
//   const fetchEvents = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       if (activeTab === 'events') {
//         // Fetch all published events
//         const response = await fetch('http://localhost:5000/api/events?status=published', {
//           credentials: 'include'
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch events');
//         }
        
//         const data = await response.json();
//         setEvents(data.data || []);
        
//         // Filter for featured events (could be based on tags, popularity, etc.)
//         setFeaturedEvents(data.data?.filter(event => 
//           new Date(event.startDate) > new Date() && 
//           (event.tags?.includes('featured') || Math.random() > 0.7) // Random selection for demo
//         ).slice(0, 3) || []);
        
//         // Filter for upcoming events
//         setUpcomingEvents(data.data?.filter(event => 
//           new Date(event.startDate) > new Date()
//         ).slice(0, 6) || []);
//       } else if (activeTab === 'registered') {
//         // Fetch events the attendee is registered for
//         const response = await fetch('http://localhost:5000/api/events/my/events?role=attendee', {
//           credentials: 'include'
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch registered events');
//         }
        
//         const data = await response.json();
//         setRegisteredEvents(data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching events:', err);
//       setError('Failed to load events. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch available speakers
//   const fetchSpeakers = async () => {
//     try {
//       setSpeakersLoading(true);
//       setSpeakersError('');
      
//       const response = await fetch('http://localhost:5000/api/users/speakers/available', {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch speakers');
//       }
      
//       const data = await response.json();
//       setSpeakers(data.data || []);
//       setFilteredSpeakers(data.data || []);
      
//     } catch (err) {
//       console.error('Error fetching speakers:', err);
//       setSpeakersError('Failed to load speakers. Please try again later.');
//     } finally {
//       setSpeakersLoading(false);
//     }
//   };

//   // Fetch event details
//   const fetchEventDetails = async (eventId) => {
//     try {
//       setLoading(true);
      
//       // Since we already have the event data from the events list,
//       // let's use that directly to avoid an additional API call
//       const existingEvent = [...events, ...registeredEvents].find(e => e._id === eventId);
      
//       if (existingEvent) {
//         // If we have basic event data but need to enrich it with sessions info
//         if (!existingEvent.sessions || existingEvent.sessions.length === 0) {
//           try {
//             // Try to fetch the full event details with sessions
//             const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
//               credentials: 'include'
//             });
            
//             if (response.ok) {
//               const data = await response.json();
//               setSelectedEvent(data.data);
//               return;
//             }
//           } catch (err) {
//             console.error('Error fetching additional event details:', err);
//             // Continue with existing data if fetch fails
//           }
//         }
        
//         // Ensure the sessions data has the right speaker information
//         if (existingEvent.sessions) {
//           existingEvent.sessions = existingEvent.sessions.map(session => {
//             if (session.speaker && typeof session.speaker === 'object') {
//               return session;
//             } else if (session.speaker) {
//               // Try to find the speaker details from the speakers list
//               const speakerDetails = speakers.find(s => s._id === session.speaker);
//               return {
//                 ...session,
//                 speakerName: speakerDetails ? speakerDetails.fullName : "Conference Speaker"
//               };
//             }
//             return session;
//           });
//         }
        
//         setSelectedEvent(existingEvent);
//       } else {
//         // If we don't have the event data, try to fetch it
//         const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
//           credentials: 'include'
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch event details');
//         }
        
//         const data = await response.json();
//         setSelectedEvent(data.data);
//       }
      
//     } catch (err) {
//       console.error('Error fetching event details:', err);
//       setError('Failed to load event details. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     try {
//       setNotificationsLoading(true);
//       setNotificationsError('');
      
//       const response = await fetch('http://localhost:5000/api/notifications/my', {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch notifications');
//       }
      
//       const data = await response.json();
//       setNotifications(data.data || []);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       setNotificationsError('Failed to load notifications. Please try again.');
//     } finally {
//       setNotificationsLoading(false);
//     }
//   };

//   // Fetch session materials
//   const fetchSessionMaterials = async () => {
//     if (!selectedEvent) return;
    
//     try {
//       setMaterialsLoading(true);
      
//       const materials = [];
      
//       // Fetch materials for each session in the event
//       if (selectedEvent.sessions && selectedEvent.sessions.length > 0) {
//         for (const session of selectedEvent.sessions) {
//           try {
//             const response = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/sessions/${session._id}/materials`, {
//               credentials: 'include'
//             });
            
//             if (response.ok) {
//               const data = await response.json();
//               if (data.success && data.data.length > 0) {
//                 // Add session info to each material
//                 const sessionMaterials = data.data.map(material => ({
//                   ...material,
//                   sessionId: session._id,
//                   sessionTitle: session.title
//                 }));
                
//                 materials.push(...sessionMaterials);
//               }
//             }
//           } catch (err) {
//             console.error(`Error fetching materials for session ${session._id}:`, err);
//             // Continue with next session even if one fails
//           }
//         }
//       }
      
//       setSessionMaterials(materials);
      
//     } catch (err) {
//       console.error('Error fetching session materials:', err);
//     } finally {
//       setMaterialsLoading(false);
//     }
//   };

//   // Fetch sessions the user is registered for (for Q&A)
//   const fetchUserSessions = async () => {
//     try {
//       setQuestionsLoading(true);
      
//       // Fetch events the attendee is registered for
//       const response = await fetch('http://localhost:5000/api/events/my/events?role=attendee', {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch registered events');
//       }
      
//       const data = await response.json();
//       const events = data.data || [];
      
//       // Extract all sessions from the events
//       let allSessions = [];
      
//       events.forEach(event => {
//         if (event.sessions && event.sessions.length > 0) {
//           // Add event info to each session for context
//           const eventSessions = event.sessions.map(session => ({
//             ...session,
//             eventTitle: event.title,
//             eventId: event._id
//           }));
          
//           allSessions = [...allSessions, ...eventSessions];
//         }
//       });
      
//       // Sort sessions by date (most recent first)
//       allSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      
//       setUserSessions(allSessions);
      
//       // Set the first session as selected by default
//       if (allSessions.length > 0 && !selectedQASession) {
//         setSelectedQASession(allSessions[0]);
//       }
      
//     } catch (err) {
//       console.error('Error fetching user sessions:', err);
//       setQuestionsError('Failed to load your sessions. Please try again later.');
//     } finally {
//       setQuestionsLoading(false);
//     }
//   };

//   // Fetch questions for a specific session
//   const fetchSessionQuestions = async (sessionId) => {
//     try {
//       setQuestionsLoading(true);
      
//       // Fetch questions from the API
//       const response = await fetch(`http://localhost:5000/api/questions/session/${sessionId}`, {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch session questions');
//       }
      
//       const data = await response.json();
//       setSessionQuestions(data.data || []);
      
//     } catch (err) {
//       console.error('Error fetching session questions:', err);
//       setQuestionsError('Failed to load questions. Please try again.');
//     } finally {
//       setQuestionsLoading(false);
//     }
//   };

//   // Fetch submitted feedback for the current user
//   const fetchSubmittedFeedback = async () => {
//     try {
//       setFeedbackLoading(true);
//       setFeedbackError('');
      
//       // This endpoint would be created to list feedback a user has submitted
//       const response = await fetch(`http://localhost:5000/api/feedback/user`, {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch submitted feedback');
//       }
      
//       const data = await response.json();
//       setSubmittedFeedback(data.data || []);
      
//     } catch (err) {
//       console.error('Error fetching submitted feedback:', err);
//       setFeedbackError('Failed to load your previously submitted feedback.');
//     } finally {
//       setFeedbackLoading(false);
//     }
//   };

//   // ===== HELPER FUNCTIONS =====

//   // Helper to get speaker name from session
//   const getSpeakerName = (session) => {
//     if (!session) return "Session Speaker";
    
//     if (typeof session.speaker === 'object') {
//       return session.speaker?.fullName || "Session Speaker";
//     } else {
//       return session.speakerName || "Session Speaker";
//     }
//   };

//   // Function to handle speaker search
//   const handleSpeakerSearch = (e) => {
//     const searchTerm = e.target.value.toLowerCase();
//     setSpeakerSearch(searchTerm);
    
//     if (!searchTerm) {
//       setFilteredSpeakers(speakers);
//       return;
//     }
    
//     const filtered = speakers.filter(speaker => 
//       speaker.fullName.toLowerCase().includes(searchTerm) || 
//       (speaker.organization && speaker.organization.toLowerCase().includes(searchTerm)) ||
//       (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm))
//     );
    
//     setFilteredSpeakers(filtered);
//   };

//   // Handle search and filtering
//   const getFilteredEvents = () => {
//     const eventsToFilter = activeTab === 'registered' ? registeredEvents : events;
    
//     return eventsToFilter.filter(event => {
//       // Search term filter
//       const matchesSearch = searchTerm === '' || 
//         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
//       // Date filter
//       const eventDate = new Date(event.startDate);
//       const today = new Date();
//       const isPast = eventDate < today;
//       const isToday = eventDate.toDateString() === today.toDateString();
//       const isUpcoming = eventDate > today && !isToday;
      
//       if (filterValue === 'all') return matchesSearch;
//       if (filterValue === 'upcoming') return matchesSearch && isUpcoming;
//       if (filterValue === 'today') return matchesSearch && isToday;
//       if (filterValue === 'past') return matchesSearch && isPast;
      
//       return matchesSearch;
//     });
//   };

//   // Function to mark notification as read
//   const markAsRead = async (notificationId) => {
//     if (!currentUser) return;
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
//         method: 'PUT',
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to mark notification as read');
//       }
      
//       // Update local state to reflect the change
//       setNotifications(prev => 
//         prev.map(notification => 
//           notification._id === notificationId
//             ? {
//                 ...notification,
//                 isRead: {
//                   ...notification.isRead,
//                   [currentUser._id]: true
//                 }
//               }
//             : notification
//         )
//       );
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   // Submit a new question
//   const handleSubmitQuestion = async () => {
//     if (!newQuestion.trim() || !selectedQASession || !currentUser) {
//       return;
//     }
    
//     try {
//       setQuestionsLoading(true);
      
//       const response = await fetch('http://localhost:5000/api/questions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           sessionId: selectedQASession._id,
//           eventId: selectedQASession.eventId,
//           text: newQuestion
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to submit question');
//       }
      
//       const data = await response.json();
      
//       // Add the new question to the list
//       setSessionQuestions(prev => [data.data, ...prev]);
      
//       // Clear the input
//       setNewQuestion('');
      
//     } catch (err) {
//       console.error('Error submitting question:', err);
//       alert('Failed to submit your question. Please try again.');
//     } finally {
//       setQuestionsLoading(false);
//     }
//   };

//   // Handle feedback submission success
//   const handleFeedbackSubmitted = () => {
//     // Refresh the feedback list after new submission
//     fetchSubmittedFeedback();
//   };

//   // ===== EVENT HANDLERS =====

//   // Handle event registration
//   const handleRegisterForEvent = (eventId) => {
//     navigate(`/events/${eventId}/tickets`);
//   };

//   // Handle viewing event details
//   const handleViewEventDetails = (event) => {
//     setSelectedEvent(event);
//     setSelectedEventTab('overview');
//     setShowEventDetails(true);
//   };

//   // Handle back button from event details
//   const handleBackFromDetails = () => {
//     setShowEventDetails(false);
//     setSelectedEvent(null);
//   };

//   // Handle downloading a session material
//   const handleDownloadMaterial = async (material) => {
//     try {
//       // Create a temporary anchor element
//       const link = document.createElement('a');
//       link.href = material.fileUrl;
//       link.download = material.fileName;
      
//       // Append the link to the body, click it, and remove it
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       alert('Failed to download file. Please try again later.');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch('http://localhost:5000/api/auth/logout', {
//         method: 'POST',
//         credentials: 'include',
//       });
      
//       window.location.href = '/login';
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   // Handle profile update
//   const handleProfileUpdate = (updatedUser) => {
//     setCurrentUser(updatedUser);
//   };

//   // ===== FORMAT HELPERS =====

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', { 
//       month: 'short',
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   // Format long date for event details
//   const formatLongDate = (dateString) => {
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };
  
//   // Format time for session display
//   const formatTime = (dateString) => {
//     const options = { hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleTimeString(undefined, options);
//   };

//   // Get status color for event badge
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'published':
//         return 'bg-green-100 text-green-800';
//       case 'draft':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       case 'completed':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Filtered events
//   const filteredEvents = getFilteredEvents();

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-green-700 text-white">
//         <div className="p-6">
//           <h1 className="text-2xl font-bold">Conference Hub</h1>
//           <p className="text-green-200 text-sm">Attendee Portal</p>
//         </div>
        
//         <nav className="mt-6">
//           <div className="px-4 py-3 bg-green-800">
//             <div className="flex items-center">
//               <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
//                 {currentUser ? (
//                   <span className="font-medium">
//                     {currentUser.fullName?.charAt(0) || 'A'}
//                   </span>
//                 ) : (
//                   <span className="font-medium">A</span>
//                 )}
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm font-medium">
//                   {currentUser?.fullName || 'Attendee'}
//                 </p>
//                 <p className="text-xs text-green-200">
//                   {currentUser?.email || 'Loading...'}
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <ul className="mt-6 space-y-1 px-2">
//             <li>
//               <button 
//                 onClick={() => {
//                   setActiveTab('events');
//                   setShowEventDetails(false);
//                 }}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'events' && !showEventDetails ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <Calendar className="w-5 h-5 mr-3" />
//                 <span>Explore Events</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => {
//                   setActiveTab('registered');
//                   setShowEventDetails(false);
//                 }}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'registered' && !showEventDetails ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <Ticket className="w-5 h-5 mr-3" />
//                 <span>My Registrations</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => setActiveTab('speakers')}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'speakers' ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <User className="w-5 h-5 mr-3" />
//                 <span>Speakers</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => setActiveTab('notifications')}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'notifications' ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <Bell className="w-5 h-5 mr-3" />
//                 <span>Notifications</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => setActiveTab('profile')}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'profile' ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <User className="w-5 h-5 mr-3" />
//                 <span>My Profile</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => setActiveTab('liveqa')}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'liveqa' ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <MessageSquare className="w-5 h-5 mr-3" />
//                 <span>Live Q&A</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => setActiveTab('tickets')}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'tickets' ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <Ticket className="w-5 h-5 mr-3" />
//                 <span>My Tickets</span>
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => setActiveTab('feedback')}
//                 className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
//                   activeTab === 'feedback' ? 'bg-green-800' : 'hover:bg-green-600'
//                 } rounded-lg group`}
//               >
//                 <Star className="w-5 h-5 mr-3" />
//                 <span>Feedback</span>
//               </button>
//             </li>
//           </ul>
//         </nav>
        
//         <div className="absolute bottom-0 w-64 p-4">
//           <button 
//             onClick={handleLogout}
//             className="flex items-center w-full px-4 py-2 text-green-100 hover:bg-green-600 rounded-lg"
//           >
//             <LogOut className="w-5 h-5 mr-3" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>
      
//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto">
//         <header className="bg-white shadow-sm">
//           <div className="px-6 py-4 flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-800">
//               {activeTab === 'events' && !showEventDetails && 'Explore Events'}
//               {activeTab === 'registered' && !showEventDetails && 'My Registered Events'}
//               {showEventDetails && selectedEvent && selectedEvent.title}
//               {activeTab === 'speakers' && 'Conference Speakers'}
//               {activeTab === 'notifications' && 'Notifications'}
//               {activeTab === 'profile' && 'My Profile'}
//               {activeTab === 'liveqa' && 'Live Q&A'}
//               {activeTab === 'tickets' && 'My Tickets'}
//               {activeTab === 'feedback' && 'Session Feedback'}
//             </h2>
            
//             {/* Notification panel in header */}
//             <NotificationPanel />
//           </div>
//         </header>
        
//         <main className="p-6">
//           {/* Event Details View */}
//           {showEventDetails && selectedEvent && (
//             <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//               {/* Header with banner image */}
//               <div className="relative h-64 bg-green-100">
//                 {selectedEvent.coverImage ? (
//                   <img
//                     src={selectedEvent.coverImage}
//                     alt={selectedEvent.title}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center">
//                     <Calendar className="w-24 h-24 text-green-300" />
//                   </div>
//                 )}
                
//                 <div className="absolute top-4 left-4">
//                   <button
//                     onClick={handleBackFromDetails}
//                     className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
//                     title="Back to List"
//                   >
//                     <ChevronLeft className="w-5 h-5 text-gray-600" />
//                   </button>
//                 </div>
                
//                 <div className="absolute top-4 right-4">
//                   <span className={`px-3 py-1 bg-white rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
//                     {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
//                   </span>
//                 </div>
//               </div>
              
//               {/* Event title */}
//               <div className="p-6 border-b">
//                 <h1 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h1>
//               </div>
              
//               {/* Tabs */}
//               <div className="border-b">
//                 <nav className="flex">
//                   <button
//                     className={`px-6 py-3 text-sm font-medium border-b-2 ${
//                       selectedEventTab === 'overview' 
//                         ? 'border-green-600 text-green-600' 
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                     onClick={() => setSelectedEventTab('overview')}
//                   >
//                     Overview
//                   </button>
                  
//                   <button
//                     className={`px-6 py-3 text-sm font-medium border-b-2 ${
//                       selectedEventTab === 'sessions' 
//                         ? 'border-green-600 text-green-600' 
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                     onClick={() => setSelectedEventTab('sessions')}
//                   >
//                     Sessions {selectedEvent.sessions && `(${selectedEvent.sessions.length || 0})`}
//                   </button>
                  
//                   <button
//                     className={`px-6 py-3 text-sm font-medium border-b-2 ${
//                       selectedEventTab === 'materials' 
//                         ? 'border-green-600 text-green-600' 
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                     onClick={() => setSelectedEventTab('materials')}
//                   >
//                     Materials
//                   </button>
//                 </nav>
//               </div>
              
//               {/* Tab content */}
//               <div className="p-6">
//                 {/* Overview tab */}
//                 {selectedEventTab === 'overview' && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <div className="flex items-center mb-3">
//                           <Calendar className="w-5 h-5 text-green-600 mr-2" />
//                           <h3 className="text-sm font-medium text-gray-700">Date</h3>
//                         </div>
//                         <p className="text-gray-800">
//                           {formatLongDate(selectedEvent.startDate)}
//                           {selectedEvent.startDate !== selectedEvent.endDate && ` - ${formatLongDate(selectedEvent.endDate)}`}
//                         </p>
//                       </div>
                      
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <div className="flex items-center mb-3">
//                           <MapPin className="w-5 h-5 text-green-600 mr-2" />
//                           <h3 className="text-sm font-medium text-gray-700">Location</h3>
//                         </div>
//                         <p className="text-gray-800">{selectedEvent.location}</p>
//                       </div>
                      
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <div className="flex items-center mb-3">
//                           <Users className="w-5 h-5 text-green-600 mr-2" />
//                           <h3 className="text-sm font-medium text-gray-700">Capacity</h3>
//                         </div>
//                         <p className="text-gray-800">
//                           {selectedEvent.attendees ? selectedEvent.attendees.length : 0} / {selectedEvent.capacity} attendees
//                         </p>
//                         {selectedEvent.attendees && selectedEvent.attendees.length >= selectedEvent.capacity && (
//                           <p className="text-xs text-red-600 mt-1">Fully booked</p>
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Description */}
//                     <div className="border-t pt-4">
//                       <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
//                       <div className="prose text-gray-700 max-w-none">
//                         {selectedEvent.description}
//                       </div>
//                     </div>
                    
//                     {/* Tags */}
//                     {selectedEvent.tags && selectedEvent.tags.length > 0 && (
//                       <div className="border-t pt-4">
//                         <div className="flex items-center mb-3">
//                           <Tag className="w-5 h-5 text-green-600 mr-2" />
//                           <h3 className="text-sm font-medium text-gray-700">Tags</h3>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           {selectedEvent.tags.map((tag, index) => (
//                             <span 
//                               key={index} 
//                               className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
//                             >
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
                
//                 {/* Sessions tab */}
//                 {selectedEventTab === 'sessions' && (
//                   <div>
//                     <h3 className="text-lg font-medium text-gray-800 mb-4">Event Sessions</h3>
                    
//                     {!selectedEvent.sessions || selectedEvent.sessions.length === 0 ? (
//                       <div className="text-center py-8 bg-gray-50 rounded-lg">
//                         <p className="text-gray-600">No sessions have been added to this event yet.</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {selectedEvent.sessions.map((session) => (
//                           <div key={session._id} className="border rounded-lg overflow-hidden bg-white">
//                             {/* Session header */}
//                             <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
//                               <div className="flex items-center">
//                                 <Clock className="w-4 h-4 text-gray-500 mr-2" />
//                                 <span className="text-sm text-gray-600">
//                                   {formatLongDate(session.startTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
//                                 </span>
//                               </div>
//                             </div>
                            
//                             {/* Session content */}
//                             <div className="p-4">
//                               <h4 className="font-medium text-gray-900 mb-1">{session.title}</h4>
//                               <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                              
//                               <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                                 <div className="flex items-center">
//                                   <User className="w-4 h-4 text-gray-400 mr-1" />
//                                   <span className="font-medium">
//                                     {typeof session.speaker === 'object' 
//                                       ? session.speaker?.fullName 
//                                       : session.speakerName || "Unknown Speaker"}
//                                   </span>
//                                 </div>
                                
//                                 <div className="flex items-center">
//                                   <MapPin className="w-4 h-4 text-gray-400 mr-1" />
//                                   <span>{session.location}</span>
//                                 </div>
                                
//                                 {session.capacity > 0 && (
//                                   <div className="flex items-center">
//                                     <span>Capacity: {session.capacity}</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
                
//                 {/* Materials tab */}
//                 {selectedEventTab === 'materials' && (
//                   <div>
//                     <h3 className="text-lg font-medium text-gray-800 mb-4">Session Materials</h3>
                    
//                     {/* Loading state */}
//                     {materialsLoading ? (
//                       <div className="flex justify-center py-8">
//                         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
//                       </div>
//                     ) : sessionMaterials.length === 0 ? (
//                       <div className="text-center py-8 bg-gray-50 rounded-lg">
//                         <p className="text-gray-600">No materials have been uploaded for this event yet.</p>
//                       </div>
//                     ) : (
//                       <div className="overflow-hidden">
//                         <table className="min-w-full bg-white">
//                           <thead className="bg-gray-50">
//                             <tr>
//                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
//                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
//                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
//                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
//                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-200">
//                             {sessionMaterials.map((material) => (
//                               <tr key={material.id || material._id} className="hover:bg-gray-50">
//                                 <td className="px-4 py-3 whitespace-nowrap">
//                                   <div className="flex items-center">
//                                     {/* Display different icons based on file type */}
//                                     {material.fileType === 'application/pdf' ? (
//                                       <FileText className="w-4 h-4 text-red-400 mr-2" />
//                                     ) : material.fileType.includes('word') ? (
//                                       <FileText className="w-4 h-4 text-blue-400 mr-2" />
//                                     ) : material.fileType.includes('sheet') || material.fileType.includes('excel') ? (
//                                       <FileText className="w-4 h-4 text-green-400 mr-2" />
//                                     ) : material.fileType.includes('presentation') ? (
//                                       <FileText className="w-4 h-4 text-orange-400 mr-2" />
//                                     ) : material.fileType.includes('zip') || material.fileType.includes('archive') ? (
//                                       <FileText className="w-4 h-4 text-purple-400 mr-2" />
//                                     ) : (
//                                       <FileText className="w-4 h-4 text-gray-400 mr-2" />
//                                     )}
//                                     <span className="text-sm font-medium text-gray-900">{material.fileName}</span>
//                                   </div>
//                                 </td>
//                                 <td className="px-4 py-3 whitespace-nowrap">
//                                   <span className="text-sm text-gray-600">{material.sessionTitle}</span>
//                                 </td>
//                                 <td className="px-4 py-3 whitespace-nowrap">
//                                   <span className="text-sm text-gray-600">{material.fileSize}</span>
//                                 </td>
//                                 <td className="px-4 py-3 whitespace-nowrap">
//                                   <span className="text-sm text-gray-600">{material.uploadedBy || 'Speaker'}</span>
//                                 </td>
//                                 <td className="px-4 py-3 whitespace-nowrap">
//                                   <span className="text-sm text-gray-600">{formatDate(material.uploadDate)}</span>
//                                 </td>
//                                 <td className="px-4 py-3 whitespace-nowrap">
//                                   <button
//                                     onClick={() => handleDownloadMaterial(material)}
//                                     className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
//                                   >
//                                     <Download className="w-4 h-4 mr-1" />
//                                     <span className="text-sm">Download</span>
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Events Tab */}
//           {activeTab === 'events' && !showEventDetails && (
//             <div className="space-y-8">
//               {/* Search and Filter Section */}
//               <div className="bg-white p-6 rounded-lg shadow-lg">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                   <div className="relative flex-grow max-w-md">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Search className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Search events..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
//                     />
//                   </div>
                  
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Filter className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <select 
//                       value={filterValue}
//                       onChange={(e) => setFilterValue(e.target.value)}
//                       className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-green-500 focus:border-green-500"
//                     >
//                       <option value="all">All Events</option>
//                       <option value="upcoming">Upcoming</option>
//                       <option value="today">Today</option>
//                       <option value="past">Past</option>
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                       <ChevronDown className="h-4 w-4 text-gray-400" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Upcoming Events Section */}
//               <div className="space-y-4">
//                 <h3 className="text-xl font-bold text-gray-800">Upcoming Events</h3>
                
//                 {loading ? (
//                   <div className="flex justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//                   </div>
//                 ) : error ? (
//                   <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
//                     <p className="text-red-700">{error}</p>
//                   </div>
//                 ) : filteredEvents.length === 0 ? (
//                   <div className="bg-white p-8 rounded-lg shadow-md text-center">
//                     <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <h4 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h4>
//                     <p className="text-gray-500">
//                       {searchTerm ? 
//                         `No events match your search for "${searchTerm}"` : 
//                         "There are no upcoming events at the moment. Check back later!"}
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredEvents.map(event => (
//                       <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
//                         <div className="relative h-40 bg-gray-100">
//                           {event.coverImage ? (
//                             <img
//                               src={event.coverImage}
//                               alt={event.title}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center">
//                               <Calendar className="w-10 h-10 text-gray-300" />
//                             </div>
//                           )}
//                         </div>
                        
//                         <div className="p-4">
//                           <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate">{event.title}</h4>
                          
//                           <div className="space-y-1 mb-3">
//                             <div className="flex items-center text-sm text-gray-600">
//                               <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                               <span>{formatDate(event.startDate)}</span>
//                             </div>
//                             <div className="flex items-center text-sm text-gray-600">
//                               <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                               <span className="truncate">{event.location}</span>
//                             </div>
//                           </div>
                          
//                           <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//                             {event.description}
//                           </p>
                          
//                           <div className="flex justify-between items-center pt-2 border-t">
//                             <span className="text-green-600 font-medium">
//                               {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
//                             </span>
                            
//                             {/* Check if user is already registered */}
//                             {event.attendees?.includes(currentUser?._id) ? (
//                               <div className="flex space-x-2">
//                                 <button
//                                   onClick={() => handleViewEventDetails(event)}
//                                   className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
//                                 >
//                                   <Eye className="w-4 h-4 mr-1" />
//                                   View
//                                 </button>
//                               </div>
//                             ) : (
//                               <button
//                                 onClick={() => handleRegisterForEvent(event._id)}
//                                 className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
//                               >
//                                 Register
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* My Registered Events Tab */}
//           {activeTab === 'registered' && !showEventDetails && (
//             <div className="space-y-8">
//               <div className="space-y-4">
//                 <h3 className="text-xl font-bold text-gray-800">My Registered Events</h3>
                
//                 {loading ? (
//                   <div className="flex justify-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//                   </div>
//                 ) : error ? (
//                   <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
//                     <p className="text-red-700">{error}</p>
//                   </div>
//                 ) : registeredEvents.length === 0 ? (
//                   <div className="bg-white p-8 rounded-lg shadow-md text-center">
//                     <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <h4 className="text-xl font-semibold text-gray-700 mb-2">No Registered Events</h4>
//                     <p className="text-gray-500">
//                       You haven't registered for any events yet. Browse available events to register!
//                     </p>
//                     <button
//                       onClick={() => setActiveTab('events')}
//                       className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                     >
//                       Explore Events
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {registeredEvents.map(event => (
//                       <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
//                         <div className="relative h-40 bg-gray-100">
//                           {event.coverImage ? (
//                             <img
//                               src={event.coverImage}
//                               alt={event.title}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center">
//                               <Calendar className="w-10 h-10 text-gray-300" />
//                             </div>
//                           )}
//                           <div className="absolute top-2 right-2">
//                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
//                               {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
//                             </span>
//                           </div>
//                         </div>
                        
//                         <div className="p-4">
//                           <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate">{event.title}</h4>
                          
//                           <div className="space-y-1 mb-3">
//                             <div className="flex items-center text-sm text-gray-600">
//                               <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                               <span>{formatDate(event.startDate)}</span>
//                             </div>
//                             <div className="flex items-center text-sm text-gray-600">
//                               <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                               <span className="truncate">{event.location}</span>
//                             </div>
//                           </div>
                          
//                           <div className="flex justify-end items-center pt-2 mt-4 border-t">
//                             <button
//                               onClick={() => handleViewEventDetails(event)}
//                               className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
//                             >
//                               <Eye className="w-4 h-4 mr-2" />
//                               View Details
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Speakers Tab */}
//           {activeTab === 'speakers' && (
//             <div className="space-y-6">
//               <div className="bg-white p-6 rounded-lg shadow-md">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//                   <h3 className="text-lg font-semibold text-gray-700 mb-4 md:mb-0">Speaker Directory</h3>
                  
//                   {/* Search input */}
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Search className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Search speakers..."
//                       value={speakerSearch}
//                       onChange={handleSpeakerSearch}
//                       className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full"
//                     />
//                   </div>
//                 </div>
                
//                 {speakersLoading ? (
//                   <div className="flex justify-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
//                   </div>
//                 ) : speakersError ? (
//                   <div className="bg-red-50 border-l-4 border-red-500 p-4">
//                     <p className="text-red-700">{speakersError}</p>
//                   </div>
//                 ) : filteredSpeakers.length === 0 ? (
//                   <div className="text-center py-8 bg-gray-50 rounded-lg">
//                     <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-500 mb-2">No speakers found</p>
//                     {speakerSearch ? (
//                       <p className="text-gray-400 text-sm">
//                         Try adjusting your search query
//                       </p>
//                     ) : (
//                       <p className="text-gray-400 text-sm">
//                         No speakers are available at the moment
//                       </p>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredSpeakers.map(speaker => (
//                       <div key={speaker._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
//                         <div className="p-4">
//                           <div className="flex items-center">
//                             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl font-bold mr-4">
//                               {speaker.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
//                             </div>
//                             <div>
//                               <h4 className="font-medium text-lg">{speaker.fullName}</h4>
//                               {speaker.organization && (
//                                 <p className="text-gray-600">{speaker.organization}</p>
//                               )}
//                             </div>
//                           </div>
                          
//                           {speaker.bio && (
//                             <p className="mt-3 text-gray-600 text-sm line-clamp-3">{speaker.bio}</p>
//                           )}
                          
//                           {speaker.email && (
//                             <div className="mt-4 flex items-center text-sm text-gray-500">
//                               <Mail className="w-4 h-4 mr-1" />
//                               {speaker.email}
//                             </div>
//                           )}
                          
//                           {/* Speaker topics or expertise areas could go here */}
//                           {speaker.expertise && (
//                             <div className="mt-3 flex flex-wrap gap-1">
//                               {speaker.expertise.split(',').map((topic, index) => (
//                                 <span 
//                                   key={index}
//                                   className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
//                                 >
//                                   {topic.trim()}
//                                 </span>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Notifications Tab */}
//           {activeTab === 'notifications' && !loading && (
//             <div className="bg-white p-6 rounded-lg shadow">
//               <h3 className="text-lg font-semibold text-gray-700 mb-6">Notifications</h3>
              
//               {/* Loading state for notifications */}
//               {notificationsLoading ? (
//                 <div className="flex justify-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//               ) : notificationsError ? (
//                 <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
//                   {notificationsError}
//                 </div>
//               ) : notifications.length === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg">
//                   <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                   <p className="text-gray-600 mb-2">You don't have any notifications yet.</p>
//                   <p className="text-gray-500 text-sm">
//                     Event organizers will send notifications about your events here.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {notifications.map(notification => (
//                     <div 
//                       key={notification._id} 
//                       className={`border rounded-lg overflow-hidden ${
//                         notification.isRead[currentUser?._id] ? 'opacity-75' : 'border-l-4 border-l-blue-500'
//                       }`}
//                     >
//                       <div className={`px-4 py-3 border-b flex justify-between items-center
//                         ${notification.type === 'info' ? 'bg-blue-50' : ''}
//                         ${notification.type === 'update' ? 'bg-green-50' : ''}
//                         ${notification.type === 'warning' ? 'bg-yellow-50' : ''}
//                         ${notification.type === 'urgent' ? 'bg-red-50' : ''}
//                       `}>
//                         <span className={`text-sm font-medium
//                           ${notification.type === 'info' ? 'text-blue-700' : ''}
//                           ${notification.type === 'update' ? 'text-green-700' : ''}
//                           ${notification.type === 'warning' ? 'text-yellow-700' : ''}
//                           ${notification.type === 'urgent' ? 'text-red-700' : ''}
//                         `}>
//                           {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
//                         </span>
//                         <span className="text-sm text-gray-500">
//                           {new Date(notification.createdAt).toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="p-4">
//                         <h4 className="font-semibold text-lg">{notification.title}</h4>
//                         <p className="text-gray-600 mt-1">{notification.message}</p>
//                         <div className="mt-3 flex justify-between items-center">
//                           <span className="text-sm text-gray-500">
//                             From: {notification.sender?.fullName || 'Event Organizer'}
//                           </span>
//                           {!notification.isRead[currentUser?._id] && (
//                             <button 
//                               onClick={() => markAsRead(notification._id)}
//                               className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
//                             >
//                               Mark as read
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Profile Tab */}
//           {activeTab === 'profile' && (
//             <ProfilePage currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
//           )}

//           {/* Live Q&A Tab */}
//           {activeTab === 'liveqa' && (
//             <div className="space-y-6">
//               <div className="bg-white rounded-lg shadow-lg p-6">
//                 <h3 className="text-lg font-semibold mb-4">Live Q&A</h3>
                
//                 {questionsLoading && userSessions.length === 0 ? (
//                   <div className="flex justify-center py-8">
//                     <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
//                   </div>
//                 ) : userSessions.length === 0 ? (
//                   <div className="text-center py-8 bg-gray-50 rounded-lg">
//                     <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-600 mb-2">You're not registered for any sessions yet</p>
//                     <p className="text-gray-500 text-sm mb-4">
//                       Register for events to participate in live Q&A with speakers
//                     </p>
//                     <button
//                       onClick={() => setActiveTab('events')}
//                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                     >
//                       Explore Events
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {/* Session selector sidebar */}
//                     <div className="md:col-span-1">
//                       <div className="border rounded-lg overflow-hidden">
//                         <div className="bg-gray-50 px-4 py-3 border-b">
//                           <h3 className="font-medium text-gray-700">Your Sessions</h3>
//                         </div>
//                         <div className="divide-y max-h-96 overflow-y-auto">
//                           {userSessions.map(session => (
//                             <button
//                               key={session._id}
//                               onClick={() => setSelectedQASession(session)}
//                               className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
//                                 selectedQASession?._id === session._id ? 'bg-green-50 border-l-4 border-green-500' : ''
//                               }`}
//                             >
//                               <p className="font-medium text-gray-800 mb-1 line-clamp-1">{session.title}</p>
//                               <p className="text-xs text-gray-500 mb-1">
//                                 {typeof session.speaker === 'object' 
//                                   ? session.speaker?.fullName 
//                                   : session.speakerName || "Session Speaker"}
//                               </p>
//                               <p className="text-xs text-gray-500">{session.eventTitle}</p>
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
                    
//                     {/* Q&A area */}
//                     <div className="md:col-span-2">
//                       {selectedQASession ? (
//                         <div className="border rounded-lg overflow-hidden">
//                           {/* Selected session header */}
//                           <div className="bg-green-50 px-4 py-3 border-b">
//                             <h3 className="font-medium text-gray-800">{selectedQASession.title}</h3>
//                             <p className="text-sm text-gray-600">
//                               {typeof selectedQASession.speaker === 'object' 
//                                 ? selectedQASession.speaker?.fullName 
//                                 : selectedQASession.speakerName || "Session Speaker"}
//                               {' '} • {' '}
//                               {selectedQASession.eventTitle}
//                             </p>
//                           </div>
                          
//                           {/* Question input area */}
//                           <div className="p-4 border-b">
//                             <label
//                               htmlFor="question-input"
//                               className="block text-sm font-medium text-gray-700 mb-1"
//                             >
//                               Ask a question
//                             </label>
//                             <div className="flex space-x-2">
//                               <textarea
//                                 id="question-input"
//                                 value={newQuestion}
//                                 onChange={(e) => setNewQuestion(e.target.value)}
//                                 placeholder="Type your question here..."
//                                 className="flex-grow rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 p-2"
//                                 rows={2}
//                               />
//                               <button
//                                 onClick={handleSubmitQuestion}
//                                 disabled={!newQuestion.trim() || questionsLoading}
//                                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed self-end"
//                               >
//                                 Submit
//                               </button>
//                             </div>
//                           </div>
                          
//                           {/* Questions list */}
//                           <div className="p-4">
//                             <h4 className="font-medium text-gray-700 mb-3">Questions & Answers</h4>
                            
//                             {questionsLoading && sessionQuestions.length === 0 ? (
//                               <div className="flex justify-center py-8">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
//                               </div>
//                             ) : sessionQuestions.length === 0 ? (
//                               <div className="text-center py-8 bg-gray-50 rounded-lg">
//                                 <p className="text-gray-600">No questions yet</p>
//                                 <p className="text-sm text-gray-500 mt-1">Be the first to ask a question!</p>
//                               </div>
//                             ) : (
//                               <div className="space-y-6">
//                                 {/* Pending questions */}
//                                 <div className="space-y-4">
//                                   {sessionQuestions
//                                     .filter(q => q.status === 'pending')
//                                     .map(question => (
//                                       <div 
//                                         key={question._id} 
//                                         className={`border rounded-lg overflow-hidden ${
//                                           question.askedBy._id === currentUser?._id ? 'border-green-200 bg-green-50' : ''
//                                         }`}
//                                       >
//                                         <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
//                                           <div>
//                                             <span className="font-medium text-sm">
//                                               {question.askedBy._id === currentUser?._id ? 'You' : question.askedBy.fullName}
//                                             </span>
//                                             <span className="mx-2 text-gray-500">•</span>
//                                             <span className="text-xs text-gray-500">
//                                               {new Date(question.createdAt).toLocaleString()}
//                                             </span>
//                                           </div>
//                                           <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
//                                             Pending
//                                           </span>
//                                         </div>
//                                         <div className="p-4">
//                                           <p className="text-gray-800">{question.text}</p>
//                                         </div>
//                                       </div>
//                                     ))}
//                                 </div>
                                
//                                 {/* Answered questions */}
//                                 <div className="space-y-4">
//                                   <h5 className="font-medium text-sm text-gray-500 border-b pb-2">Answered Questions</h5>
//                                   {sessionQuestions
//                                     .filter(q => q.status === 'answered')
//                                     .map(question => (
//                                       <div 
//                                         key={question._id} 
//                                         className={`border rounded-lg overflow-hidden ${
//                                           question.askedBy._id === currentUser?._id ? 'border-green-200' : ''
//                                         }`}
//                                       >
//                                         <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
//                                           <div>
//                                             <span className="font-medium text-sm">
//                                               {question.askedBy._id === currentUser?._id ? 'You' : question.askedBy.fullName}
//                                             </span>
//                                             <span className="mx-2 text-gray-500">•</span>
//                                             <span className="text-xs text-gray-500">
//                                               {new Date(question.createdAt).toLocaleString()}
//                                             </span>
//                                           </div>
//                                           <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
//                                             Answered
//                                           </span>
//                                         </div>
//                                         <div className="p-4">
//                                           <p className="text-gray-800">{question.text}</p>
                                          
//                                           {/* Answer */}
//                                           <div className="mt-3 bg-blue-50 p-3 rounded-lg">
//                                             <div className="flex justify-between items-center mb-2">
//                                               <div>
//                                                 <span className="font-medium text-sm text-blue-800">
//                                                   {question.answer.answeredBy.fullName}
//                                                 </span>
//                                                 <span className="mx-2 text-gray-500">•</span>
//                                                 <span className="text-xs text-gray-500">
//                                                   {new Date(question.answer.answeredAt).toLocaleString()}
//                                                 </span>
//                                               </div>
//                                             </div>
//                                             <p className="text-gray-800">{question.answer.text}</p>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="text-center py-12 bg-gray-50 rounded-lg">
//                           <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                           <p className="text-gray-600">Select a session to view Q&A</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* My Tickets Tab */}
//           {activeTab === 'tickets' && (
//             <MyTickets />
//           )}

//           {/* Feedback Tab */}
//           {activeTab === 'feedback' && (
//             <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//               <div className="p-6 border-b">
//                 <h3 className="text-lg font-semibold">Session Feedback</h3>
//                 <p className="text-gray-600 mt-1">Share your thoughts on sessions you've attended to help improve future events.</p>
//               </div>
              
//               {/* Tabs for Submit Feedback and View My Feedback */}
//               <div className="border-b">
//                 <nav className="flex">
//                   <button
//                     className={`px-6 py-3 text-sm font-medium border-b-2 ${
//                       !submittedFeedback.length || feedbackLoading
//                         ? 'border-green-600 text-green-600' 
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                     onClick={() => setFeedbackLoading(false)}
//                   >
//                     Submit Feedback
//                   </button>
                  
//                   {submittedFeedback.length > 0 && (
//                     <button
//                       className={`px-6 py-3 text-sm font-medium border-b-2 ${
//                         feedbackLoading
//                           ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                           : 'border-green-600 text-green-600'
//                       }`}
//                       onClick={() => setFeedbackLoading(true)}
//                     >
//                       My Submitted Feedback
//                     </button>
//                   )}
//                 </nav>
//               </div>
              
//               <div className="p-6">
//                 {/* Feedback submission form */}
//                 {!feedbackLoading && (
//                   <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
//                 )}
                
//                 {/* Previously submitted feedback */}
//                 {feedbackLoading && (
//                   <div className="space-y-6">
//                     <h4 className="text-lg font-medium text-gray-800">Your Feedback History</h4>
                    
//                     {/* Loading state */}
//                     {feedbackLoading ? (
//                       <div className="flex justify-center py-8">
//                         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
//                       </div>
//                     ) : feedbackError ? (
//                       <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
//                         {feedbackError}
//                       </div>
//                     ) : submittedFeedback.length === 0 ? (
//                       <div className="text-center py-8 bg-gray-50 rounded-lg">
//                         <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                         <p className="text-gray-600 mb-2">You haven't submitted any feedback yet</p>
//                         <p className="text-gray-500 text-sm">
//                           Your feedback helps speakers improve their sessions
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {submittedFeedback.map(feedback => (
//                           <div key={feedback._id} className="border rounded-lg overflow-hidden">
//                             <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
//                               <div>
//                                 <span className="font-medium text-gray-800">
//                                   {feedback.sessionName || 'Session Feedback'}
//                                 </span>
//                                 <span className="mx-2 text-gray-500">•</span>
//                                 <span className="text-sm text-gray-600">
//                                   {feedback.eventName || 'Event'}
//                                 </span>
//                               </div>
//                               <div className="flex">
//                                 {[1, 2, 3, 4, 5].map(star => (
//                                   <Star
//                                     key={star}
//                                     className={`w-4 h-4 ${
//                                       star <= feedback.rating
//                                         ? 'text-yellow-400 fill-yellow-400'
//                                         : 'text-gray-300'
//                                     }`}
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                             <div className="p-4">
//                               <p className="text-gray-700">{feedback.comment}</p>
//                               <p className="text-sm text-gray-500 mt-2">
//                                 Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AttendeeDashboard;

import React, { useState, useEffect } from 'react';
import { Calendar, User, Bell, MessageSquare, Ticket, Star, FileText, ChevronDown, MapPin, Clock, Tag, Users, Search, Filter, LogOut, Mail, Download, Eye, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePage from '../components/profile/ProfilePage';
import NotificationPanel from '../components/notifications/NotificationPanel';
import MyTickets from '../components/tickets/MyTickets';
import FeedbackForm from '../components/events/feedback/FeedbackForm';

const AttendeeDashboard = () => {
  // Navigation and user state
  const [activeTab, setActiveTab] = useState('events');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  
  // Events state
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  
  // Speakers directory state
  const [speakers, setSpeakers] = useState([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState([]);
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [speakersLoading, setSpeakersLoading] = useState(false);
  const [speakersError, setSpeakersError] = useState('');
  
  // Event details view state
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventTab, setSelectedEventTab] = useState('overview');
  const [sessionMaterials, setSessionMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  
  // Live Q&A feature state
  const [userSessions, setUserSessions] = useState([]);
  const [selectedQASession, setSelectedQASession] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState('');

  // Feedback state
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  
  // ===== EFFECT HOOKS =====

  // Fetch current user data
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
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch events data based on active tab
  useEffect(() => {
    if (activeTab === 'events' || activeTab === 'registered') {
      fetchEvents();
    }
  }, [activeTab]);

  // Fetch available speakers when speakers tab is active
  useEffect(() => {
    if (activeTab === 'speakers') {
      fetchSpeakers();
    }
  }, [activeTab]);

  // Fetch notifications when in notifications tab
  useEffect(() => {
    if (activeTab === 'notifications' && currentUser) {
      fetchNotifications();
    }
  }, [activeTab, currentUser]);

  // Fetch session materials when an event is selected
  useEffect(() => {
    if (selectedEvent && selectedEventTab === 'materials') {
      fetchSessionMaterials();
    }
  }, [selectedEvent, selectedEventTab]);

  // Fetch user's sessions for Q&A
  useEffect(() => {
    if (activeTab === 'liveqa' && currentUser) {
      fetchUserSessions();
    }
  }, [activeTab, currentUser]);

  // Fetch questions when a session is selected for Q&A
  useEffect(() => {
    if (selectedQASession) {
      fetchSessionQuestions(selectedQASession._id);
    }
  }, [selectedQASession]);

  // Fetch submitted feedback when feedback tab is active
  useEffect(() => {
    if (activeTab === 'feedback' && currentUser) {
      fetchSubmittedFeedback();
    }
  }, [activeTab, currentUser]);

  // ===== DATA FETCHING FUNCTIONS =====

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'events') {
        // Fetch all published events
        const response = await fetch('http://localhost:5000/api/events?status=published', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.data || []);
        
        // Filter for featured events (could be based on tags, popularity, etc.)
        setFeaturedEvents(data.data?.filter(event => 
          new Date(event.startDate) > new Date() && 
          (event.tags?.includes('featured') || Math.random() > 0.7) // Random selection for demo
        ).slice(0, 3) || []);
        
        // Filter for upcoming events
        setUpcomingEvents(data.data?.filter(event => 
          new Date(event.startDate) > new Date()
        ).slice(0, 6) || []);
      } else if (activeTab === 'registered') {
        // Fetch events the attendee is registered for
        const response = await fetch('http://localhost:5000/api/events/my/events?role=attendee', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch registered events');
        }
        
        const data = await response.json();
        setRegisteredEvents(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available speakers
  const fetchSpeakers = async () => {
    try {
      setSpeakersLoading(true);
      setSpeakersError('');
      
      const response = await fetch('http://localhost:5000/api/users/speakers/available', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch speakers');
      }
      
      const data = await response.json();
      setSpeakers(data.data || []);
      setFilteredSpeakers(data.data || []);
      
    } catch (err) {
      console.error('Error fetching speakers:', err);
      setSpeakersError('Failed to load speakers. Please try again later.');
    } finally {
      setSpeakersLoading(false);
    }
  };

  // Fetch event details
  const fetchEventDetails = async (eventId) => {
    try {
      setLoading(true);
      
      // Since we already have the event data from the events list,
      // let's use that directly to avoid an additional API call
      const existingEvent = [...events, ...registeredEvents].find(e => e._id === eventId);
      
      if (existingEvent) {
        // If we have basic event data but need to enrich it with sessions info
        if (!existingEvent.sessions || existingEvent.sessions.length === 0) {
          try {
            // Try to fetch the full event details with sessions
            const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              setSelectedEvent(data.data);
              return;
            }
          } catch (err) {
            console.error('Error fetching additional event details:', err);
            // Continue with existing data if fetch fails
          }
        }
        
        // Ensure the sessions data has the right speaker information
        if (existingEvent.sessions) {
          existingEvent.sessions = existingEvent.sessions.map(session => {
            if (session.speaker && typeof session.speaker === 'object') {
              return session;
            } else if (session.speaker) {
              // Try to find the speaker details from the speakers list
              const speakerDetails = speakers.find(s => s._id === session.speaker);
              return {
                ...session,
                speakerName: speakerDetails ? speakerDetails.fullName : "Conference Speaker"
              };
            }
            return session;
          });
        }
        
        setSelectedEvent(existingEvent);
      } else {
        // If we don't have the event data, try to fetch it
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
        
        const data = await response.json();
        setSelectedEvent(data.data);
      }
      
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
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

  // Fetch session materials
  const fetchSessionMaterials = async () => {
    if (!selectedEvent) return;
    
    try {
      setMaterialsLoading(true);
      
      const materials = [];
      
      // Fetch materials for each session in the event
      if (selectedEvent.sessions && selectedEvent.sessions.length > 0) {
        for (const session of selectedEvent.sessions) {
          try {
            const response = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/sessions/${session._id}/materials`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data.length > 0) {
                // Add session info to each material
                const sessionMaterials = data.data.map(material => ({
                  ...material,
                  sessionId: session._id,
                  sessionTitle: session.title
                }));
                
                materials.push(...sessionMaterials);
              }
            }
          } catch (err) {
            console.error(`Error fetching materials for session ${session._id}:`, err);
            // Continue with next session even if one fails
          }
        }
      }
      
      setSessionMaterials(materials);
      
    } catch (err) {
      console.error('Error fetching session materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Fetch sessions the user is registered for (for Q&A)
  const fetchUserSessions = async () => {
    try {
      setQuestionsLoading(true);
      
      // Fetch events the attendee is registered for
      const response = await fetch('http://localhost:5000/api/events/my/events?role=attendee', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch registered events');
      }
      
      const data = await response.json();
      const events = data.data || [];
      
      // Extract all sessions from the events
      let allSessions = [];
      
      events.forEach(event => {
        if (event.sessions && event.sessions.length > 0) {
          // Add event info to each session for context
          const eventSessions = event.sessions.map(session => ({
            ...session,
            eventTitle: event.title,
            eventId: event._id
          }));
          
          allSessions = [...allSessions, ...eventSessions];
        }
      });
      
      // Sort sessions by date (most recent first)
      allSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      
      setUserSessions(allSessions);
      
      // Set the first session as selected by default
      if (allSessions.length > 0 && !selectedQASession) {
        setSelectedQASession(allSessions[0]);
      }
      
    } catch (err) {
      console.error('Error fetching user sessions:', err);
      setQuestionsError('Failed to load your sessions. Please try again later.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Fetch questions for a specific session
  const fetchSessionQuestions = async (sessionId) => {
    try {
      setQuestionsLoading(true);
      
      // Fetch questions from the API
      const response = await fetch(`http://localhost:5000/api/questions/session/${sessionId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session questions');
      }
      
      const data = await response.json();
      setSessionQuestions(data.data || []);
      
    } catch (err) {
      console.error('Error fetching session questions:', err);
      setQuestionsError('Failed to load questions. Please try again.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Fetch submitted feedback for the current user
  const fetchSubmittedFeedback = async () => {
    try {
      setFeedbackLoading(true);
      setFeedbackError('');
      
      // This endpoint would be created to list feedback a user has submitted
      const response = await fetch(`http://localhost:5000/api/feedback/user`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch submitted feedback');
      }
      
      const data = await response.json();
      setSubmittedFeedback(data.data || []);
      
    } catch (err) {
      console.error('Error fetching submitted feedback:', err);
      setFeedbackError('Failed to load your previously submitted feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ===== HELPER FUNCTIONS =====

  // Helper to get speaker name from session
  const getSpeakerName = (session) => {
    if (!session) return "Session Speaker";
    
    if (typeof session.speaker === 'object') {
      return session.speaker?.fullName || "Session Speaker";
    } else {
      return session.speakerName || "Session Speaker";
    }
  };

  // Function to handle speaker search
  const handleSpeakerSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSpeakerSearch(searchTerm);
    
    if (!searchTerm) {
      setFilteredSpeakers(speakers);
      return;
    }
    
    const filtered = speakers.filter(speaker => 
      speaker.fullName.toLowerCase().includes(searchTerm) || 
      (speaker.organization && speaker.organization.toLowerCase().includes(searchTerm)) ||
      (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm))
    );
    
    setFilteredSpeakers(filtered);
  };

  // Handle search and filtering
  const getFilteredEvents = () => {
    const eventsToFilter = activeTab === 'registered' ? registeredEvents : events;
    
    return eventsToFilter.filter(event => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      const eventDate = new Date(event.startDate);
      const today = new Date();
      const isPast = eventDate < today;
      const isToday = eventDate.toDateString() === today.toDateString();
      const isUpcoming = eventDate > today && !isToday;
      
      if (filterValue === 'all') return matchesSearch;
      if (filterValue === 'upcoming') return matchesSearch && isUpcoming;
      if (filterValue === 'today') return matchesSearch && isToday;
      if (filterValue === 'past') return matchesSearch && isPast;
      
      return matchesSearch;
    });
  };

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    if (!currentUser) return;
    
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

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !selectedQASession || !currentUser) {
      return;
    }
    
    try {
      setQuestionsLoading(true);
      
      const response = await fetch('http://localhost:5000/api/questions/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: selectedQASession._id,
          eventId: selectedQASession.eventId,
          text: newQuestion,
          isAnonymous: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit question');
      }
      
      const data = await response.json();
      
      // Add the new question to the list
      setSessionQuestions(prev => [data.data, ...prev]);
      
      // Clear the input
      setNewQuestion('');
      
      // Show success message
      alert('Question submitted successfully!');
      
    } catch (err) {
      console.error('Error submitting question:', err);
      alert('Failed to submit your question. Please try again.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Handle feedback submission success
  const handleFeedbackSubmitted = () => {
    // Refresh the feedback list after new submission
    fetchSubmittedFeedback();
  };

  // ===== EVENT HANDLERS =====

  // Handle event registration
  const handleRegisterForEvent = (eventId) => {
    navigate(`/events/${eventId}/tickets`);
  };

  // Handle viewing event details
  const handleViewEventDetails = (event) => {
    setSelectedEvent(event);
    setSelectedEventTab('overview');
    setShowEventDetails(true);
  };

  // Handle back button from event details
  const handleBackFromDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  // Handle downloading a session material
  const handleDownloadMaterial = async (material) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = material.fileUrl;
      link.download = material.fileName;
      
      // Append the link to the body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again later.');
    }
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

  // Handle profile update
  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // ===== FORMAT HELPERS =====

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format long date for event details
  const formatLongDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for session display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(parseInt(bytes))) return 'Unknown size';
    
    bytes = parseInt(bytes);
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color for event badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtered events
  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-green-700 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Conference Hub</h1>
          <p className="text-green-200 text-sm">Attendee Portal</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-3 bg-green-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                {currentUser ? (
                  <span className="font-medium">
                    {currentUser.fullName?.charAt(0) || 'A'}
                  </span>
                ) : (
                  <span className="font-medium">A</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {currentUser?.fullName || 'Attendee'}
                </p>
                <p className="text-xs text-green-200">
                  {currentUser?.email || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
          
          <ul className="mt-6 space-y-1 px-2">
            <li>
              <button 
                onClick={() => {
                  setActiveTab('events');
                  setShowEventDetails(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'events' && !showEventDetails ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>Explore Events</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveTab('registered');
                  setShowEventDetails(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'registered' && !showEventDetails ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <Ticket className="w-5 h-5 mr-3" />
                <span>My Registrations</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('speakers')}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'speakers' ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <User className="w-5 h-5 mr-3" />
                <span>Speakers</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'notifications' ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'profile' ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <User className="w-5 h-5 mr-3" />
                <span>My Profile</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('liveqa')}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'liveqa' ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                <span>Live Q&A</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('tickets')}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'tickets' ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <Ticket className="w-5 h-5 mr-3" />
                <span>My Tickets</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center w-full px-4 py-2.5 text-green-100 ${
                  activeTab === 'feedback' ? 'bg-green-800' : 'hover:bg-green-600'
                } rounded-lg group`}
              >
                <Star className="w-5 h-5 mr-3" />
                <span>Feedback</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-green-100 hover:bg-green-600 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'events' && !showEventDetails && 'Explore Events'}
              {activeTab === 'registered' && !showEventDetails && 'My Registered Events'}
              {showEventDetails && selectedEvent && selectedEvent.title}
              {activeTab === 'speakers' && 'Conference Speakers'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'liveqa' && 'Live Q&A'}
              {activeTab === 'tickets' && 'My Tickets'}
              {activeTab === 'feedback' && 'Session Feedback'}
            </h2>
            
            {/* Notification panel in header */}
            <NotificationPanel />
          </div>
        </header>
        
        <main className="p-6">
          {/* Event Details View */}
          {showEventDetails && selectedEvent && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header with banner image */}
              <div className="relative h-64 bg-green-100">
                {selectedEvent.coverImage ? (
                  <img
                    src={selectedEvent.coverImage}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-24 h-24 text-green-300" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  <button
                    onClick={handleBackFromDetails}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    title="Back to List"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 bg-white rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Event title */}
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h1>
              </div>
              
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex">
                  <button
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      selectedEventTab === 'overview' 
                        ? 'border-green-600 text-green-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEventTab('overview')}
                  >
                    Overview
                  </button>
                  
                  <button
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      selectedEventTab === 'sessions' 
                        ? 'border-green-600 text-green-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEventTab('sessions')}
                  >
                    Sessions {selectedEvent.sessions && `(${selectedEvent.sessions.length || 0})`}
                  </button>
                  
                  <button
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      selectedEventTab === 'materials' 
                        ? 'border-green-600 text-green-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEventTab('materials')}
                  >
                    Materials
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="p-6">
                {/* Overview tab */}
                {selectedEventTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Calendar className="w-5 h-5 text-green-600 mr-2" />
                          <h3 className="text-sm font-medium text-gray-700">Date</h3>
                        </div>
                        <p className="text-gray-800">
                          {formatLongDate(selectedEvent.startDate)}
                          {selectedEvent.startDate !== selectedEvent.endDate && ` - ${formatLongDate(selectedEvent.endDate)}`}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <MapPin className="w-5 h-5 text-green-600 mr-2" />
                          <h3 className="text-sm font-medium text-gray-700">Location</h3>
                        </div>
                        <p className="text-gray-800">{selectedEvent.location}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Users className="w-5 h-5 text-green-600 mr-2" />
                          <h3 className="text-sm font-medium text-gray-700">Capacity</h3>
                        </div>
                        <p className="text-gray-800">
                          {selectedEvent.attendees ? selectedEvent.attendees.length : 0} / {selectedEvent.capacity} attendees
                        </p>
                        {selectedEvent.attendees && selectedEvent.attendees.length >= selectedEvent.capacity && (
                          <p className="text-xs text-red-600 mt-1">Fully booked</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
                      <div className="prose text-gray-700 max-w-none">
                        {selectedEvent.description}
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center mb-3">
                          <Tag className="w-5 h-5 text-green-600 mr-2" />
                          <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Sessions tab */}
                {selectedEventTab === 'sessions' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Event Sessions</h3>
                    
                    {!selectedEvent.sessions || selectedEvent.sessions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No sessions have been added to this event yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedEvent.sessions.map((session) => (
                          <div key={session._id} className="border rounded-lg overflow-hidden bg-white">
                            {/* Session header */}
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                  {formatLongDate(session.startTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Session content */}
                            <div className="p-4">
                              <h4 className="font-medium text-gray-900 mb-1">{session.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-gray-400 mr-1" />
                                  <span className="font-medium">
                                    {getSpeakerName(session)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                  <span>{session.location}</span>
                                </div>
                                
                                {session.capacity > 0 && (
                                  <div className="flex items-center">
                                    <span>Capacity: {session.capacity}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Materials tab */}
                {selectedEventTab === 'materials' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Session Materials</h3>
                    
                    {/* Loading state */}
                    {materialsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    ) : sessionMaterials.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No materials have been uploaded for this event yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sessionMaterials.map((material) => (
                              <tr key={material._id || material.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {/* Display different icons based on file type */}
                                    {material.fileType?.includes('pdf') ? (
                                      <FileText className="w-4 h-4 text-red-400 mr-2" />
                                    ) : material.fileType?.includes('word') || material.fileType?.includes('document') ? (
                                      <FileText className="w-4 h-4 text-blue-400 mr-2" />
                                    ) : material.fileType?.includes('sheet') || material.fileType?.includes('excel') ? (
                                      <FileText className="w-4 h-4 text-green-400 mr-2" />
                                    ) : material.fileType?.includes('presentation') || material.fileType?.includes('powerpoint') ? (
                                      <FileText className="w-4 h-4 text-orange-400 mr-2" />
                                    ) : material.fileType?.includes('zip') || material.fileType?.includes('archive') ? (
                                      <FileText className="w-4 h-4 text-purple-400 mr-2" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                    )}
                                    <span className="text-sm font-medium text-gray-900">{material.fileName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">{material.sessionTitle}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">{formatFileSize(material.fileSize)}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">{formatDate(material.uploadDate)}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <button
                                    onClick={() => handleDownloadMaterial(material)}
                                    className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Download</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && !showEventDetails && (
            <div className="space-y-8">
              {/* Search and Filter Section */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select 
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Events</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="today">Today</option>
                      <option value="past">Past</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Events Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Upcoming Events</h3>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h4>
                    <p className="text-gray-500">
                      {searchTerm ? 
                        `No events match your search for "${searchTerm}"` : 
                        "There are no upcoming events at the moment. Check back later!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                      <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-40 bg-gray-100">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate">{event.title}</h4>
                          
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-green-600 font-medium">
                              {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                            </span>
                            
                            {/* Check if user is already registered */}
                            {event.attendees?.includes(currentUser?._id) ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewEventDetails(event)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRegisterForEvent(event._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                              >
                                Register
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Registered Events Tab */}
          {activeTab === 'registered' && !showEventDetails && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">My Registered Events</h3>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : registeredEvents.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">No Registered Events</h4>
                    <p className="text-gray-500">
                      You haven't registered for any events yet. Browse available events to register!
                    </p>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Explore Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registeredEvents.map(event => (
                      <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-40 bg-gray-100">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate">{event.title}</h4>
                          
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end items-center pt-2 mt-4 border-t">
                            <button
                              onClick={() => handleViewEventDetails(event)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speakers Tab */}
          {activeTab === 'speakers' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 md:mb-0">Speaker Directory</h3>
                  
                  {/* Search input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search speakers..."
                      value={speakerSearch}
                      onChange={handleSpeakerSearch}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full"
                    />
                  </div>
                </div>
                
                {speakersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : speakersError ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{speakersError}</p>
                  </div>
                ) : filteredSpeakers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No speakers found</p>
                    {speakerSearch ? (
                      <p className="text-gray-400 text-sm">
                        Try adjusting your search query
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No speakers are available at the moment
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpeakers.map(speaker => (
                      <div key={speaker._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl font-bold mr-4">
                              {speaker.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-lg">{speaker.fullName}</h4>
                              {speaker.organization && (
                                <p className="text-gray-600">{speaker.organization}</p>
                              )}
                            </div>
                          </div>
                          
                          {speaker.bio && (
                            <p className="mt-3 text-gray-600 text-sm line-clamp-3">{speaker.bio}</p>
                          )}
                          
                          {speaker.email && (
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-1" />
                              {speaker.email}
                            </div>
                          )}
                          
                          {/* Speaker topics or expertise areas could go here */}
                          {speaker.expertise && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {speaker.expertise.split(',').map((topic, index) => (
                                <span 
                                  key={index}
                                  className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                                >
                                  {topic.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
                    Event organizers will send notifications about your events here.
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

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfilePage currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
          )}

          {/* Live Q&A Tab */}
          {activeTab === 'liveqa' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Live Q&A</h3>
                
                {questionsLoading && userSessions.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : userSessions.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">You're not registered for any sessions yet</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Register for events to participate in live Q&A with speakers
                    </p>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Explore Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Session selector sidebar */}
                    <div className="md:col-span-1">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h3 className="font-medium text-gray-700">Your Sessions</h3>
                        </div>
                        <div className="divide-y max-h-96 overflow-y-auto">
                          {userSessions.map(session => (
                            <button
                              key={session._id}
                              onClick={() => setSelectedQASession(session)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                selectedQASession?._id === session._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                              }`}
                            >
                              <p className="font-medium text-gray-800 mb-1 line-clamp-1">{session.title}</p>
                              <p className="text-xs text-gray-500 mb-1">
                                {getSpeakerName(session)}
                              </p>
                              <p className="text-xs text-gray-500">{session.eventTitle}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Q&A area */}
                    <div className="md:col-span-2">
                      {selectedQASession ? (
                        <div className="border rounded-lg overflow-hidden">
                          {/* Selected session header */}
                          <div className="bg-green-50 px-4 py-3 border-b">
                            <h3 className="font-medium text-gray-800">{selectedQASession.title}</h3>
                            <p className="text-sm text-gray-600">
                              {getSpeakerName(selectedQASession)}
                              {' '} • {' '}
                              {selectedQASession.eventTitle}
                            </p>
                          </div>
                          
                          {/* Question input area */}
                          <div className="p-4 border-b">
                            <label
                              htmlFor="question-input"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Ask a question
                            </label>
                            <div className="flex space-x-2">
                              <textarea
                                id="question-input"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Type your question here..."
                                className="flex-grow rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 p-2"
                                rows={2}
                              />
                              <button
                                onClick={handleSubmitQuestion}
                                disabled={!newQuestion.trim() || questionsLoading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed self-end flex items-center"
                              >
                                {questionsLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>Submit</>
                                )}
                              </button>
                            </div>
                            {questionsError && (
                              <p className="mt-2 text-sm text-red-600">{questionsError}</p>
                            )}
                          </div>
                          
                          {/* Questions list */}
                          <div className="p-4">
                            <h4 className="font-medium text-gray-700 mb-3">Questions & Answers</h4>
                            
                            {questionsLoading && sessionQuestions.length === 0 ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                              </div>
                            ) : sessionQuestions.length === 0 ? (
                              <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">No questions yet</p>
                                <p className="text-sm text-gray-500 mt-1">Be the first to ask a question!</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* Pending questions */}
                                {sessionQuestions.filter(q => q.status === 'pending').length > 0 && (
                                  <div className="space-y-4">
                                    <h5 className="font-medium text-sm text-yellow-600 border-b pb-2">Pending Questions</h5>
                                    {sessionQuestions
                                      .filter(q => q.status === 'pending')
                                      .map(question => (
                                        <div 
                                          key={question._id} 
                                          className={`border rounded-lg overflow-hidden ${
                                            question.askedBy?._id === currentUser?._id ? 'border-green-200 bg-green-50' : ''
                                          }`}
                                        >
                                          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                                            <div>
                                              <span className="font-medium text-sm">
                                                {question.askedBy?._id === currentUser?._id ? 'You' : question.askedBy?.fullName}
                                              </span>
                                              <span className="mx-2 text-gray-500">•</span>
                                              <span className="text-xs text-gray-500">
                                                {new Date(question.createdAt).toLocaleString()}
                                              </span>
                                            </div>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                              Waiting for Answer
                                            </span>
                                          </div>
                                          <div className="p-4">
                                            <p className="text-gray-800">{question.text}</p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                                
                                {/* Answered questions */}
                                {sessionQuestions.filter(q => q.status === 'answered').length > 0 && (
                                  <div className="space-y-4">
                                    <h5 className="font-medium text-sm text-green-600 border-b pb-2">Answered Questions</h5>
                                    {sessionQuestions
                                      .filter(q => q.status === 'answered')
                                      .map(question => (
                                        <div 
                                          key={question._id} 
                                          className={`border rounded-lg overflow-hidden ${
                                            question.askedBy?._id === currentUser?._id ? 'border-green-200' : ''
                                          }`}
                                        >
                                          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                                            <div>
                                              <span className="font-medium text-sm">
                                                {question.askedBy?._id === currentUser?._id ? 'You' : question.askedBy?.fullName}
                                              </span>
                                              <span className="mx-2 text-gray-500">•</span>
                                              <span className="text-xs text-gray-500">
                                                {new Date(question.createdAt).toLocaleString()}
                                              </span>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                              Answered
                                            </span>
                                          </div>
                                          <div className="p-4">
                                            <p className="text-gray-800">{question.text}</p>
                                            
                                            {/* Answer */}
                                            <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                                              <div className="flex justify-between items-center mb-2">
                                                <div>
                                                  <span className="font-medium text-sm text-blue-800">
                                                    {question.answer?.answeredBy?.fullName || "Speaker"}
                                                  </span>
                                                  <span className="mx-2 text-gray-500">•</span>
                                                  <span className="text-xs text-gray-500">
                                                    {new Date(question.answer?.answeredAt).toLocaleString()}
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-gray-800">{question.answer?.text}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">Select a session to view Q&A</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Tickets Tab */}
          {activeTab === 'tickets' && (
            <MyTickets />
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Session Feedback</h3>
                <p className="text-gray-600 mt-1">Share your thoughts on sessions you've attended to help improve future events.</p>
              </div>
              
              {/* Tabs for Submit Feedback and View My Feedback */}
              <div className="border-b">
                <nav className="flex">
                  <button
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      !submittedFeedback.length || feedbackLoading
                        ? 'border-green-600 text-green-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setFeedbackLoading(false)}
                  >
                    Submit Feedback
                  </button>
                  
                  {submittedFeedback.length > 0 && (
                    <button
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        feedbackLoading
                          ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          : 'border-green-600 text-green-600'
                      }`}
                      onClick={() => setFeedbackLoading(true)}
                    >
                      My Submitted Feedback
                    </button>
                  )}
                </nav>
              </div>
              
              <div className="p-6">
                {/* Feedback submission form */}
                {!feedbackLoading && (
                  <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
                )}
                
                {/* Previously submitted feedback */}
                {feedbackLoading && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-800">Your Feedback History</h4>
                    
                    {/* Loading state */}
                    {feedbackLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    ) : feedbackError ? (
                      <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
                        {feedbackError}
                      </div>
                    ) : submittedFeedback.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">You haven't submitted any feedback yet</p>
                        <p className="text-gray-500 text-sm">
                          Your feedback helps speakers improve their sessions
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submittedFeedback.map(feedback => (
                          <div key={feedback._id} className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
                              <div>
                                <span className="font-medium text-gray-800">
                                  {feedback.sessionName || 'Session Feedback'}
                                </span>
                                <span className="mx-2 text-gray-500">•</span>
                                <span className="text-sm text-gray-600">
                                  {feedback.eventName || 'Event'}
                                </span>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= feedback.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-700">{feedback.comment}</p>
                              <p className="text-sm text-gray-500 mt-2">
                                Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendeeDashboard;