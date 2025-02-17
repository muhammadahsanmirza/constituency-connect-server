const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    match: [/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces'],
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
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
    required: [true, 'Role is required'],
    enum: ['admin', 'user', 'moderator'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of Birth is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Date of Birth cannot be in the future',
    },
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
  },
  district: {
    type: String,
    required: [true, 'District is required'],
  },
  tehsil: {
    type: String,
    required: [true, 'Tehsil is required'],
  },
  constituency: {
    type: String,
    required: [true, 'Constituency is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
});

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
