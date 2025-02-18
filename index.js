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

const mongoose = require('mongoose');
// const insertProvinces = require('./scripts/insertProvinces');
// const insertDistricts = require('./scripts/insertDistricts');
// const insertTehsils = require('./scripts/insertTehsils');
// const insertCities = require('./scripts/insertCities');
// const insertConstituencies = require('./scripts/insertConstituencies');
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
  // insertProvinces();
  // insertDistricts();
  // insertTehsils();
  // insertCities();
  // insertConstituencies();
});

// Routes
// const constituentRoutes = require('./routes/constituent.routes.js');
// app.use('/api/v1/constituent', constituentRoutes);

const provinceRoutes = require('./routes/province.routes');
app.use('/api/v1/province', provinceRoutes);

const districtRoutes = require('./routes/district.routes');
app.use('/api/v1/district', districtRoutes);

const tehsilRoutes = require('./routes/tehsil.routes');
app.use('/api/v1/tehsil', tehsilRoutes);

const cityRoutes = require('./routes/city.routes');
app.use('/api/v1/city', cityRoutes);

const constituencyRoutes = require('./routes/constituency.routes');
app.use('/api/v1/constituency', constituencyRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/api/v1/user', userRoutes);








//Server Start

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
