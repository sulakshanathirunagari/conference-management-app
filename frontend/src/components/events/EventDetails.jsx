

// // import React, { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { 
// //   Calendar, 
// //   MapPin, 
// //   Users, 
// //   DollarSign, 
// //   Tag, 
// //   Edit, 
// //   Trash, 
// //   ChevronLeft, 
// //   User, 
// //   Mail, 
// //   Clock, 
// //   Plus, 
// //   Ticket 
// // } from 'lucide-react';
// // import SessionList from './SessionList';
// // import SessionForm from './SessionForm';

// // const EventDetails = ({ event, onEdit, onDelete, onBack, onRefresh }) => {
// //   const [tab, setTab] = useState('overview'); // 'overview', 'attendees', 'sessions'
// //   const [showSessionForm, setShowSessionForm] = useState(false);
// //   const [selectedSession, setSelectedSession] = useState(null);
// //   const [availableSpeakers, setAvailableSpeakers] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
  
// //   // Fetch available speakers when component mounts
// //   useEffect(() => {
// //     fetchAvailableSpeakers();
// //   }, []);
  
// //   // Helper function to format date
// //   const formatDate = (dateString) => {
// //     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// //     return new Date(dateString).toLocaleDateString(undefined, options);
// //   };
  
// //   // Format time (for sessions)
// //   const formatTime = (dateString) => {
// //     const options = { hour: '2-digit', minute: '2-digit' };
// //     return new Date(dateString).toLocaleTimeString(undefined, options);
// //   };
  
// //   // Status badge color mapping
// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case 'published':
// //         return 'bg-green-100 text-green-800';
// //       case 'draft':
// //         return 'bg-yellow-100 text-yellow-800';
// //       case 'cancelled':
// //         return 'bg-red-100 text-red-800';
// //       case 'completed':
// //         return 'bg-blue-100 text-blue-800';
// //       default:
// //         return 'bg-gray-100 text-gray-800';
// //     }
// //   };
  
// //   // Fetch speakers that can be assigned to sessions
// //   const fetchAvailableSpeakers = async () => {
// //     try {
// //       // Use the dedicated endpoint for available speakers
// //       const response = await fetch('http://localhost:5000/api/users/speakers/available', {
// //         credentials: 'include'
// //       });
      
// //       if (!response.ok) {
// //         // If API fails, use mock data temporarily
// //         console.warn('Using mock speaker data due to API error');
// //         const mockSpeakers = [
// //           { _id: 'mock1', fullName: 'John Smith', organization: 'Tech Corp' },
// //           { _id: 'mock2', fullName: 'Sarah Johnson', organization: 'Design Studio' },
// //           { _id: 'mock3', fullName: 'Michael Chen', organization: 'AI Research' }
// //         ];
// //         setAvailableSpeakers(mockSpeakers);
// //         return;
// //       }
      
// //       const data = await response.json();
// //       setAvailableSpeakers(data.data || []);
// //     } catch (err) {
// //       console.error('Error fetching speakers:', err);
// //       setError('Failed to load available speakers: ' + err.message);
// //     }
// //   };
  
// //   // Add session to event
// //   const handleAddSession = async (sessionData) => {
// //     setLoading(true);
// //     setError('');
    
// //     try {
// //       const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(sessionData),
// //         credentials: 'include',
// //       });
      
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         throw new Error(errorData.message || 'Failed to add session');
// //       }
      
// //       // Clear form and hide it
// //       setShowSessionForm(false);
// //       setSelectedSession(null);
      
// //       // Refresh event data to include the new session
// //       if (onRefresh) {
// //         await onRefresh();
// //       }
      
// //     } catch (err) {
// //       setError(`Error adding session: ${err.message}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   // Update existing session
// //   const handleUpdateSession = async (sessionData) => {
// //     setLoading(true);
// //     setError('');
    
// //     try {
// //       const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions/${selectedSession._id}`, {
// //         method: 'PUT',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(sessionData),
// //         credentials: 'include',
// //       });
      
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         throw new Error(errorData.message || 'Failed to update session');
// //       }
      
// //       // Clear form and hide it
// //       setShowSessionForm(false);
// //       setSelectedSession(null);
      
// //       // Refresh event data
// //       if (onRefresh) {
// //         await onRefresh();
// //       }
      
// //     } catch (err) {
// //       setError(`Error updating session: ${err.message}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   // Delete session
// //   const handleDeleteSession = async (sessionId) => {
// //     if (!window.confirm('Are you sure you want to delete this session?')) {
// //       return;
// //     }
    
// //     setLoading(true);
// //     setError('');
    
// //     try {
// //       const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions/${sessionId}`, {
// //         method: 'DELETE',
// //         credentials: 'include',
// //       });
      
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         throw new Error(errorData.message || 'Failed to delete session');
// //       }
      
