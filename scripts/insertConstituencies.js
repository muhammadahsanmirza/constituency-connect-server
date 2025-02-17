const mongoose = require('mongoose');
const Constituency = require('../model/constituency.model');

const insertConstituencies = async () => {
  try {
    // Sample constituency data with actual IDs from Tehsil and City collections
    const constituencies = [
      {
        name: "NA-140 Lahore-I",
        tehsil: "67b33fda5d16d956725cd55f", // Model Town
        city: "67b347cf886d49581b86b936",   // Ichhra
      },
      {
        name: "NA-141 Lahore-II",
        tehsil: "67b33fda5d16d956725cd560", // Gulberg
        city: "67b347cf886d49581b86b937",   // Gulshan-e-Ravi
      },
      {
        name: "NA-142 Faisalabad-I",
        tehsil: "67b33fda5d16d956725cd561", // Jaranwala
        city: "67b347cf886d49581b86b938",   // Chak Jhumra
      },
      {
        name: "NA-143 Karachi-I",
        tehsil: "67b33fda5d16d956725cd562", // Chiniot
        city: "67b347cf886d49581b86b939",   // Samundri
      },
      {
        name: "NA-144 Islamabad-I",
        tehsil: "67b33fda5d16d956725cd563", // Latifabad
        city: "67b347cf886d49581b86b93a",   // Tando Allahyar
      },
      {
        name: "NA-145 Peshawar-I",
        tehsil: "67b33fda5d16d956725cd565", // Peshawar City
        city: "67b347cf886d49581b86b93c",   // Peshawar Cantt
      },
      {
        name: "NA-146 Quetta-I",
        tehsil: "67b33fda5d16d956725cd567", // Quetta City
        city: "67b347cf886d49581b86b93e",   // Saryab
      },
      {
        name: "NA-147 Gilgit-I",
        tehsil: "67b33fda5d16d956725cd569", // Gilgit City
        city: "67b347cf886d49581b86b940",   // Danyor
      },
      {
        name: "NA-148 Muzaffarabad-I",
        tehsil: "67b33fda5d16d956725cd56b", // Muzaffarabad City
        city: "67b347cf886d49581b86b942",   // Hattian Bala
      },
      {
        name: "NA-149 Multan-I",
        tehsil: "67b33fda5d16d956725cd564", // Qasimabad
        city: "67b347cf886d49581b86b93b",   // Tando Muhammad Khan
      },
      {
        name: "NA-150 Hyderabad-I",
        tehsil: "67b33fda5d16d956725cd563", // Latifabad
        city: "67b347cf886d49581b86b93a",   // Tando Allahyar
      },
      {
        name: "NA-151 Rawalpindi-I",
        tehsil: "67b33fda5d16d956725cd565", // Peshawar City
        city: "67b347cf886d49581b86b93c",   // Peshawar Cantt
      },
      {
        name: "NA-152 Sialkot-I",
        tehsil: "67b33fda5d16d956725cd560", // Gulberg
        city: "67b347cf886d49581b86b937",   // Gulshan-e-Ravi
      },
      {
        name: "NA-153 Gujranwala-I",
        tehsil: "67b33fda5d16d956725cd561", // Jaranwala
        city: "67b347cf886d49581b86b938",   // Chak Jhumra
      },
      {
        name: "NA-154 Bahawalpur-I",
        tehsil: "67b33fda5d16d956725cd562", // Chiniot
        city: "67b347cf886d49581b86b939",   // Samundri
      },
    ];

    // Check if constituencies already exist to avoid duplicates
    const existingConstituencies = await Constituency.find();
    if (existingConstituencies.length === 0) {
      // Insert data into the database
      const result = await Constituency.insertMany(constituencies);
      console.log(`Inserted ${result.length} constituencies`);
    } else {
      console.log('Constituencies already exist in the database');
    }
  } catch (error) {
    console.error('Error inserting constituencies:', error.message);
  } finally {
    // Close the database connection if this script is run independently
    mongoose.connection.close();
  }
};

module.exports = insertConstituencies;