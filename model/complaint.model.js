const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['infrastructure', 'education', 'healthcare', 'security', 'other']
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
  },
  isFeedbackSubmitted: {
    type: Boolean,
    default: false
  },
  isComplaintUpdated: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Apply the pagination plugin to the schema
complaintSchema.plugin(mongoosePaginate);

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