// //       // Refresh event data
// //       if (onRefresh) {
// //         await onRefresh();
// //       }
      
// //     } catch (err) {
// //       setError(`Error deleting session: ${err.message}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   // Handle edit session click
// //   const handleEditSession = (session) => {
// //     setSelectedSession(session);
// //     setShowSessionForm(true);
// //   };
  
// //   return (
// //     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
// //       {/* Header with banner image */}
// //       <div className="relative h-64 bg-purple-100">
// //         {event.coverImage ? (
// //           <img
// //             src={event.coverImage}
// //             alt={event.title}
// //             className="w-full h-full object-cover"
// //           />
// //         ) : (
// //           <div className="w-full h-full flex items-center justify-center">
// //             <Calendar className="w-24 h-24 text-purple-300" />
// //           </div>
// //         )}
        
// //         <div className="absolute top-4 left-4">
// //           <button
// //             onClick={onBack}
// //             className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
// //             title="Back to List"
// //           >
// //             <ChevronLeft className="w-5 h-5 text-gray-600" />
// //           </button>
// //         </div>
        
// //         <div className="absolute top-4 right-4 flex space-x-2">
// //           <button
// //             onClick={onEdit}
// //             className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
// //             title="Edit Event"
// //           >
// //             <Edit className="w-5 h-5 text-blue-600" />
// //           </button>
          
// //           <button
// //             onClick={() => onDelete(event._id)}
// //             className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
// //             title="Delete Event"
// //           >
// //             <Trash className="w-5 h-5 text-red-600" />
// //           </button>
// //         </div>
// //       </div>
      
// //       {/* Event title and status */}
// //       <div className="p-6 border-b">
// //         <div className="flex justify-between items-start">
// //           <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
// //           <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
// //             {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
// //           </span>
// //         </div>
// //       </div>
      
// //       {/* Tabs */}
// //       <div className="border-b">
// //         <nav className="flex">
// //           <button
// //             className={`px-6 py-3 text-sm font-medium border-b-2 ${
// //               tab === 'overview' 
// //                 ? 'border-purple-600 text-purple-600' 
// //                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
// //             }`}
// //             onClick={() => setTab('overview')}
// //           >
// //             Overview
// //           </button>
          
// //           <button
// //             className={`px-6 py-3 text-sm font-medium border-b-2 ${
// //               tab === 'attendees' 
// //                 ? 'border-purple-600 text-purple-600' 
// //                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
// //             }`}
// //             onClick={() => setTab('attendees')}
// //           >
// //             Attendees {event.attendees && `(${event.attendees.length})`}
// //           </button>
          
// //           <button
// //             className={`px-6 py-3 text-sm font-medium border-b-2 ${
// //               tab === 'sessions' 
// //                 ? 'border-purple-600 text-purple-600' 
// //                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
// //             }`}
// //             onClick={() => setTab('sessions')}
// //           >
// //             Sessions {event.sessions && `(${event.sessions.length || 0})`}
// //           </button>
// //         </nav>
// //       </div>
      
// //       {/* Display error if any */}
// //       {error && (
// //         <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
// //           {error}
// //         </div>
// //       )}
      
// //       {/* Tab content */}
// //       <div className="p-6">
// //         {/* Overview tab */}
// //         {tab === 'overview' && (
// //           <div className="space-y-6">
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //               <div className="bg-gray-50 p-4 rounded-lg">
// //                 <div className="flex items-center mb-3">
// //                   <Calendar className="w-5 h-5 text-purple-600 mr-2" />
// //                   <h3 className="text-sm font-medium text-gray-700">Date</h3>
// //                 </div>
// //                 <p className="text-gray-800">
// //                   {formatDate(event.startDate)}
// //                   {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
// //                 </p>
// //               </div>
              
// //               <div className="bg-gray-50 p-4 rounded-lg">
// //                 <div className="flex items-center mb-3">
// //                   <MapPin className="w-5 h-5 text-purple-600 mr-2" />
// //                   <h3 className="text-sm font-medium text-gray-700">Location</h3>
// //                 </div>
// //                 <p className="text-gray-800">{event.location}</p>
// //               </div>
              
// //               <div className="bg-gray-50 p-4 rounded-lg">
// //                 <div className="flex items-center mb-3">
// //                   <Users className="w-5 h-5 text-purple-600 mr-2" />
// //                   <h3 className="text-sm font-medium text-gray-700">Capacity</h3>
// //                 </div>
// //                 <p className="text-gray-800">
// //                   {event.attendees ? event.attendees.length : 0} / {event.capacity} attendees
// //                 </p>
// //                 {event.attendees && event.attendees.length >= event.capacity && (
// //                   <p className="text-xs text-red-600 mt-1">Fully booked</p>
// //                 )}
// //               </div>
// //             </div>
            
