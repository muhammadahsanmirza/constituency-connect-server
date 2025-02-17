const mongoose = require('mongoose');
const Tehsil = require('../model/tehsil.model');

// Get all tehsils
exports.getTehsils = async (req, res) => {
  try {
    const tehsils = await Tehsil.find().populate('district');
    res.status(200).json(tehsils);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tehsils', error: error.message });
  }
};

// Get a single tehsil by ID
exports.getTehsilById = async (req, res) => {
  try {
    const tehsil = await Tehsil.findById(req.params.id).populate('district');
    if (!tehsil) {
      return res.status(404).json({ message: 'Tehsil not found' });
    }
    res.status(200).json(tehsil);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tehsil', error: error.message });
  }
};

// Create a new tehsil
exports.createTehsil = async (req, res) => {
  try {
    const newTehsil = new Tehsil(req.body);
    await newTehsil.save();
    res.status(201).json(newTehsil);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tehsil', error: error.message });
  }
};

// Update a tehsil by ID
exports.updateTehsil = async (req, res) => {
  try {
    const updatedTehsil = await Tehsil.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTehsil) {
      return res.status(404).json({ message: 'Tehsil not found' });
    }
    res.status(200).json(updatedTehsil);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tehsil', error: error.message });
  }
};

// Delete a tehsil by ID
exports.deleteTehsil = async (req, res) => {
  try {
    const deletedTehsil = await Tehsil.findByIdAndDelete(req.params.id);
    if (!deletedTehsil) {
      return res.status(404).json({ message: 'Tehsil not found' });
    }
    res.status(200).json({ message: 'Tehsil deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tehsil', error: error.message });
  }
};

// Get all tehsils by district ID
exports.getTehsilsByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    // Validate if the provided districtId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(districtId)) {
      return res.status(400).json({ message: 'Invalid district ID' });
    }

    // Find all tehsils that reference the given district ID
    const tehsils = await Tehsil.find({ district: districtId }).populate('district');

    if (tehsils.length === 0) {
      return res.status(404).json({ message: 'No tehsils found for the given district ID' });
    }

    res.status(200).json(tehsils);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tehsils by district', error: error.message });
  }
};