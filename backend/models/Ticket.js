// models/Ticket.js
const mongoose = require('mongoose');
const QRCode = require('qrcode');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    name: String,
    price: Number
  },
  // Payment information
  paymentIntentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  qrCodeData: String,
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkInDate: Date
});

// Method to generate QR code
ticketSchema.methods.generateQRCode = async function() {
  try {
    // Create data for QR code
    const qrData = JSON.stringify({
      ticketId: this._id,
      eventId: this.event,
      attendeeId: this.attendee,
      timestamp: Date.now()
    });
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    
    // Update ticket with QR code
    this.qrCodeData = qrCodeDataURL;
    await this.save();
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;