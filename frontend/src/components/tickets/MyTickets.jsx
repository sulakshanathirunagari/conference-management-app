// // src/components/tickets/MyTickets.jsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Calendar, MapPin, Clock, Eye, Download } from 'lucide-react';

// const MyTickets = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/tickets/my-tickets', {
//           credentials: 'include',
//         });
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch tickets');
//         }
        
//         const data = await response.json();
//         setTickets(data.data || []);
//       } catch (err) {
//         setError('Error fetching tickets: ' + err.message);
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchTickets();
//   }, []);
  
//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString(undefined, { 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };
  
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="p-4 bg-red-50 text-red-700 rounded-lg">
//         {error}
//       </div>
//     );
//   }
  
//   if (tickets.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow p-8 text-center">
//         <h2 className="text-2xl font-bold text-gray-800 mb-4">You Don't Have Any Tickets Yet</h2>
//         <p className="text-gray-600 mb-6">Browse upcoming events and secure your spot today.</p>
//         <Link 
//           to="/events" 
//           className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
//         >
//           Explore Events
//         </Link>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-6xl mx-auto py-8 px-4">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {tickets.map((ticket) => (
//           <div key={ticket._id} className="bg-white rounded-lg shadow overflow-hidden">
//             {/* Event Banner */}
//             <div className="h-32 bg-gray-200 relative">
//               {ticket.event.coverImage ? (
//                 <img 
//                   src={ticket.event.coverImage} 
//                   alt={ticket.event.title} 
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-purple-100">
//                   <Calendar className="w-12 h-12 text-purple-300" />
//                 </div>
//               )}
              
//               <div className="absolute top-3 right-3">
//                 <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                   {ticket.paymentStatus === 'completed' ? 'Confirmed' : 'Pending'}
//                 </span>
//               </div>
//             </div>
            
//             {/* Ticket Info */}
//             <div className="p-4">
//               <h2 className="font-bold text-lg text-gray-800 mb-2">{ticket.event.title}</h2>
              
//               <div className="space-y-2 mb-4">
//                 <div className="flex items-center text-sm text-gray-600">
//                   <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                   {formatDate(ticket.event.startDate)}
//                 </div>
//                 <div className="flex items-center text-sm text-gray-600">
//                   <Clock className="w-4 h-4 mr-2 text-gray-400" />
//                   {new Date(ticket.event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </div>
//                 <div className="flex items-center text-sm text-gray-600">
//                   <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                   {ticket.event.location}
//                 </div>
//               </div>
              
//               <div className="flex justify-between items-center pt-3 border-t">
//                 <div>
//                   <span className="text-sm font-medium">{ticket.ticketType.name}</span>
//                   <span className="ml-2 text-sm text-gray-600">
//                     {ticket.ticketType.price === 0 ? 'FREE' : `$${ticket.ticketType.price.toFixed(2)}`}
//                   </span>
//                 </div>
                
//                 <div className="flex space-x-2">
//                   <Link 
//                     to={`/tickets/${ticket._id}/success`}
//                     className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
//                     title="View Ticket"
//                   >
//                     <Eye className="w-5 h-5" />
//                   </Link>
                  
//                   {ticket.qrCodeData && (
//                     <button 
//                       onClick={() => {
//                         // Open ticket in new window for printing
//                         const printWindow = window.open('', '_blank');
//                         printWindow.document.write(`
//                           <html>
//                             <head>
//                               <title>Event Ticket - ${ticket.event.title}</title>
//                               <style>
//                                 body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
//                                 .ticket-container { max-width: 400px; margin: 0 auto; }
//                                 .qr-container { margin: 20px 0; }
//                                 .event-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
//                                 .event-details { margin-bottom: 20px; }
//                                 .print-button { margin-top: 20px; }
//                                 @media print {
//                                   .print-button { display: none; }
//                                 }
//                               </style>
//                             </head>
//                             <body>
//                               <div class="ticket-container">
//                                 <div class="event-title">${ticket.event.title}</div>
//                                 <div class="event-details">
//                                   <p>${formatDate(ticket.event.startDate)} at ${new Date(ticket.event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//                                   <p>${ticket.event.location}</p>
//                                 </div>
//                                 <div class="qr-container">
//                                   <img src="${ticket.qrCodeData}" alt="Ticket QR Code" style="max-width: 300px;" />
//                                 </div>
//                                 <p>Ticket ID: ${ticket._id}</p>
//                                 <button class="print-button" onclick="window.print()">Print Ticket</button>
//                               </div>
//                             </body>
//                           </html>
//                         `);
//                         printWindow.document.close();
//                       }}
//                       className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
//                       title="Download Ticket"
//                     >
//                       <Download className="w-5 h-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MyTickets;

