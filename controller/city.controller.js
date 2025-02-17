const City = require('../model/city.model');

// Get all cities
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find().populate('tehsil');
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cities', error: error.message });
  }
};

// Get a single city by ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate('tehsil');
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching city', error: error.message });
  }
};

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const newCity = new City(req.body);
    await newCity.save();
    res.status(201).json(newCity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating city', error: error.message });
  }
};

// Update a city by ID
exports.updateCity = async (req, res) => {
  try {
    const updatedCity = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCity) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json(updatedCity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating city', error: error.message });
  }
};

// Delete a city by ID
exports.deleteCity = async (req, res) => {
  try {
    const deletedCity = await City.findByIdAndDelete(req.params.id);
    if (!deletedCity) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting city', error: error.message });
  }
};
