const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint_status_update', 'new_complaint', 'complaint_response'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedComplaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Apply the pagination plugin to the schema
notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;