// //             {/* Price */}
// //             <div className="border-t pt-4">
// //               <div className="flex items-center mb-2">
// //                 <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
// //                 <h3 className="text-sm font-medium text-gray-700">Price</h3>
// //               </div>
// //               <p className="text-gray-800">
// //                 {event.price === 0 ? 'Free' : `$${event.price?.toFixed(2) || '0.00'}`}
// //               </p>
// //             </div>
            
// //             {/* Description */}
// //             <div className="border-t pt-4">
// //               <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
// //               <div className="prose text-gray-700 max-w-none">
// //                 {event.description}
// //               </div>
// //             </div>
            
// //             {/* Ticket Purchase Button */}
// //             {event.status === 'published' && (
// //               <div className="mt-6">
// //                 <Link
// //                   to={`/events/${event._id}/tickets`}
// //                   className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
// //                 >
// //                   <Ticket className="w-5 h-5 mr-2" />
// //                   {event.defaultTicketPrice === 0 && (!event.ticketTypes || event.ticketTypes.length === 0)
// //                     ? 'Register for Free'
// //                     : 'Get Tickets'}
// //                 </Link>
// //               </div>
// //             )}
            
// //             {/* Tags */}
// //             {event.tags && event.tags.length > 0 && (
// //               <div className="border-t pt-4">
// //                 <div className="flex items-center mb-3">
// //                   <Tag className="w-5 h-5 text-purple-600 mr-2" />
// //                   <h3 className="text-sm font-medium text-gray-700">Tags</h3>
// //                 </div>
// //                 <div className="flex flex-wrap gap-2">
// //                   {event.tags.map((tag, index) => (
// //                     <span 
// //                       key={index} 
// //                       className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
// //                     >
// //                       {tag}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         )}
        
// //         {/* Attendees tab */}
// //         {tab === 'attendees' && (
// //           <div>
// //             <div className="flex justify-between items-center mb-4">
// //               <h3 className="text-lg font-medium text-gray-800">Registered Attendees</h3>
              
// //               {event.attendees && event.attendees.length > 0 && (
// //                 <button className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-lg hover:bg-purple-200">
// //                   Export List
// //                 </button>
// //               )}
// //             </div>
            
// //             {!event.attendees || event.attendees.length === 0 ? (
// //               <div className="bg-gray-50 p-6 rounded-lg text-center">
// //                 <p className="text-gray-600">No attendees have registered for this event yet.</p>
// //               </div>
// //             ) : (
// //               <div className="overflow-x-auto">
// //                 <table className="min-w-full bg-white">
// //                   <thead className="bg-gray-50">
// //                     <tr>
// //                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
// //                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
// //                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
// //                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="divide-y divide-gray-200">
// //                     {/* Note: In a real app, you would fetch attendee details */}
// //                     {event.attendees.map((attendee, index) => (
// //                       <tr key={attendee._id || index}>
// //                         <td className="py-3 px-4 whitespace-nowrap">
// //                           <div className="flex items-center">
// //                             <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
// //                               <User className="w-4 h-4 text-purple-600" />
// //                             </div>
// //                             <span className="text-sm font-medium text-gray-900">
// //                               {attendee.fullName || 'Attendee Name'}
// //                             </span>
// //                           </div>
// //                         </td>
// //                         <td className="py-3 px-4 whitespace-nowrap">
// //                           <div className="flex items-center">
// //                             <Mail className="w-4 h-4 text-gray-400 mr-2" />
// //                             <span className="text-sm text-gray-600">
// //                               {attendee.email || 'attendee@example.com'}
// //                             </span>
// //                           </div>
// //                         </td>
// //                         <td className="py-3 px-4 whitespace-nowrap">
// //                           <span className="text-sm text-gray-600">
// //                             {attendee.organization || 'N/A'}
// //                           </span>
// //                         </td>
// //                         <td className="py-3 px-4 whitespace-nowrap">
// //                           <span className="text-sm text-gray-600">
// //                             {/* In a real app, you would use the actual registration date */}
// //                             {new Date().toLocaleDateString()}
// //                           </span>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </div>
// //         )}
        
// //         {/* Sessions tab */}
// //         {tab === 'sessions' && (
// //           <div>
// //             {/* Sessions header with add button */}
// //             <div className="flex justify-between items-center mb-4">
// //               <h3 className="text-lg font-medium text-gray-800">Event Sessions</h3>
              
