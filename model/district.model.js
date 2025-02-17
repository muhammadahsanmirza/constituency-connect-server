const mongoose = require('mongoose');
const { Schema } = mongoose;

const districtSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  province: {
    type: Schema.Types.ObjectId,
    ref: 'Province',
    required: true,
  },
  // Additional attributes can be added if needed
}, {
  timestamps: true  
});

const District = mongoose.model('District', districtSchema);

module.exports = District;
