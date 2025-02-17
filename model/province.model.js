const mongoose = require('mongoose');
const { Schema } = mongoose;

const provinceSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // Additional attributes can be added if needed
}, {
  timestamps: true  
});

const Province = mongoose.model('Province', provinceSchema);

module.exports = Province;