// //               {!showSessionForm && (
// //                 <button 
// //                   onClick={() => {
// //                     setSelectedSession(null);
// //                     setShowSessionForm(true);
// //                   }}
// //                   className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center"
// //                   disabled={loading}
// //                 >
// //                   <Plus className="w-4 h-4 mr-2" />
// //                   Add Session
// //                 </button>
// //               )}
// //             </div>
            
// //             {/* Session form (add/edit) */}
// //             {showSessionForm && (
// //               <div className="mb-6">
// //                 <SessionForm 
// //                   session={selectedSession}
// //                   eventId={event._id}
// //                   availableSpeakers={availableSpeakers}
// //                   onSubmit={selectedSession ? handleUpdateSession : handleAddSession}
// //                   onCancel={() => {
// //                     setShowSessionForm(false);
// //                     setSelectedSession(null);
// //                   }}
// //                 />
// //               </div>
// //             )}
            
// //             {/* Session list */}
// //             <SessionList 
// //               sessions={event.sessions || []}
// //               onEdit={handleEditSession}
// //               onDelete={handleDeleteSession}
// //             />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default EventDetails;

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   Calendar, 
//   MapPin, 
//   Users, 
//   DollarSign, 
//   Tag, 
//   Edit, 
//   Trash, 
//   ChevronLeft, 
//   User, 
//   Mail, 
//   Clock, 
//   Plus, 
//   Ticket 
// } from 'lucide-react';
// import SessionList from './SessionList';
// import SessionForm from './SessionForm';

// const EventDetails = ({ event, onEdit, onDelete, onBack, onRefresh }) => {
//   const [tab, setTab] = useState('overview'); // 'overview', 'attendees', 'sessions'
//   const [showSessionForm, setShowSessionForm] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [availableSpeakers, setAvailableSpeakers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [attendeeDetails, setAttendeeDetails] = useState([]);
  
//   // Fetch available speakers when component mounts
//   useEffect(() => {
//     fetchAvailableSpeakers();
//   }, []);
  
//   // Fetch attendee details when event changes or tab switches to attendees
//   useEffect(() => {
//     if (event && event._id && tab === 'attendees') {
//       fetchAttendeeDetails();
//     }
//   }, [event, tab]);
  
//   // Helper function to format date
//   const formatDate = (dateString) => {
//     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };
  
//   // Format time (for sessions)
//   const formatTime = (dateString) => {
//     const options = { hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleTimeString(undefined, options);
//   };
  
//   // Status badge color mapping
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
  
//   // Fetch speakers that can be assigned to sessions
//   const fetchAvailableSpeakers = async () => {
//     try {
//       // Use the dedicated endpoint for available speakers
//       const response = await fetch('http://localhost:5000/api/users/speakers/available', {
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         // If API fails, use mock data temporarily
//         console.warn('Using mock speaker data due to API error');
//         const mockSpeakers = [
//           { _id: 'mock1', fullName: 'John Smith', organization: 'Tech Corp' },
//           { _id: 'mock2', fullName: 'Sarah Johnson', organization: 'Design Studio' },
//           { _id: 'mock3', fullName: 'Michael Chen', organization: 'AI Research' }
//         ];
//         setAvailableSpeakers(mockSpeakers);
//         return;
//       }
      
//       const data = await response.json();
//       setAvailableSpeakers(data.data || []);
//     } catch (err) {
//       console.error('Error fetching speakers:', err);
//       setError('Failed to load available speakers: ' + err.message);
//     }
//   };
  
//   // Fetch detailed information about event attendees
//   const fetchAttendeeDetails = async () => {
//     try {
//       setLoading(true);
      
//       // If event doesn't have attendees or is empty, exit early
//       if (!event.attendees || event.attendees.length === 0) {
//         setAttendeeDetails([]);
//         setLoading(false);
//         return;
//       }
      
//       // Fetch the tickets for this event to get registration details
//       const ticketsResponse = await fetch(`http://localhost:5000/api/events/${event._id}/attendees`, {
//         credentials: 'include'
//       });
      
//       if (!ticketsResponse.ok) {
//         // If this endpoint doesn't exist yet, we'll use a fallback method
//         // to get basic user information from the attendee IDs
        
//         // This is a fallback approach - fetch each user's details individually
//         const attendeePromises = event.attendees.map(async (attendeeId) => {
//           try {
//             const userResponse = await fetch(`http://localhost:5000/api/users/${attendeeId}`, {
//               credentials: 'include'
//             });
            
//             if (userResponse.ok) {
//               const userData = await userResponse.json();
//               return {
//                 ...userData.data,
//                 registrationDate: new Date() // Placeholder since we don't have actual registration date
//               };
//             }
//             return {
//               _id: attendeeId,
//               fullName: 'Unknown User',
//               email: 'unknown@example.com',
//               organization: 'N/A',
//               registrationDate: new Date()
//             };
//           } catch (error) {
//             console.error(`Error fetching attendee ${attendeeId}:`, error);
//             return {
//               _id: attendeeId,
//               fullName: 'Error Loading User',
//               email: 'error@example.com',
//               organization: 'N/A',
//               registrationDate: new Date()
//             };
//           }
//         });
        
