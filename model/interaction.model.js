const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['virtual', 'physical'],
    required: true
  },
  representative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  // For virtual meetings
  meetingLink: {
    type: String,
    required: function() {
      return this.type === 'virtual';
    }
  },
  platform: {
    type: String,
    enum: ['zoom', 'google-meet', 'microsoft-teams', 'other'],
    required: function() {
      return this.type === 'virtual';
    }
  },
  // For physical meetings
  location: {
    type: String,
    required: function() {
      return this.type === 'physical';
    }
  },
  address: {
    type: String,
    required: function() {
      return this.type === 'physical';
    }
  },
  // Common fields
  attendees: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;