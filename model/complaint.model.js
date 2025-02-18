const mongoose = require('mongoose');
const { Schema } = mongoose;

const complaintSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  complaintDate: {
    type: Date,
    required: true,
  },
  attachments: [
    {
      filePath: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending',
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