//         const attendees = await Promise.all(attendeePromises);
//         setAttendeeDetails(attendees);
//         setLoading(false);
//         return;
//       }
      
//       // If the tickets endpoint works, use it to get detailed information
//       const ticketsData = await ticketsResponse.json();
//       const attendeeData = ticketsData.data || [];
      
//       setAttendeeDetails(attendeeData.map(ticket => ({
//         _id: ticket.attendee._id,
//         fullName: ticket.attendee.fullName,
//         email: ticket.attendee.email,
//         organization: ticket.attendee.organization || 'N/A',
//         registrationDate: new Date(ticket.purchaseDate),
//         ticketType: ticket.ticketType.name,
//         ticketId: ticket._id
//       })));
      
//     } catch (err) {
//       console.error('Error fetching attendee details:', err);
//       setError('Failed to load attendee information: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Add session to event
//   const handleAddSession = async (sessionData) => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(sessionData),
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to add session');
//       }
      
//       // Clear form and hide it
//       setShowSessionForm(false);
//       setSelectedSession(null);
      
//       // Refresh event data to include the new session
//       if (onRefresh) {
//         await onRefresh();
//       }
      
//     } catch (err) {
//       setError(`Error adding session: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Update existing session
//   const handleUpdateSession = async (sessionData) => {
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions/${selectedSession._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(sessionData),
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update session');
//       }
      
//       // Clear form and hide it
//       setShowSessionForm(false);
//       setSelectedSession(null);
      
//       // Refresh event data
//       if (onRefresh) {
//         await onRefresh();
//       }
      
//     } catch (err) {
//       setError(`Error updating session: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Delete session
//   const handleDeleteSession = async (sessionId) => {
//     if (!window.confirm('Are you sure you want to delete this session?')) {
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions/${sessionId}`, {
//         method: 'DELETE',
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to delete session');
//       }
      
//       // Refresh event data
//       if (onRefresh) {
//         await onRefresh();
//       }
      
//     } catch (err) {
//       setError(`Error deleting session: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle edit session click
//   const handleEditSession = (session) => {
//     setSelectedSession(session);
//     setShowSessionForm(true);
//   };
  
//   return (
//     <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//       {/* Header with banner image */}
//       <div className="relative h-64 bg-purple-100">
//         {event.coverImage ? (
//           <img
//             src={event.coverImage}
//             alt={event.title}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center">
//             <Calendar className="w-24 h-24 text-purple-300" />
//           </div>
//         )}
        
//         <div className="absolute top-4 left-4">
//           <button
//             onClick={onBack}
//             className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
//             title="Back to List"
//           >
//             <ChevronLeft className="w-5 h-5 text-gray-600" />
//           </button>
//         </div>
        
//         <div className="absolute top-4 right-4 flex space-x-2">
//           <button
//             onClick={onEdit}
//             className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
//             title="Edit Event"
//           >
//             <Edit className="w-5 h-5 text-blue-600" />
//           </button>
          
//           <button
//             onClick={() => onDelete(event._id)}
//             className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
//             title="Delete Event"
//           >
//             <Trash className="w-5 h-5 text-red-600" />
//           </button>
//         </div>
//       </div>
      
//       {/* Event title and status */}
//       <div className="p-6 border-b">
//         <div className="flex justify-between items-start">
//           <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
//           <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
//             {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
//           </span>
//         </div>
//       </div>
      
//       {/* Tabs */}
//       <div className="border-b">
//         <nav className="flex">
//           <button
//             className={`px-6 py-3 text-sm font-medium border-b-2 ${
//               tab === 'overview' 
//                 ? 'border-purple-600 text-purple-600' 
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//             onClick={() => setTab('overview')}
//           >
//             Overview
//           </button>
          
//           <button
//             className={`px-6 py-3 text-sm font-medium border-b-2 ${
//               tab === 'attendees' 
//                 ? 'border-purple-600 text-purple-600' 
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//             onClick={() => setTab('attendees')}
//           >
//             Attendees {event.attendees ? `(${event.attendees.length})` : '(0)'}
//           </button>
          
//           <button
//             className={`px-6 py-3 text-sm font-medium border-b-2 ${
//               tab === 'sessions' 
//                 ? 'border-purple-600 text-purple-600' 
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//             onClick={() => setTab('sessions')}
//           >
//             Sessions {event.sessions ? `(${event.sessions.length || 0})` : '(0)'}
//           </button>
//         </nav>
//       </div>
      
//       {/* Display error if any */}
//       {error && (
//         <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
//           {error}
//         </div>
//       )}
      
//       {/* Tab content */}
//       <div className="p-6">
//         {/* Overview tab */}
//         {tab === 'overview' && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="flex items-center mb-3">
//                   <Calendar className="w-5 h-5 text-purple-600 mr-2" />
//                   <h3 className="text-sm font-medium text-gray-700">Date</h3>
//                 </div>
//                 <p className="text-gray-800">
//                   {formatDate(event.startDate)}
//                   {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
//                 </p>
//               </div>
              
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="flex items-center mb-3">
//                   <MapPin className="w-5 h-5 text-purple-600 mr-2" />
//                   <h3 className="text-sm font-medium text-gray-700">Location</h3>
//                 </div>
//                 <p className="text-gray-800">{event.location}</p>
//               </div>
              
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="flex items-center mb-3">
//                   <Users className="w-5 h-5 text-purple-600 mr-2" />
//                   <h3 className="text-sm font-medium text-gray-700">Capacity</h3>
//                 </div>
//                 <p className="text-gray-800">
//                   {event.attendees ? event.attendees.length : 0} / {event.capacity} attendees
//                 </p>
//                 {event.attendees && event.attendees.length >= event.capacity && (
//                   <p className="text-xs text-red-600 mt-1">Fully booked</p>
//                 )}
//               </div>
//             </div>
            
//             {/* Price */}
//             <div className="border-t pt-4">
//               <div className="flex items-center mb-2">
//                 <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
//                 <h3 className="text-sm font-medium text-gray-700">Price</h3>
//               </div>
//               <p className="text-gray-800">
//                 {event.price === 0 ? 'Free' : `$${event.price?.toFixed(2) || '0.00'}`}
//               </p>
//             </div>
            
//             {/* Description */}
//             <div className="border-t pt-4">
//               <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
//               <div className="prose text-gray-700 max-w-none">
//                 {event.description}
//               </div>
//             </div>
            
//             {/* Ticket Purchase Button */}
//             {event.status === 'published' && (
//               <div className="mt-6">
//                 <Link
//                   to={`/events/${event._id}/tickets`}
//                   className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                 >
//                   <Ticket className="w-5 h-5 mr-2" />
//                   {event.defaultTicketPrice === 0 && (!event.ticketTypes || event.ticketTypes.length === 0)
//                     ? 'Register for Free'
//                     : 'Get Tickets'}
//                 </Link>
//               </div>
//             )}
            
//             {/* Tags */}
//             {event.tags && event.tags.length > 0 && (
//               <div className="border-t pt-4">
//                 <div className="flex items-center mb-3">
//                   <Tag className="w-5 h-5 text-purple-600 mr-2" />
//                   <h3 className="text-sm font-medium text-gray-700">Tags</h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {event.tags.map((tag, index) => (
//                     <span 
//                       key={index} 
//                       className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
        
//         {/* Attendees tab */}
//         {tab === 'attendees' && (
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-medium text-gray-800">Registered Attendees</h3>
              
//               {event.attendees && event.attendees.length > 0 && (
//                 <button className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-lg hover:bg-purple-200">
//                   Export List
//                 </button>
//               )}
//             </div>
            
//             {loading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//               </div>
//             ) : !event.attendees || event.attendees.length === 0 ? (
//               <div className="bg-gray-50 p-6 rounded-lg text-center">
//                 <p className="text-gray-600">No attendees have registered for this event yet.</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full bg-white">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
//                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
//                       <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Type</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {attendeeDetails.length > 0 ? (
//                       attendeeDetails.map((attendee) => (
//                         <tr key={attendee._id}>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
//                                 <User className="w-4 h-4 text-purple-600" />
//                               </div>
//                               <span className="text-sm font-medium text-gray-900">
//                                 {attendee.fullName}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <Mail className="w-4 h-4 text-gray-400 mr-2" />
//                               <span className="text-sm text-gray-600">
//                                 {attendee.email}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <span className="text-sm text-gray-600">
//                               {attendee.organization || 'N/A'}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <span className="text-sm text-gray-600">
//                               {attendee.registrationDate ? new Date(attendee.registrationDate).toLocaleDateString() : 'N/A'}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                               {attendee.ticketType || 'Standard'}
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       // Fallback to using just the attendee IDs if no detailed information is available
//                       event.attendees.map((attendeeId, index) => (
//                         <tr key={attendeeId || index}>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
//                                 <User className="w-4 h-4 text-purple-600" />
//                               </div>
//                               <span className="text-sm font-medium text-gray-900">
//                                 Attendee #{index + 1}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <Mail className="w-4 h-4 text-gray-400 mr-2" />
//                               <span className="text-sm text-gray-600">
//                                 Loading...
//                               </span>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <span className="text-sm text-gray-600">N/A</span>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <span className="text-sm text-gray-600">N/A</span>
//                           </td>
//                           <td className="py-3 px-4 whitespace-nowrap">
//                             <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                               Standard
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}
        
