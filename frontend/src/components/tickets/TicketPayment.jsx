// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Ticket, CreditCard, Calendar, Clock, MapPin, Check } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// // Initialize Stripe with your publishable key
// const stripePromise = loadStripe('pk_test_51RDyCUIRIJITDAlPac3890XfbvL0jfnB2LFpnmlpgQ9jJBXQk8lvf4fCrN028MJDs3LCasE9U2PmLcl8wRDm5eSq00ewafpovJ');

// // Error Boundary Component for catching and displaying React errors
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, errorMessage: '' };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, errorMessage: error.toString() };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="p-4 bg-red-50 text-red-700 rounded-lg">
//           <h2 className="font-bold mb-2">Something went wrong.</h2>
//           <p>{this.state.errorMessage}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
//           >
//             Try again
//           </button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// // Checkout Form Component
// const CheckoutForm = ({ event, selectedTicket, onSuccess }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [clientSecret, setClientSecret] = useState('');
//   const [ticketId, setTicketId] = useState('');
//   const navigate = useNavigate();

//   const getTicketPrice = () => {
//     // For specific ticket type
//     if (selectedTicket && selectedTicket.price !== undefined) {
//       const price = parseFloat(selectedTicket.price);
//       return isNaN(price) ? 0 : price;
//     }
    
//     // For event price - check both price and defaultTicketPrice fields
//     if (event) {
//       // First check if price field exists
//       if (event.price !== undefined) {
//         const price = parseFloat(event.price);
//         if (!isNaN(price)) return price;
//       }
      
//       // Fall back to defaultTicketPrice
//       if (event.defaultTicketPrice !== undefined) {
//         const price = parseFloat(event.defaultTicketPrice);
//         return isNaN(price) ? 0 : price;
//       }
//     }
    
//     // If no valid price found
//     return 0;
//   };

//   // Determine if this is a free ticket
//   const isFreeTicket = getTicketPrice() === 0;

//   // Get payment intent when ticket is selected
//   useEffect(() => {
//     if (!selectedTicket || !event || !event._id) return;

//     const getPaymentIntent = async () => {
//       console.log("Creating payment intent for:", {
//         eventId: event._id,
//         ticketTypeId: selectedTicket._id,
//         selectedTicket: selectedTicket,
//         price: getTicketPrice()
//       });

//       try {
//         setLoading(true);
        
//         // For free tickets, we don't need a payment intent
//         if (isFreeTicket) {
//           return;
//         }

//         const response = await fetch('http://localhost:5000/api/tickets/create-payment', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             eventId: event._id,
//             ticketTypeId: selectedTicket._id || null
//           }),
//           credentials: 'include'
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           console.error("Payment creation error:", errorData);
//           throw new Error(errorData.message || 'Error creating payment');
//         }

//         const data = await response.json();
//         console.log("Payment intent created:", data);

//         // If it's a free ticket and was processed directly
//         if (data.ticket) {
//           // No payment needed, redirect to success
//           onSuccess(data.ticket._id);
//           return;
//         }

//         // For paid tickets, set up payment form
//         setClientSecret(data.clientSecret);
//         setTicketId(data.ticketId);
//       } catch (err) {
//         console.error("Payment intent error:", err);
//         setError(err.message || 'An error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     getPaymentIntent();
//   }, [selectedTicket, event, isFreeTicket, onSuccess]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // For free tickets, special handling
//       if (isFreeTicket) {
//         const response = await fetch('http://localhost:5000/api/tickets/create-payment', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             eventId: event._id,
//             ticketTypeId: selectedTicket._id || null
//           }),
//           credentials: 'include'
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           console.error("Free ticket registration error:", errorData);
//           throw new Error(errorData.message || 'Error registering for free event');
//         }

//         const data = await response.json();
//         console.log("Free ticket created:", data);

//         // Redirect to success page
//         onSuccess(data.ticket._id);
//         return;
//       }

