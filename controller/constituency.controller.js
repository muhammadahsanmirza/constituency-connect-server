const mongoose = require('mongoose');
const Constituency = require('../model/constituency.model');

// Get all constituencies
exports.getConstituencies = async (req, res) => {
  try {
    const constituencies = await Constituency.find()
      .populate('tehsil')
      .populate('city'); // Populate the single city field
    res.status(200).json(constituencies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching constituencies', error: error.message });
  }
};

// Get a single constituency by ID
exports.getConstituencyById = async (req, res) => {
  try {
    const constituency = await Constituency.findById(req.params.id)
      .populate('tehsil')
      .populate('city'); // Populate the single city field
    if (!constituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.status(200).json(constituency);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching constituency', error: error.message });
  }
};

// Create a new constituency
exports.createConstituency = async (req, res) => {
  try {
    const newConstituency = new Constituency(req.body);
    await newConstituency.save();
    res.status(201).json(newConstituency);
  } catch (error) {
    res.status(500).json({ message: 'Error creating constituency', error: error.message });
  }
};

// Update a constituency by ID
exports.updateConstituency = async (req, res) => {
  try {
    const updatedConstituency = await Constituency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedConstituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.status(200).json(updatedConstituency);
  } catch (error) {
    res.status(500).json({ message: 'Error updating constituency', error: error.message });
  }
};

// Delete a constituency by ID
exports.deleteConstituency = async (req, res) => {
  try {
    const deletedConstituency = await Constituency.findByIdAndDelete(req.params.id);
    if (!deletedConstituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.status(200).json({ message: 'Constituency deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting constituency', error: error.message });
  }
};

// Get all constituencies by tehsil and city IDs
exports.getConstituenciesByTehsilAndCity = async (req, res) => {
  try {
    const { tehsilId, cityId } = req.params;

    // Validate if the provided tehsilId and cityId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(tehsilId) || !mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: 'Invalid tehsil or city ID' });
    }

    // Find all constituencies that match both tehsil and city IDs
    const constituencies = await Constituency.find({
      tehsil: tehsilId,
      city: cityId,
    })
      .populate('tehsil')
      .populate('city');

    if (constituencies.length === 0) {
      return res.status(404).json({ message: 'No constituencies found for the given tehsil and city IDs' });
    }

    res.status(200).json(constituencies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching constituencies by tehsil and city', error: error.message });
  }
};