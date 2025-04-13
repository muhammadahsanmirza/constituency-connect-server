const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['infrastructure', 'education', 'healthcare', 'security', 'other'],
    required: true
  },
  attachments: [{
    path: String,
    filename: String,
    originalname: String,
    mimetype: String
  }],
  constituent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  representative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  response: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