//         {/* Sessions tab */}
//         {tab === 'sessions' && (
//           <div>
//             {/* Sessions header with add button */}
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-medium text-gray-800">Event Sessions</h3>
              
//               {!showSessionForm && (
//                 <button 
//                   onClick={() => {
//                     setSelectedSession(null);
//                     setShowSessionForm(true);
//                   }}
//                   className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center"
//                   disabled={loading}
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Session
//                 </button>
//               )}
//             </div>
            
//             {/* Session form (add/edit) */}
//             {showSessionForm && (
//               <div className="mb-6">
//                 <SessionForm 
//                   session={selectedSession}
//                   eventId={event._id}
//                   availableSpeakers={availableSpeakers}
//                   onSubmit={selectedSession ? handleUpdateSession : handleAddSession}
//                   onCancel={() => {
//                     setShowSessionForm(false);
//                     setSelectedSession(null);
//                   }}
//                 />
//               </div>
//             )}
            
//             {/* Session list */}
//             <SessionList 
//               sessions={event.sessions || []}
//               onEdit={handleEditSession}
//               onDelete={handleDeleteSession}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EventDetails;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Tag, 
  Edit, 
  Trash, 
  ChevronLeft, 
  User, 
  Mail, 
  Clock, 
  Plus, 
  Ticket 
} from 'lucide-react';
import SessionList from './SessionList';
import SessionForm from './SessionForm';