// src/components/tickets/MyTickets.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Eye, Download, Users, AlertCircle } from 'lucide-react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Fetch current user and tickets when component mounts
  useEffect(() => {
    const fetchUserAndTickets = async () => {
      try {
        // First get the current user
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData.user);
        }
        
        // Then fetch tickets
        const ticketsResponse = await fetch('http://localhost:5000/api/tickets/my-tickets', {
          credentials: 'include',
        });
        
        if (!ticketsResponse.ok) {
          throw new Error('Failed to fetch tickets');
        }
        
        const data = await ticketsResponse.json();
        console.log("Tickets data:", data);
        setTickets(data.data || []);
      } catch (err) {
        setError('Error fetching tickets: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndTickets();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format ticket purchase date
  const formatPurchaseDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="p-8 bg-yellow-50 rounded-lg text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Not Logged In</h2>
        <p className="text-gray-600 mb-6">Please log in to view your tickets.</p>
        <Link 
          to="/login" 
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
        >
          Log In
        </Link>
      </div>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">You Don't Have Any Tickets Yet</h2>
        <p className="text-gray-600 mb-6">Browse upcoming events and secure your spot today.</p>
        <Link 
          to="/events" 
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
        >
          Explore Events
        </Link>
      </div>
    );
  }
  
  // Group tickets by event for better organization
  const ticketsByEvent = {};
  tickets.forEach(ticket => {
    const eventId = ticket.event._id;
    if (!ticketsByEvent[eventId]) {
      ticketsByEvent[eventId] = [];
    }
    ticketsByEvent[eventId].push(ticket);
  });
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h1>
      
      {Object.entries(ticketsByEvent).map(([eventId, eventTickets]) => {
        // Use the first ticket to get event details
        const event = eventTickets[0].event;
        
        return (
          <div key={eventId} className="mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>You have {eventTickets.length} ticket{eventTickets.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventTickets.map((ticket) => (
                <div key={ticket._id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Event Banner */}
                  <div className="h-32 bg-gray-200 relative">
                    {event.coverImage ? (
                      <img 
                        src={event.coverImage} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100">
                        <Calendar className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {ticket.paymentStatus === 'completed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Ticket Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800">{ticket.ticketType.name}</h3>
                      <span className="text-gray-600">
                        {ticket.ticketType.price === 0 ? 'FREE' : `$${ticket.ticketType.price.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Purchased: {formatPurchaseDate(ticket.purchaseDate)}</p>
                      <p>Ticket ID: {ticket._id.substring(0, 8)}...</p>
                    </div>
                    
                    {ticket.isCheckedIn && (
                      <div className="mb-4 p-2 bg-green-50 text-green-700 text-sm rounded-lg">
                        <p className="flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Checked in at {new Date(ticket.checkInDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-sm font-medium text-gray-700">
                        {event.startDate && new Date(event.startDate) > new Date() ? 'Upcoming' : 'Past Event'}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link 
                          to={`/tickets/${ticket._id}/success`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                          title="View Ticket"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        
                        {ticket.qrCodeData && (
                          <button 
                            onClick={() => {
                              // Open ticket in new window for printing
                              const printWindow = window.open('', '_blank');
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Event Ticket - ${event.title}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                                      .ticket-container { max-width: 400px; margin: 0 auto; }
                                      .qr-container { margin: 20px 0; }
                                      .event-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                                      .event-details { margin-bottom: 20px; }
                                      .print-button { margin-top: 20px; }
                                      @media print {
                                        .print-button { display: none; }
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="ticket-container">
                                      <div class="event-title">${event.title}</div>
                                      <div class="event-details">
                                        <p>${formatDate(event.startDate)} at ${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p>${event.location}</p>
                                        <p>Ticket Type: ${ticket.ticketType.name}</p>
                                        <p>Attendee: ${currentUser.fullName}</p>
                                      </div>
                                      <div class="qr-container">
                                        <img src="${ticket.qrCodeData}" alt="Ticket QR Code" style="max-width: 300px;" />
                                      </div>
                                      <p>Ticket ID: ${ticket._id}</p>
                                      <button class="print-button" onclick="window.print()">Print Ticket</button>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                            title="Download Ticket"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="mt-8 text-center">
        <Link 
          to="/events" 
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
        >
          Explore More Events
        </Link>
      </div>
    </div>
  );
};

export default MyTickets;