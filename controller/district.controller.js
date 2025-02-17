const mongoose = require('mongoose');
const District = require('../model/district.model');

// Get all districts
exports.getDistricts = async (req, res) => {
  try {
    const districts = await District.find().populate('province');
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts', error: error.message });
  }
};

// Get a single district by ID
exports.getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate('province');
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.status(200).json(district);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching district', error: error.message });
  }
};

// Create a new district
exports.createDistrict = async (req, res) => {
  try {
    const newDistrict = new District(req.body);
    await newDistrict.save();
    res.status(201).json(newDistrict);
  } catch (error) {
    res.status(500).json({ message: 'Error creating district', error: error.message });
  }
};

// Update a district by ID
exports.updateDistrict = async (req, res) => {
  try {
    const updatedDistrict = await District.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDistrict) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.status(200).json(updatedDistrict);
  } catch (error) {
    res.status(500).json({ message: 'Error updating district', error: error.message });
  }
};

// Delete a district by ID
exports.deleteDistrict = async (req, res) => {
  try {
    const deletedDistrict = await District.findByIdAndDelete(req.params.id);
    if (!deletedDistrict) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.status(200).json({ message: 'District deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting district', error: error.message });
  }
};

// Get all districts by province ID
exports.getDistrictsByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;

    // Validate if the provided provinceId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(provinceId)) {
      return res.status(400).json({ message: 'Invalid province ID' });
    }

    // Find all districts that reference the given province ID
    const districts = await District.find({ province: provinceId }).populate('province');

    if (districts.length === 0) {
      return res.status(404).json({ message: 'No districts found for the given province ID' });
    }

    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts by province', error: error.message });
  }
};