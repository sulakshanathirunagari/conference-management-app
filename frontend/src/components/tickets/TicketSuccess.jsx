// // src/components/tickets/TicketSuccess.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { Check, Download, Calendar, MapPin, Clock } from 'lucide-react';

// const TicketSuccess = () => {
//   const [ticket, setTicket] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const { id: ticketId } = useParams();

//   useEffect(() => {
//     const fetchTicket = async () => {
//       try {
//         console.log("Fetching ticket with ID:", ticketId);
        
//         // Check if ticketId exists and is properly formatted
//         if (!ticketId) {
//           throw new Error('No ticket ID provided');
//         }

//         const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           credentials: 'include'
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           console.error("Error response from server:", response.status, errorData);
//           throw new Error(`Failed to fetch ticket details: ${errorData.message || response.statusText}`);
//         }

//         const data = await response.json();
//         console.log("Ticket data received:", data);
        
//         if (!data || !data.data) {
//           throw new Error('Invalid ticket data received');
//         }
        
//         setTicket(data.data);
//       } catch (err) {
//         console.error("Error fetching ticket:", err);
//         setError(err.message || 'An error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTicket();
//   }, [ticketId]);

//   const handleDownloadTicket = () => {
//     if (!ticket) return;
    
//     // Create a printable ticket in a new window
//     const printWindow = window.open('', '_blank');
    