//       // For paid tickets, process payment with additional logging
//       if (!stripe || !elements || !clientSecret) {
//         console.error("Missing required Stripe elements:", { 
//           stripeLoaded: !!stripe, 
//           elementsLoaded: !!elements, 
//           clientSecretPresent: !!clientSecret 
//         });
//         throw new Error('Payment processing unavailable. Please try again.');
//       }

//       const cardElement = elements.getElement(CardElement);
//       if (!cardElement) {
//         throw new Error('Card information is missing');
//       }

//       console.log("Confirming card payment with secret:", clientSecret.substring(0, 10) + '...');
      
//       // Confirm card payment
//       const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//           card: cardElement,
//           billing_details: {
//             name: 'Test User', // In a real app, use the user's name
//           },
//         }
//       });

//       if (stripeError) {
//         console.error("Stripe confirmation error:", stripeError);
//         throw new Error(stripeError.message);
//       }

//       console.log("Payment intent result:", paymentIntent.status);

//       if (paymentIntent.status === 'succeeded') {
//         // Additional logging for successful payment
//         console.log("Payment succeeded, confirming with backend", {
//           ticketId,
//           paymentIntentId: paymentIntent.id
//         });
        
//         // Confirm the ticket payment on our backend
//         const confirmResponse = await fetch('http://localhost:5000/api/tickets/confirm-payment', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             ticketId: ticketId,
//             paymentIntentId: paymentIntent.id
//           }),
//           credentials: 'include'
//         });

//         if (!confirmResponse.ok) {
//           const errorData = await confirmResponse.json();
//           console.error("Backend confirmation error:", errorData);
//           throw new Error(errorData.message || 'Error confirming ticket');
//         }

//         const confirmData = await confirmResponse.json();
//         console.log("Payment confirmed by backend:", confirmData);

//         // Payment and ticket confirmation successful
//         onSuccess(ticketId);
//       }
//     } catch (err) {
//       console.error("Payment processing error:", err);
//       setError(err.message || 'Payment failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // If no ticket selected, show message
//   if (!selectedTicket) {
//     return <p className="text-gray-600">Please select a ticket type</p>;
//   }

//   // Free ticket form
//   if (isFreeTicket) {
//     return (
//       <div className="text-center p-4">
//         <p className="mb-4">This is a free event. Click below to register.</p>
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
//         >
//           {loading ? 'Processing...' : 'Register Now'}
//         </button>
//       </div>
//     );
//   }

//   // Paid ticket form
//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="p-4 border rounded-lg">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Card Details
//         </label>
//         <CardElement
//           options={{
//             style: {
//               base: {
//                 fontSize: '16px',
//                 color: '#424770',
//                 '::placeholder': {
//                   color: '#aab7c4',
//                 },
//               },
//               invalid: {
//                 color: '#9e2146',
//               },
//             },
//           }}
//           className="p-3 border rounded-lg"
//         />
//       </div>

//       {error && (
//         <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
//           {error}
//         </div>
//       )}

//       <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
//         <p className="mb-2">Test Card Information:</p>
//         <ul className="space-y-1 list-disc list-inside">
//           <li>Card Number: 4242 4242 4242 4242</li>
//           <li>Expiration: Any future date</li>
//           <li>CVC: Any 3 digits</li>
//           <li>ZIP: Any 5 digits</li>
//         </ul>
//       </div>

//       <button
//         type="submit"
//         disabled={!stripe || loading}
//         className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
//       >
//         {loading ? (
//           <span className="flex items-center">
//             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Processing...
//           </span>
//         ) : (
//           <span className="flex items-center">
//             <CreditCard className="w-4 h-4 mr-2" />
//             Pay ${getTicketPrice().toFixed(2)}
//           </span>
//         )}
//       </button>
//     </form>
//   );
// };

// // Main Ticket Purchase Component
// const TicketPayment = () => {
//   const [event, setEvent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const { id: eventId } = useParams();
//   const navigate = useNavigate();

//   // Fetch event details
//   useEffect(() => {
//     const fetchEvent = async () => {
//       if (!eventId) {
//         setError('Event ID is missing');
//         setLoading(false);
//         return;
//       }
  
//       try {
//         console.log("Fetching event details for:", eventId);
//         setLoading(true);
        
//         const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
//           credentials: 'include'
//         });
  
//         if (!response.ok) {
//           throw new Error('Failed to fetch event details');
//         }
  
//         const data = await response.json();
//         console.log("Event data received:", data.data);
        
//         if (!data || !data.data) {
//           throw new Error('Invalid event data received');
//         }
        
//         setEvent(data.data);
  
//         // Pre-select ticket based on available options
//         if (data.data.ticketTypes && data.data.ticketTypes.length === 1) {
//           setSelectedTicket(data.data.ticketTypes[0]);
//           console.log("Auto-selected ticket:", data.data.ticketTypes[0]);
//         } else if (!data.data.ticketTypes || data.data.ticketTypes.length === 0) {
//           // Create a standard ticket with the correct price
//           // Check both price fields
//           const ticketPrice = data.data.price !== undefined ? 
//             parseFloat(data.data.price) : 
//             parseFloat(data.data.defaultTicketPrice || 0);
            
//           const standardTicket = {
//             name: 'Standard Ticket',
//             price: isNaN(ticketPrice) ? 0 : ticketPrice
//           };
//           setSelectedTicket(standardTicket);
//           console.log("Created standard ticket:", standardTicket);
//         }
//       } catch (err) {
//         console.error("Error fetching event:", err);
//         setError(err.message || 'Failed to load event details');
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchEvent();
//   }, [eventId]);

//   const handleSuccess = (ticketId) => {
//     if (!ticketId) {
//       setError('Ticket ID is missing for confirmation');
//       return;
//     }
//     navigate(`/tickets/${ticketId}/success`);
//   };

//   // Safe formatting functions with error handling
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not available';
//     try {
//       return new Date(dateString).toLocaleDateString(undefined, { 
//         weekday: 'long', 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//     } catch (e) {
//       console.error("Date formatting error:", e);
//       return 'Invalid date';
//     }
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return 'Time not available';
//     try {
//       return new Date(dateString).toLocaleTimeString([], { 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       });
//     } catch (e) {
//       console.error("Time formatting error:", e);
//       return 'Invalid time';
//     }
//   };

//   // Safe price formatting function
//   const formatPrice = (price) => {
//     if (price === undefined || price === null) return '0.00';
//     const numericPrice = parseFloat(price);
//     return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   if (error || !event) {
//     return (
//       <div className="p-4 bg-red-50 text-red-700 rounded-lg">
//         {error || 'Failed to load event details'}
//       </div>
//     );
//   }

//   const hasTicketTypes = event.ticketTypes && event.ticketTypes.length > 0;

//   return (
//     <div className="max-w-3xl mx-auto py-8 px-4">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Purchase Tickets</h2>
          
//           {/* Event Summary */}
//           <div className="bg-gray-50 p-4 rounded-lg mb-6">
//             <h3 className="text-lg font-semibold mb-2">{event.title || 'Event'}</h3>
//             <div className="space-y-2 text-sm text-gray-600">
//               <div className="flex items-center">
//                 <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                 <span>{formatDate(event.startDate)}</span>
//               </div>
//               <div className="flex items-center">
//                 <Clock className="w-4 h-4 mr-2 text-gray-400" />
//                 <span>{formatTime(event.startDate)}</span>
//               </div>
//               <div className="flex items-center">
//                 <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                 <span>{event.location || 'Location not specified'}</span>
//               </div>
//             </div>
//           </div>
          
//           {/* Ticket Selection */}
//           {hasTicketTypes ? (
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold mb-3">Select Ticket Type</h3>
//               <div className="space-y-3">
//                 {event.ticketTypes.map((ticket) => (
//                   <div 
//                     key={ticket._id || `ticket-${Math.random()}`}
//                     onClick={() => {
//                       console.log("Selected ticket:", ticket);
//                       setSelectedTicket(ticket);
//                     }}
//                     className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
//                       selectedTicket && selectedTicket._id === ticket._id 
//                         ? 'border-purple-500 bg-purple-50' 
//                         : 'border-gray-200 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex-grow">
//                       <div className="flex justify-between">
//                         <div className="font-medium">{ticket.name || 'Ticket'}</div>
//                         <div className="font-medium">
//                           {parseFloat(formatPrice(ticket.price)) === 0 
//                             ? 'FREE' 
//                             : `$${formatPrice(ticket.price)}`
//                           }
//                         </div>
//                       </div>
                      
//                       {ticket.description && (
//                         <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
//                       )}
//                     </div>
                    
//                     {selectedTicket && selectedTicket._id === ticket._id && (
//                       <div className="ml-2 bg-purple-500 text-white p-1 rounded-full">
//                         <Check className="w-4 h-4" />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold mb-3">Ticket Price</h3>
//               <div 
//                 className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
//                 onClick={() => {
//                   const standardTicket = {
//                     name: 'Standard Ticket',
//                     price: parseFloat(event.price || event.defaultTicketPrice || 0)
//                   };
//                   console.log("Selected standard ticket:", standardTicket);
//                   setSelectedTicket(standardTicket);
//                 }}
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="font-medium">Standard Ticket</div>
//                   <div className="font-medium">
//                     {parseFloat(formatPrice(event.price || event.defaultTicketPrice)) === 0 
//                       ? 'FREE' 
//                       : `$${formatPrice(event.price || event.defaultTicketPrice)}`
//                     }
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Stripe Payment Integration */}
//           <ErrorBoundary>
//             <Elements stripe={stripePromise}>
//               <CheckoutForm 
//                 event={event} 
//                 selectedTicket={selectedTicket}
//                 onSuccess={handleSuccess}
//               />
//             </Elements>
//           </ErrorBoundary>
          
//           <p className="mt-4 text-xs text-center text-gray-500">
//             By purchasing a ticket, you agree to the terms and conditions of the event.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TicketPayment;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, CreditCard, Calendar, Clock, MapPin, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RDyCUIRIJITDAlPac3890XfbvL0jfnB2LFpnmlpgQ9jJBXQk8lvf4fCrN028MJDs3LCasE9U2PmLcl8wRDm5eSq00ewafpovJ');

