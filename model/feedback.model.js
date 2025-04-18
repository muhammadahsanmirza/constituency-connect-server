const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  constituent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a constituent can only provide one feedback per complaint
feedbackSchema.index({ complaint: 1, constituent: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;