//     if (!printWindow) {
//       alert('Please allow pop-ups to download your ticket');
//       return;
//     }
    
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Event Ticket - ${ticket.event.title}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .ticket { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
//             .header { text-align: center; margin-bottom: 20px; }
//             .qr-code { text-align: center; margin: 20px 0; }
//             .qr-code img { max-width: 200px; }
//             .details { margin-top: 20px; }
//             .detail { margin-bottom: 10px; }
//             .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
//             @media print {
//               body { padding: 0; }
//               .ticket { border: none; }
//               .print-button { display: none; }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="ticket">
//             <div class="header">
//               <h1>${ticket.event.title}</h1>
//               <p>${new Date(ticket.event.startDate).toLocaleDateString()} - ${ticket.ticketType.name}</p>
//             </div>
//             <div class="qr-code">
//               <img src="${ticket.qrCodeData}" alt="Ticket QR Code" />
//             </div>
//             <div class="details">
//               <div class="detail"><strong>Ticket Type:</strong> ${ticket.ticketType.name}</div>
//               <div class="detail"><strong>Date:</strong> ${new Date(ticket.event.startDate).toLocaleDateString(undefined, { 
//                 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
//               })}</div>
//               <div class="detail"><strong>Time:</strong> ${new Date(ticket.event.startDate).toLocaleTimeString([], { 
//                 hour: '2-digit', minute: '2-digit' 
//               })}</div>
//               <div class="detail"><strong>Location:</strong> ${ticket.event.location}</div>
//               <div class="detail"><strong>Ticket ID:</strong> ${ticket._id}</div>
//             </div>
//             <div class="footer">
//               <p>Please present this ticket (printed or on your device) at the event entrance.</p>
//             </div>
//             <div class="print-button" style="text-align: center; margin-top: 30px;">
//               <button onclick="window.print()">Print Ticket</button>
//             </div>
//           </div>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   // Show error state with retry option
//   if (error) {
//     return (
//       <div className="max-w-3xl mx-auto py-8 px-4">
//         <div className="p-6 bg-red-50 text-red-700 rounded-lg">
//           <h2 className="text-xl font-bold mb-3">Error Loading Ticket</h2>
//           <p className="mb-4">{error}</p>
//           <p className="mb-4">Your payment was successful, but we encountered a problem displaying your ticket details.</p>
//           <div className="flex space-x-4">
//             <button 
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               Try Again
//             </button>
//             <Link 
//               to="/tickets/my-tickets" 
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//             >
//               View All My Tickets
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show ticket information if loaded successfully
//   if (!ticket) {
//     return (
//       <div className="max-w-3xl mx-auto py-8 px-4">
//         <div className="p-6 bg-yellow-50 text-yellow-700 rounded-lg">
//           <h2 className="text-xl font-bold mb-3">Ticket Not Found</h2>
//           <p className="mb-4">We couldn't find the ticket you're looking for.</p>
//           <Link 
//             to="/tickets/my-tickets" 
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
//           >
//             View All My Tickets
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // Success view with ticket details
//   return (
//     <div className="max-w-3xl mx-auto py-8 px-4">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="bg-green-50 p-6 flex items-start">
//           <div className="bg-green-100 rounded-full p-2 mr-4">
//             <Check className="w-6 h-6 text-green-600" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">
//               {ticket.ticketType.price > 0 ? 'Payment Successful!' : 'Registration Complete!'}
//             </h2>
//             <p className="text-gray-600 mt-1">
//               Your {ticket.ticketType.price > 0 ? 'ticket' : 'registration'} for <span className="font-medium">{ticket.event.title}</span> has been confirmed.
//             </p>
//           </div>
//         </div>
        
//         <div className="p-6">
//           <div className="mb-6 flex justify-between items-start">
//             <div>
//               <h3 className="text-lg font-medium text-gray-800">Your Ticket</h3>
//               <p className="text-sm text-gray-600">
//                 {ticket.ticketType.name} - {ticket.ticketType.price > 0 ? `$${ticket.ticketType.price.toFixed(2)}` : 'FREE'}
//               </p>
//             </div>
//             <button 
//               onClick={handleDownloadTicket}
//               className="flex items-center px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Download Ticket
//             </button>
//           </div>
          
//           <div className="border rounded-lg overflow-hidden mb-6">
//             <div className="bg-gray-50 px-4 py-3 border-b">
//               <span className="font-medium text-gray-700">Event Details</span>
//             </div>
//             <div className="p-4 space-y-3">
//               <div className="flex items-start">
//                 <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
//                 <div>
//                   <div className="font-medium">
//                     {new Date(ticket.event.startDate).toLocaleDateString(undefined, { 
//                       weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
//                     })}
//                   </div>
//                   <div className="text-sm text-gray-600 mt-1">
//                     {new Date(ticket.event.startDate).toLocaleTimeString([], { 
//                       hour: '2-digit', minute: '2-digit' 
//                     })}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex items-start">
//                 <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
//                 <div>
//                   <div className="font-medium">{ticket.event.location}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="border rounded-lg overflow-hidden mb-6">
//             <div className="bg-gray-50 px-4 py-3 border-b">
//               <span className="font-medium text-gray-700">QR Code</span>
//             </div>
//             <div className="p-6 flex flex-col items-center">
//               <p className="text-sm text-gray-600 mb-4">
//                 Present this QR code at the event entrance for check-in
//               </p>
//               <div className="bg-white p-3 border rounded-lg">
//                 <img src={ticket.qrCodeData} alt="Ticket QR Code" className="w-48 h-48" />
//               </div>
//               <p className="text-xs text-gray-500 mt-4">
//                 Ticket ID: {ticket._id}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex justify-center space-x-4">
//             <Link
//               to="/tickets/my-tickets"
//               className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//             >
//               View My Tickets
//             </Link>
//             <Link
//               to="/attendee/dashboard"
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//             >
//               Browse More Events
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TicketSuccess;

// src/components/tickets/TicketSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Download, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';

const TicketSuccess = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { id: ticketId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the current user
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData.user);
        }
        
        console.log("Fetching ticket with ID:", ticketId);
        
        // Check if ticketId exists and is properly formatted
        if (!ticketId) {
          throw new Error('No ticket ID provided');
        }

        const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response from server:", response.status, errorData);
          throw new Error(`Failed to fetch ticket details: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log("Ticket data received:", data);
        
        if (!data || !data.data) {
          throw new Error('Invalid ticket data received');
        }
        
        setTicket(data.data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId]);

  const handleDownloadTicket = () => {
    if (!ticket || !currentUser) return;
    
    // Create a printable ticket in a new window
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to download your ticket');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Event Ticket - ${ticket.event.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ticket { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .qr-code { text-align: center; margin: 20px 0; }
            .qr-code img { max-width: 200px; }
            .details { margin-top: 20px; }
            .detail { margin-bottom: 10px; }
            .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
            @media print {
              body { padding: 0; }
              .ticket { border: none; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>${ticket.event.title}</h1>
              <p>${new Date(ticket.event.startDate).toLocaleDateString()} - ${ticket.ticketType.name}</p>
            </div>
            <div class="qr-code">
              <img src="${ticket.qrCodeData}" alt="Ticket QR Code" />
            </div>
            <div class="details">
              <div class="detail"><strong>Ticket Type:</strong> ${ticket.ticketType.name}</div>
              <div class="detail"><strong>Attendee:</strong> ${currentUser.fullName}</div>
              <div class="detail"><strong>Date:</strong> ${new Date(ticket.event.startDate).toLocaleDateString(undefined, { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}</div>
              <div class="detail"><strong>Time:</strong> ${new Date(ticket.event.startDate).toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit' 
              })}</div>
              <div class="detail"><strong>Location:</strong> ${ticket.event.location}</div>
              <div class="detail"><strong>Ticket ID:</strong> ${ticket._id}</div>
              <div class="detail"><strong>Purchase Date:</strong> ${new Date(ticket.purchaseDate).toLocaleDateString()}</div>
            </div>
            <div class="footer">
              <p>Please present this ticket (printed or on your device) at the event entrance.</p>
            </div>
            <div class="print-button" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print()">Print Ticket</button>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Error Loading Ticket</h2>
          <p className="mb-4">{error}</p>
          <p className="mb-4">Your payment was successful, but we encountered a problem displaying your ticket details.</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
            <Link 
              to="/tickets/my-tickets" 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              View All My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="p-6 bg-yellow-50 text-yellow-700 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Ticket Not Found</h2>
          <p className="mb-4">We couldn't find the ticket you're looking for.</p>
          <Link 
            to="/tickets/my-tickets" 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
          >
            View All My Tickets
          </Link>
        </div>
      </div>
    );
  }

  // Not authorized to view this ticket
  if (currentUser && ticket.attendee && ticket.attendee._id !== currentUser._id) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-3 text-center">Not Authorized</h2>
          <p className="mb-4 text-center">You are not authorized to view this ticket.</p>
          <div className="flex justify-center">
            <Link 
              to="/tickets/my-tickets" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
            >
              View Your Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success view with ticket details
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-50 p-6 flex items-start">
          <div className="bg-green-100 rounded-full p-2 mr-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {ticket.ticketType.price > 0 ? 'Payment Successful!' : 'Registration Complete!'}
            </h2>
            <p className="text-gray-600 mt-1">
              Your {ticket.ticketType.price > 0 ? 'ticket' : 'registration'} for <span className="font-medium">{ticket.event.title}</span> has been confirmed.
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Your Ticket</h3>
              <p className="text-sm text-gray-600">
                {ticket.ticketType.name} - {ticket.ticketType.price > 0 ? `$${ticket.ticketType.price.toFixed(2)}` : 'FREE'}
              </p>
            </div>
            <button 
              onClick={handleDownloadTicket}
              className="flex items-center px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </button>
          </div>
          
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <span className="font-medium text-gray-700">Event Details</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">
                    {new Date(ticket.event.startDate).toLocaleDateString(undefined, { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(ticket.event.startDate).toLocaleTimeString([], { 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">{ticket.event.location}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <span className="font-medium text-gray-700">QR Code</span>
            </div>
            <div className="p-6 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-4">
                Present this QR code at the event entrance for check-in
              </p>
              <div className="bg-white p-3 border rounded-lg">
                <img src={ticket.qrCodeData} alt="Ticket QR Code" className="w-48 h-48" />
              </div>
              <div className="text-xs text-gray-500 mt-4 text-center">
                <p>Ticket ID: {ticket._id}</p>
                <p className="mt-1">Purchase Date: {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link
              to="/tickets/my-tickets"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              View My Tickets
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSuccess;