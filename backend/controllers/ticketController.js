// controllers/ticketController.js
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const stripe = require('../config/stripe');
const QRCode = require('qrcode');

exports.createPayment = async (req, res) => {
  try {
    const { eventId, ticketTypeId } = req.body;
    
    console.log("Creating payment for event:", eventId, "ticket type:", ticketTypeId);
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log("Found event:", event.title);
    console.log("Price field:", event.price);
    console.log("Default ticket price:", event.defaultTicketPrice);
    console.log("Ticket types:", event.ticketTypes);
    
    // Get ticket price information
    let ticketType;
    let ticketPrice;
    let ticketName;
    
    if (ticketTypeId && event.ticketTypes && event.ticketTypes.length > 0) {
      ticketType = event.ticketTypes.id(ticketTypeId);
      if (!ticketType) {
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }
      ticketPrice = parseFloat(ticketType.price);
      ticketName = ticketType.name;
      console.log("Using ticket type price:", ticketPrice);
    } else {
      // Check both price fields
      if (event.price !== undefined && !isNaN(parseFloat(event.price))) {
        ticketPrice = parseFloat(event.price);
        console.log("Using price field:", ticketPrice);
      } else {
        ticketPrice = parseFloat(event.defaultTicketPrice || 0);
        console.log("Using defaultTicketPrice field:", ticketPrice);
      }
      
      ticketName = 'Standard Ticket';
    }
    
    // Ensure price is a valid number
    if (isNaN(ticketPrice)) {
      console.error("Invalid ticket price (NaN)");
      ticketPrice = 0;
    }
    
    // Check if event is sold out
    if (event.capacity > 0 && event.attendees && event.attendees.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This event is fully booked'
      });
    }

    // If it's a free ticket, process it directly without payment
    if (ticketPrice === 0) {
      console.log("Processing free ticket");
      
      // Create a completed ticket
      const ticket = await Ticket.create({
        event: eventId,
        attendee: req.user.id,
        ticketType: {
          name: ticketName,
          price: 0
        },
        paymentStatus: 'completed'
      });
      
      // Generate QR code
      try {
        // Create data for QR code
        const qrData = JSON.stringify({
          ticketId: ticket._id,
          eventId: ticket.event,
          attendeeId: ticket.attendee,
          timestamp: Date.now()
        });
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData);
        
        // Update ticket with QR code
        ticket.qrCodeData = qrCodeDataURL;
        await ticket.save();
      } catch (qrError) {
        console.error("QR code generation error:", qrError);
      }
      
      // Add attendee to event
      if (!event.attendees.includes(req.user.id)) {
        event.attendees.push(req.user.id);
        await event.save();
      }
      
      // Add event to user's events
      await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { events: eventId } }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Successfully registered for free event',
        ticket: ticket
      });
    }
    
    // For paid tickets, create a payment intent with enhanced logging
    console.log("Creating Stripe payment intent for amount:", ticketPrice);
    const amountInCents = Math.round(ticketPrice * 100);
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          eventId: eventId,
          ticketTypeName: ticketName,
          userId: req.user.id
        },
        automatic_payment_methods: {enabled: true},
      });
      
      console.log("Payment intent created successfully:", {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret.substring(0, 10) + '...',
        status: paymentIntent.status,
        amount: paymentIntent.amount
      });
      
      // Create a pending ticket
      const ticket = await Ticket.create({
        event: eventId,
        attendee: req.user.id,
        ticketType: {
          name: ticketName,
          price: ticketPrice
        },
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending'
      });
      
      console.log("Ticket created with ID:", ticket._id);
      
      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        ticketId: ticket._id
      });
    } catch (stripeError) {
      console.error("Stripe error creating payment intent:", stripeError);
      // Send detailed error to aid debugging
      res.status(500).json({
        success: false,
        message: 'Error creating Stripe payment intent',
        error: stripeError.message,
        type: stripeError.type || 'unknown'
      });
    }
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { ticketId, paymentIntentId } = req.body;
    
    console.log("Confirming payment for ticket:", ticketId, "with payment intent:", paymentIntentId);
    
    if (!ticketId || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID and payment intent ID are required'
      });
    }
    
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Verify the payment intent matches
    if (ticket.paymentIntentId !== paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment information mismatch'
      });
    }
    
    // Verify the payment intent with Stripe first
    try {
      console.log("Retrieving payment intent from Stripe:", paymentIntentId);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log("Payment intent retrieved, status:", paymentIntent.status);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: `Payment has not been completed. Status: ${paymentIntent.status}`
        });
      }
    } catch (stripeError) {
      console.error('Stripe error when retrieving payment intent:', stripeError);
      return res.status(400).json({
        success: false,
        message: `Stripe error: ${stripeError.message}`,
        code: stripeError.code,
        type: stripeError.type
      });
    }
    
    // Update ticket status
    ticket.paymentStatus = 'completed';
    
    // Generate QR code
    try {
      // Create data for QR code
      const qrData = JSON.stringify({
        ticketId: ticket._id,
        eventId: ticket.event,
        attendeeId: ticket.attendee,
        timestamp: Date.now()
      });
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      
      // Update ticket with QR code
      ticket.qrCodeData = qrCodeDataURL;
    } catch (qrError) {
      console.error("QR code generation error:", qrError);
    }
    
    await ticket.save();
    
    // Add attendee to event
    const event = await Event.findById(ticket.event);
    if (event && !event.attendees.includes(ticket.attendee)) {
      event.attendees.push(ticket.attendee);
      await event.save();
    }
    
    // Add event to user's events
    await User.findByIdAndUpdate(
      ticket.attendee,
      { $addToSet: { events: ticket.event } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment confirmed and ticket activated',
      ticket: ticket
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// Get all tickets for the current user
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ 
      attendee: req.user.id,
      paymentStatus: 'completed' 
    })
    .populate('event', 'title startDate endDate location coverImage')
    .sort({ purchaseDate: -1 });
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    console.log(`Fetching ticket with ID: ${req.params.id}`);
    
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'title startDate endDate location coverImage')
      .populate('attendee', 'fullName email');
    
    if (!ticket) {
      console.log("Ticket not found");
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // CRITICAL FIX: Check if populated fields exist before accessing their properties
    if (!ticket.attendee || !ticket.event) {
      console.log("Ticket found but missing related data:", { 
        hasAttendee: !!ticket.attendee,
        hasEvent: !!ticket.event
      });
      
      return res.status(500).json({
        success: false,
        message: 'Ticket data is incomplete'
      });
    }
    
    // Now we can safely access properties knowing they exist
    console.log("Ticket found with complete data");
    
    // Simplified permission check with proper null handling
    let authorized = false;
    
    if (ticket.attendee._id && ticket.attendee._id.toString() === req.user.id) {
      console.log("User is ticket owner - authorized");
      authorized = true;
    } 
    else if (req.user.role === 'admin') {
      console.log("User is admin - authorized");
      authorized = true;
    }
    else {
      try {
        const event = await Event.findById(ticket.event._id);
        if (event && event.organizer && event.organizer.toString() === req.user.id) {
          console.log("User is event organizer - authorized");
          authorized = true;
        }
      } catch (err) {
        console.error("Error checking event organizer:", err);
      }
    }
    
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};