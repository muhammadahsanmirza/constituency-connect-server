require('dotenv').config();

// Server Setup
const express = require('express');
const app = express();
const PORT = process.env.SERVER_PORT || 5000;

const cors = require('cors');

const connectDB = require('./db/db.connection');

// Connection to database
connectDB();



// Middleware
app.use(express.json());
app.use(cors());

// Routes



//Server Start

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
