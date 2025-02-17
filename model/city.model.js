const mongoose = require('mongoose');
const { Schema } = mongoose;

const citySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tehsil: {
    type: Schema.Types.ObjectId,
    ref: 'Tehsil',
    required: true,
  },
  // Additional attributes can be added if needed
}, {
    timestamps: true  
  });

const City = mongoose.model('City', citySchema);

module.exports = City;