// Error Boundary Component for catching and displaying React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.toString() };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="font-bold mb-2">Something went wrong.</h2>
          <p>{this.state.errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Checkout Form Component
const CheckoutForm = ({ event, selectedTicket, onSuccess, currentUser }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [ticketId, setTicketId] = useState('');
  const navigate = useNavigate();

  const getTicketPrice = () => {
    // For specific ticket type
    if (selectedTicket && selectedTicket.price !== undefined) {
      const price = parseFloat(selectedTicket.price);
      return isNaN(price) ? 0 : price;
    }
    
    // For event price - check both price and defaultTicketPrice fields
    if (event) {
      // First check if price field exists
      if (event.price !== undefined) {
        const price = parseFloat(event.price);
        if (!isNaN(price)) return price;
      }
      
      // Fall back to defaultTicketPrice
      if (event.defaultTicketPrice !== undefined) {
        const price = parseFloat(event.defaultTicketPrice);
        return isNaN(price) ? 0 : price;
      }
    }
    
    // If no valid price found
    return 0;
  };

  // Determine if this is a free ticket
  const isFreeTicket = getTicketPrice() === 0;

  // Get payment intent when ticket is selected
  useEffect(() => {
    if (!selectedTicket || !event || !event._id) return;

    const getPaymentIntent = async () => {
      console.log("Creating payment intent for:", {
        eventId: event._id,
        ticketTypeId: selectedTicket._id,
        selectedTicket: selectedTicket,
        price: getTicketPrice(),
        user: currentUser
      });

      try {
        setLoading(true);
        
        // For free tickets, we don't need a payment intent
        if (isFreeTicket) {
          return;
        }

        const response = await fetch('http://localhost:5000/api/tickets/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event._id,
            ticketTypeId: selectedTicket._id || null
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Payment creation error:", errorData);
          throw new Error(errorData.message || 'Error creating payment');
        }

        const data = await response.json();
        console.log("Payment intent created:", data);

        // If it's a free ticket and was processed directly
        if (data.ticket) {
          // No payment needed, redirect to success
          onSuccess(data.ticket._id);
          return;
        }

        // For paid tickets, set up payment form
        setClientSecret(data.clientSecret);
        setTicketId(data.ticketId);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    getPaymentIntent();
  }, [selectedTicket, event, isFreeTicket, onSuccess, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For free tickets, special handling
      if (isFreeTicket) {
        const response = await fetch('http://localhost:5000/api/tickets/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event._id,
            ticketTypeId: selectedTicket._id || null
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Free ticket registration error:", errorData);
          throw new Error(errorData.message || 'Error registering for free event');
        }

        const data = await response.json();
        console.log("Free ticket created:", data);

        // Redirect to success page
        onSuccess(data.ticket._id);
        return;
      }

      // For paid tickets, process payment with additional logging
      if (!stripe || !elements || !clientSecret) {
        console.error("Missing required Stripe elements:", { 
          stripeLoaded: !!stripe, 
          elementsLoaded: !!elements, 
          clientSecretPresent: !!clientSecret 
        });
        throw new Error('Payment processing unavailable. Please try again.');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card information is missing');
      }

      console.log("Confirming card payment with secret:", clientSecret.substring(0, 10) + '...');
      
      // Set up billing details from current user if available
      const billingDetails = {
        name: currentUser?.fullName || 'Guest User',
        email: currentUser?.email || '',
      };
      
      console.log("Using billing details:", billingDetails);
      
      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        }
      });

      if (stripeError) {
        console.error("Stripe confirmation error:", stripeError);
        throw new Error(stripeError.message);
      }

      console.log("Payment intent result:", paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        // Additional logging for successful payment
        console.log("Payment succeeded, confirming with backend", {
          ticketId,
          paymentIntentId: paymentIntent.id
        });
        
        // Confirm the ticket payment on our backend
        const confirmResponse = await fetch('http://localhost:5000/api/tickets/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId: ticketId,
            paymentIntentId: paymentIntent.id
          }),
          credentials: 'include'
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          console.error("Backend confirmation error:", errorData);
          throw new Error(errorData.message || 'Error confirming ticket');
        }

        const confirmData = await confirmResponse.json();
        console.log("Payment confirmed by backend:", confirmData);

        // Payment and ticket confirmation successful
        onSuccess(ticketId);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // If no ticket selected, show message
  if (!selectedTicket) {
    return <p className="text-gray-600">Please select a ticket type</p>;
  }

  // Free ticket form
  if (isFreeTicket) {
    return (
      <div className="text-center p-4">
        <p className="mb-4">This is a free event. Click below to register.</p>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Register Now'}
        </button>
      </div>
    );
  }

  // Paid ticket form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
          className="p-3 border rounded-lg"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p className="mb-2">Test Card Information:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Card Number: 4242 4242 4242 4242</li>
          <li>Expiration: Any future date</li>
          <li>CVC: Any 3 digits</li>
          <li>ZIP: Any 5 digits</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${getTicketPrice().toFixed(2)}
          </span>
        )}
      </button>
    </form>
  );
};

