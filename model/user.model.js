const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    match: [/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces'],
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    unique: true,
    match: [/^\d{5}-\d{7}-\d$/, 'CNIC format must be *****-*******-*'],
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\d{11}$/, 'Mobile format must be 03000000000'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    match: [/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'],
  },
  role: {
    type: String,
    enum: ['representative', 'constituent'],
    required: [true, 'Role is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of Birth is required'],
    validate: {
      validator: function(value) {
        const currentDate = new Date();
        const dob = new Date(value);
        currentDate.setHours(0, 0, 0, 0);
        dob.setHours(0, 0, 0, 0);
        return dob <= currentDate;
      },
      message: 'Date of Birth cannot be in the future',
    },
  },
  province: {
    type: Schema.Types.ObjectId,
    ref: 'Province',
    required: [true, 'Province is required'],
  },
  district: {
    type: Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District is required'],
  },
  tehsil: {
    type: Schema.Types.ObjectId,
    ref: 'Tehsil',
    required: [true, 'Tehsil is required'],
  },
  tehsil: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'City is required'],
  },
  constituency: {
    type: Schema.Types.ObjectId,
    ref: 'Constituency',
    required: [true, 'Constituency is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  representative: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
