const mongoose = require('mongoose');
const Province = require('../modal/province.modal'); // Adjust the path as necessary

const insertProvinces = async () => {
  try {
    // Sample province data
    const provinces = [
      { name: "Punjab" },
      { name: "Sindh" },
      { name: "Khyber Pakhtunkhwa" },
      { name: "Balochistan" },
      { name: "Gilgit-Baltistan" },
      { name: "Azad Jammu and Kashmir" }
    ];

    // Check if provinces already exist to avoid duplicates
    const existingProvinces = await Province.find();
    if (existingProvinces.length === 0) {
      // Insert data into the database
      const result = await Province.insertMany(provinces);
      console.log(`Inserted ${result.length} provinces`);
    } else {
      console.log('Provinces already exist in the database');
    }
  } catch (error) {
    console.error('Error inserting provinces:', error.message);
  } finally {
    // Close the database connection if this script is run independently
    mongoose.connection.close();
  }
};

module.exports = insertProvinces;
