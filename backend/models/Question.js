const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event.sessions',
    required: [true, 'Session ID is required']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who asked the question is required']
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question cannot be more than 1000 characters']
  },
  answer: {
    text: {
      type: String,
      trim: true
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answeredAt: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['pending', 'answered'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Set virtuals when converting to JSON
questionSchema.set('toJSON', { virtuals: true });
questionSchema.set('toObject', { virtuals: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;