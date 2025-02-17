const mongoose = require('mongoose');
const District = require('../model/district.model');

const insertDistricts = async () => {
  try {
    // Sample district data
    const districts = [
      { name: "Lahore", province: "67b336c6f5811da3f3334361" },
      { name: "Faisalabad", province: "67b336c6f5811da3f3334361" },
      { name: "Karachi", province: "67b336c6f5811da3f3334362" },
      { name: "Hyderabad", province: "67b336c6f5811da3f3334362" },
      { name: "Peshawar", province: "67b336c6f5811da3f3334363" },
      { name: "Quetta", province: "67b336c6f5811da3f3334364" },
      { name: "Gilgit", province: "67b336c6f5811da3f3334365" },
      { name: "Muzaffarabad", province: "67b336c6f5811da3f3334366" },
    ];

    // Check if districts already exist to avoid duplicates
    const existingDistricts = await District.find();
    if (existingDistricts.length === 0) {
      // Insert data into the database
      const result = await District.insertMany(districts);
      console.log(`Inserted ${result.length} districts`);
    } else {
      console.log('Districts already exist in the database');
    }
  } catch (error) {
    console.error('Error inserting districts:', error.message);
  } finally {
    // Close the database connection if this script is run independently
    mongoose.connection.close();
  }
};

module.exports = insertDistricts;
