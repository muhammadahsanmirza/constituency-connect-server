 const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.DB_CONNECTION_STRING}${process.env.DB_NAME}`);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;