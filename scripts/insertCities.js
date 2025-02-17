const mongoose = require('mongoose');
const City = require('../model/city.model');

const insertCities = async () => {
  try {
    // Sample city data
    const cities = [
      { name: "Ichhra", tehsil: "67b33fda5d16d956725cd55f" }, // Model Town
      { name: "Gulshan-e-Ravi", tehsil: "67b33fda5d16d956725cd560" }, // Gulberg
      { name: "Chak Jhumra", tehsil: "67b33fda5d16d956725cd561" }, // Jaranwala
      { name: "Samundri", tehsil: "67b33fda5d16d956725cd562" }, // Chiniot
      { name: "Tando Allahyar", tehsil: "67b33fda5d16d956725cd563" }, // Latifabad
      { name: "Tando Muhammad Khan", tehsil: "67b33fda5d16d956725cd564" }, // Qasimabad
      { name: "Peshawar Cantt", tehsil: "67b33fda5d16d956725cd565" }, // Peshawar City
      { name: "Hayatabad", tehsil: "67b33fda5d16d956725cd566" }, // Peshawar Town
      { name: "Saryab", tehsil: "67b33fda5d16d956725cd567" }, // Quetta City
      { name: "Pasni", tehsil: "67b33fda5d16d956725cd568" }, // Sariab Road
      { name: "Danyor", tehsil: "67b33fda5d16d956725cd569" }, // Gilgit City
      { name: "Juglot", tehsil: "67b33fda5d16d956725cd56a" }, // Danyor
      { name: "Hattian Bala", tehsil: "67b33fda5d16d956725cd56b" }, // Muzaffarabad City
      { name: "Chakothi", tehsil: "67b33fda5d16d956725cd56c" }, // Neelam Valley
    ];

    // Check if cities already exist to avoid duplicates
    const existingCities = await City.find();
    if (existingCities.length === 0) {
      // Insert data into the database
      const result = await City.insertMany(cities);
      console.log(`Inserted ${result.length} cities`);
    } else {
      console.log('Cities already exist in the database');
    }
  } catch (error) {
    console.error('Error inserting cities:', error.message);
  } finally {
    // Close the database connection if this script is run independently
    mongoose.connection.close();
  }
};

module.exports = insertCities;
