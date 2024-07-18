// models/Constituent.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the constituent schema
const constituentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name must be less than 100 characters'],
    },
    cnic: {
      type: String,
      required: [true, 'CNIC is required'],
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{5}-\d{7}-\d{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC format`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (v) {
          // Check for at least one number, one uppercase letter, and one lowercase letter
          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v);
        },
        message: 'Password must contain at least one number, one uppercase letter, and one lowercase letter',
      },
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number format`,
      },
    },
    constituency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Constituency',
      required: [true, 'Constituency is required'],
    },
    role: {
      type: String,
      enum: ['constituent', 'representative'],
      default: 'constituent',
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
