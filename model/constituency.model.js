const mongoose = require('mongoose');
const { Schema } = mongoose;

const constituencySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  tehsil: {
    type: Schema.Types.ObjectId,
    ref: 'Tehsil',
    required: true,
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true,
  },
  // Additional attributes can be added if needed
});

const Constituency = mongoose.model('Constituency', constituencySchema);

module.exports = Constituency;
