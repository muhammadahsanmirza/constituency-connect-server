 const mongoose = require('mongoose');
require('dotenv').config();
/**
 * Asynchronously connects to the MongoDB database using the environment variables for connection string and database name.
 *
 */
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