const EventDetails = ({ event, onEdit, onDelete, onBack, onRefresh }) => {
  const [tab, setTab] = useState('overview'); // 'overview', 'attendees', 'sessions'
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [availableSpeakers, setAvailableSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendeeDetails, setAttendeeDetails] = useState([]);
  
  // Fetch available speakers when component mounts
  useEffect(() => {
    fetchAvailableSpeakers();
  }, []);
  
  // Fetch attendee details when event changes or tab switches to attendees
  useEffect(() => {
    if (event && event._id && tab === 'attendees') {
      fetchAttendeeDetails();
    }
  }, [event, tab]);
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time (for sessions)
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Status badge color mapping
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
  
  // Fetch speakers that can be assigned to sessions
  const fetchAvailableSpeakers = async () => {
    try {
      // Use the dedicated endpoint for available speakers
      const response = await fetch('http://localhost:5000/api/users/speakers/available', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // If API fails, use mock data temporarily
        console.warn('Using mock speaker data due to API error');
        const mockSpeakers = [
          { _id: 'mock1', fullName: 'John Smith', organization: 'Tech Corp' },
          { _id: 'mock2', fullName: 'Sarah Johnson', organization: 'Design Studio' },
          { _id: 'mock3', fullName: 'Michael Chen', organization: 'AI Research' }
        ];
        setAvailableSpeakers(mockSpeakers);
        return;
      }
      
      const data = await response.json();
      setAvailableSpeakers(data.data || []);
    } catch (err) {
      console.error('Error fetching speakers:', err);
      setError('Failed to load available speakers: ' + err.message);
    }
  };
  
  // Fetch detailed information about event attendees
  const fetchAttendeeDetails = async () => {
    try {
      setLoading(true);
      
      // If event doesn't have attendees or is empty, exit early
      if (!event.attendees || event.attendees.length === 0) {
        setAttendeeDetails([]);
        setLoading(false);
        return;
      }
      
      console.log(`Fetching attendees for event: ${event._id}`);
      
      // Fetch attendee details from our dedicated endpoint
      const response = await fetch(`http://localhost:5000/api/events/${event._id}/attendees`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch attendees: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch attendees: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Attendee data received:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load attendees');
      }
      
      // Set the attendee details directly from the response
      setAttendeeDetails(data.data || []);
    } catch (err) {
      console.error('Error fetching attendee details:', err);
      setError('Failed to load attendee information: ' + err.message);
      
      // Fallback: Create placeholder data based on attendee IDs
      if (event.attendees && event.attendees.length > 0) {
        const placeholderAttendees = event.attendees.map((attendeeId, index) => ({
          _id: attendeeId,
          fullName: `Attendee #${index + 1}`,
          email: `attendee${index + 1}@example.com`,
          organization: 'N/A',
          registrationDate: new Date(),
          ticketType: 'Standard'
        }));
        setAttendeeDetails(placeholderAttendees);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Add session to event
  const handleAddSession = async (sessionData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add session');
      }
      
      // Clear form and hide it
      setShowSessionForm(false);
      setSelectedSession(null);
      
      // Refresh event data to include the new session
      if (onRefresh) {
        await onRefresh();
      }
      
    } catch (err) {
      setError(`Error adding session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update existing session
  const handleUpdateSession = async (sessionData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions/${selectedSession._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update session');
      }
      
      // Clear form and hide it
      setShowSessionForm(false);
      setSelectedSession(null);
      
      // Refresh event data
      if (onRefresh) {
        await onRefresh();
      }
      
    } catch (err) {
      setError(`Error updating session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete session
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/events/${event._id}/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete session');
      }
      
      // Refresh event data
      if (onRefresh) {
        await onRefresh();
      }
      
    } catch (err) {
      setError(`Error deleting session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit session click
  const handleEditSession = (session) => {
    setSelectedSession(session);
    setShowSessionForm(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with banner image */}
      <div className="relative h-64 bg-purple-100">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-24 h-24 text-purple-300" />
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <button
            onClick={onBack}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
            title="Back to List"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
            title="Edit Event"
          >
            <Edit className="w-5 h-5 text-blue-600" />
          </button>
          
          <button
            onClick={() => onDelete(event._id)}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
            title="Delete Event"
          >
            <Trash className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
      
      {/* Event title and status */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              tab === 'overview' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              tab === 'attendees' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTab('attendees')}
          >
            Attendees {event.attendees ? `(${event.attendees.length})` : '(0)'}
          </button>
          
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              tab === 'sessions' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTab('sessions')}
          >
            Sessions {event.sessions ? `(${event.sessions.length || 0})` : '(0)'}
          </button>
        </nav>
      </div>
      
      {/* Display error if any */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Tab content */}
      <div className="p-6">
        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Date</h3>
                </div>
                <p className="text-gray-800">
                  {formatDate(event.startDate)}
                  {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Location</h3>
                </div>
                <p className="text-gray-800">{event.location}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Capacity</h3>
                </div>
                <p className="text-gray-800">
                  {event.attendees ? event.attendees.length : 0} / {event.capacity} attendees
                </p>
                {event.attendees && event.attendees.length >= event.capacity && (
                  <p className="text-xs text-red-600 mt-1">Fully booked</p>
                )}
              </div>
            </div>
            
            {/* Price */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-700">Price</h3>
              </div>
              <p className="text-gray-800">
                {event.price === 0 ? 'Free' : `$${event.price?.toFixed(2) || '0.00'}`}
              </p>
            </div>
            
            {/* Description */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
              <div className="prose text-gray-700 max-w-none">
                {event.description}
              </div>
            </div>
            
            {/* Ticket Purchase Button */}
            {event.status === 'published' && (
              <div className="mt-6">
                <Link
                  to={`/events/${event._id}/tickets`}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Ticket className="w-5 h-5 mr-2" />
                  {event.defaultTicketPrice === 0 && (!event.ticketTypes || event.ticketTypes.length === 0)
                    ? 'Register for Free'
                    : 'Get Tickets'}
                </Link>
              </div>
            )}
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  <Tag className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Attendees tab */}
        {tab === 'attendees' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Registered Attendees</h3>
              
              {event.attendees && event.attendees.length > 0 && (
                <button className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-lg hover:bg-purple-200">
                  Export List
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : !event.attendees || event.attendees.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No attendees have registered for this event yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendeeDetails.length > 0 ? (
                      attendeeDetails.map((attendee) => (
                        <tr key={attendee._id}>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {attendee.fullName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {attendee.email}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {attendee.organization || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {attendee.registrationDate ? new Date(attendee.registrationDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {attendee.ticketType || 'Standard'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-gray-500">
                          {event.attendees && event.attendees.length > 0 ? 
                            "Loading attendee information..." : 
                            "No attendees registered yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Sessions tab */}
        {tab === 'sessions' && (
          <div>
            {/* Sessions header with add button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Event Sessions</h3>
              
              {!showSessionForm && (
                <button 
                  onClick={() => {
                    setSelectedSession(null);
                    setShowSessionForm(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session
                </button>
              )}
            </div>
            
            {/* Session form (add/edit) */}
            {showSessionForm && (
              <div className="mb-6">
                <SessionForm 
                  session={selectedSession}
                  eventId={event._id}
                  availableSpeakers={availableSpeakers}
                  onSubmit={selectedSession ? handleUpdateSession : handleAddSession}
                  onCancel={() => {
                    setShowSessionForm(false);
                    setSelectedSession(null);
                  }}
                />
              </div>
            )}
            
            {/* Session list */}
            <SessionList 
              sessions={event.sessions || []}
              onEdit={handleEditSession}
              onDelete={handleDeleteSession}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;