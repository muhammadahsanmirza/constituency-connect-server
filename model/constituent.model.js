// models/Constituent.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const constituentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      match: [/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    cnic: {
      type: String,
      required: [true, 'CNIC is required'],
      unique: true,
      match: [/^\d{5}-\d{7}-\d{1}$/, 'CNIC format must be *****-*******-*'],
      validate: {
        validator: function (v) {
          return /^\d{5}-\d{7}-\d{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC format`,
      },
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{11}$/, 'Mobile format must be 03000000000'],
      validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid mobile number format`,
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      ],
    },
    confirmPassword: {
      type: String,
      required: [true, 'Confirm Password is required'],
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: 'Passwords must match',
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'moderator'],
      required: [true, 'Role is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of Birth is required'],
      validate: {
        validator: function (v) {
          return v <= new Date();
        },
        message: 'Date of Birth cannot be in the future',
      },
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      enum: ['Balochistan', 'KpK', 'Punjab', 'Sindh'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      enum: ['Federal Capital', 'Lahore', 'Multan'],
    },
    tehsil: {
      type: String,
      required: [true, 'Tehsil is required'],
      enum: ['Kasur', 'Attock', 'MianWali'],
    },
    constituency: {
      type: String,
      required: [true, 'Constituency is required'],
      enum: ['Punjab', 'Islamabad', 'Balochistan'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    representative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Representative',
      required: [true, 'Representative information is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
constituentSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

// Compare password method
constituentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Constituent', constituentSchema);