// Main Ticket Purchase Component
const TicketPayment = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Current user data:", data.user);
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        // Continue without user data - they might not be logged in
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }
  
      try {
        console.log("Fetching event details for:", eventId);
        setLoading(true);
        
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          credentials: 'include'
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
  
        const data = await response.json();
        console.log("Event data received:", data.data);
        
        if (!data || !data.data) {
          throw new Error('Invalid event data received');
        }
        
        setEvent(data.data);
  
        // Pre-select ticket based on available options
        if (data.data.ticketTypes && data.data.ticketTypes.length === 1) {
          setSelectedTicket(data.data.ticketTypes[0]);
          console.log("Auto-selected ticket:", data.data.ticketTypes[0]);
        } else if (!data.data.ticketTypes || data.data.ticketTypes.length === 0) {
          // Create a standard ticket with the correct price
          // Check both price fields
          const ticketPrice = data.data.price !== undefined ? 
            parseFloat(data.data.price) : 
            parseFloat(data.data.defaultTicketPrice || 0);
            
          const standardTicket = {
            name: 'Standard Ticket',
            price: isNaN(ticketPrice) ? 0 : ticketPrice
          };
          setSelectedTicket(standardTicket);
          console.log("Created standard ticket:", standardTicket);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [eventId]);

  const handleSuccess = (ticketId) => {
    if (!ticketId) {
      setError('Ticket ID is missing for confirmation');
      return;
    }
    navigate(`/tickets/${ticketId}/success`);
  };

  // Safe formatting functions with error handling
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return 'Invalid date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time not available';
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      console.error("Time formatting error:", e);
      return 'Invalid time';
    }
  };

  // Safe price formatting function
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error || 'Failed to load event details'}
      </div>
    );
  }

  // Check if user is already attending
  const isAlreadyAttending = currentUser && 
    event.attendees && 
    event.attendees.some(id => id === currentUser._id);

  if (isAlreadyAttending) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">You're Already Registered</h2>
          <p className="text-gray-700 mb-6">You have already registered for this event.</p>
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
    );
  }

  const hasTicketTypes = event.ticketTypes && event.ticketTypes.length > 0;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Purchase Tickets</h2>
          
          {/* Event Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">{event.title || 'Event'}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{formatTime(event.startDate)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>{event.location || 'Location not specified'}</span>
              </div>
            </div>
          </div>
          
          {/* Ticket Selection */}
          {hasTicketTypes ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Ticket Type</h3>
              <div className="space-y-3">
                {event.ticketTypes.map((ticket) => (
                  <div 
                    key={ticket._id || `ticket-${Math.random()}`}
                    onClick={() => {
                      console.log("Selected ticket:", ticket);
                      setSelectedTicket(ticket);
                    }}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket && selectedTicket._id === ticket._id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div className="font-medium">{ticket.name || 'Ticket'}</div>
                        <div className="font-medium">
                          {parseFloat(formatPrice(ticket.price)) === 0 
                            ? 'FREE' 
                            : `${formatPrice(ticket.price)}`
                          }
                        </div>
                      </div>
                      
                      {ticket.description && (
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                      )}
                    </div>
                    
                    {selectedTicket && selectedTicket._id === ticket._id && (
                      <div className="ml-2 bg-purple-500 text-white p-1 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Ticket Price</h3>
              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  const standardTicket = {
                    name: 'Standard Ticket',
                    price: parseFloat(event.price || event.defaultTicketPrice || 0)
                  };
                  console.log("Selected standard ticket:", standardTicket);
                  setSelectedTicket(standardTicket);
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">Standard Ticket</div>
                  <div className="font-medium">
                    {parseFloat(formatPrice(event.price || event.defaultTicketPrice)) === 0 
                      ? 'FREE' 
                      : `${formatPrice(event.price || event.defaultTicketPrice)}`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Login reminder for guests */}
          {!currentUser && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-blue-700 text-sm">
              <p>You are not logged in. Please <Link to="/login" className="font-medium underline">login</Link> or <Link to="/register" className="font-medium underline">create an account</Link> to purchase tickets.</p>
            </div>
          )}
          
          {/* Stripe Payment Integration */}
          <ErrorBoundary>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                event={event} 
                selectedTicket={selectedTicket}
                onSuccess={handleSuccess}
                currentUser={currentUser}
              />
            </Elements>
          </ErrorBoundary>
          
          <p className="mt-4 text-xs text-center text-gray-500">
            By purchasing a ticket, you agree to the terms and conditions of the event.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketPayment;