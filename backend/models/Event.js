// models/Event.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Session description is required'],
  },
  startTime: {
    type: Date,
    required: [true, 'Session start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'Session end time is required'],
  },
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Speaker is required for the session'],
  },
  location: {
    type: String,
    required: [true, 'Session location is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  resources: [{
    title: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Event start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'Event end date is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
  },
  price: {
    type: Number,
    default: 0, // 0 means free
  },
  coverImage: {
    type: String,
    default: '',
  },
  sessions: [sessionSchema],
  speakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  resources: [{
    title: String,
    fileUrl: String,
    fileType: String,
    fileSize: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  ticketTypes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  
  // Default ticket price if no ticket types are specified
  defaultTicketPrice: {
    type: Number,
    default: 0 // Free by default
  }
});

// Fix registrationCount virtual
eventSchema.virtual('registrationCount').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

// Fix availableSpots virtual
eventSchema.virtual('availableSpots').get(function() {
  const attendeesCount = this.attendees ? this.attendees.length : 0;
  return this.capacity - attendeesCount;
});

// Fix isFullyBooked virtual
eventSchema.virtual('isFullyBooked').get(function() {
  if (!this.attendees) return false;
  return this.capacity > 0 && this.attendees.length >= this.capacity;
});

// Set virtuals to true when converting to JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// Define middleware for cascading updates
eventSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  next();
});



const Event = mongoose.model('Event', eventSchema);

module.exports = Event;