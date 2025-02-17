const mongoose = require('mongoose');
const { Schema } = mongoose;

const tehsilSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  district: {
    type: Schema.Types.ObjectId,
    ref: 'District',
    required: true,
  },
  // Additional attributes can be added if needed
}, {
  timestamps: true  
});

const Tehsil = mongoose.model('Tehsil', tehsilSchema);

module.exports = Tehsil;
