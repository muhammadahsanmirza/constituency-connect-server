const mongoose = require('mongoose');
const Tehsil = require('../model/tehsil.model');

const insertTehsils = async () => {
  try {
    // Sample tehsil data
    const tehsils = [
      { name: "Model Town", district: "67b33c8492139b7a8d005256" }, // Lahore
      { name: "Gulberg", district: "67b33c8492139b7a8d005256" }, // Lahore
      { name: "Jaranwala", district: "67b33c8492139b7a8d005257" }, // Faisalabad
      { name: "Chiniot", district: "67b33c8492139b7a8d005257" }, // Faisalabad
      { name: "Latifabad", district: "67b33c8492139b7a8d005259" }, // Hyderabad
      { name: "Qasimabad", district: "67b33c8492139b7a8d005259" }, // Hyderabad
      { name: "Peshawar City", district: "67b33c8492139b7a8d00525a" }, // Peshawar
      { name: "Peshawar Town", district: "67b33c8492139b7a8d00525a" }, // Peshawar
      { name: "Quetta City", district: "67b33c8492139b7a8d00525b" }, // Quetta
      { name: "Sariab Road", district: "67b33c8492139b7a8d00525b" }, // Quetta
      { name: "Gilgit City", district: "67b33c8492139b7a8d00525c" }, // Gilgit
      { name: "Danyor", district: "67b33c8492139b7a8d00525c" }, // Gilgit
      { name: "Muzaffarabad City", district: "67b33c8492139b7a8d00525d" }, // Muzaffarabad
      { name: "Neelam Valley", district: "67b33c8492139b7a8d00525d" }, // Muzaffarabad
    ];

    // Check if tehsils already exist to avoid duplicates
    const existingTehsils = await Tehsil.find();
    if (existingTehsils.length === 0) {
      // Insert data into the database
      const result = await Tehsil.insertMany(tehsils);
      console.log(`Inserted ${result.length} tehsils`);
    } else {
      console.log('Tehsils already exist in the database');
    }
  } catch (error) {
    console.error('Error inserting tehsils:', error.message);
  } finally {
    // Close the database connection if this script is run independently
    mongoose.connection.close();
  }
};

module.exports = insertTehsils;
