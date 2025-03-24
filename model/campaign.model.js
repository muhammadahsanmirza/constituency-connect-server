const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaignSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imagePath: {
    type: String
  },
  representative: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;