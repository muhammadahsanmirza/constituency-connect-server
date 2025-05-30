const mongoose = require('mongoose');

const zoomMeetingSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  agenda: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 300
  },
  password: {
    type: String,
    required: true
  },
  zoomMeetingId: {
    type: String,
    required: true,
    unique: true
  },
  joinUrl: {
    type: String,
    required: true
  },
  hostEmail: {
    type: String,
    required: true
  },
  representative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  constituents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
}, { timestamps: true });

const ZoomMeeting = mongoose.model('ZoomMeeting', zoomMeetingSchema);

module.exports = ZoomMeeting;