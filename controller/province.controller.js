const Province = require('../model/province.model');

// Get all provinces
exports.getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find();
    res.status(200).json(provinces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provinces', error: error.message });
  }
};

// Get a single province by ID
exports.getProvinceById = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);
    if (!province) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json(province);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching province', error: error.message });
  }
};

// Create a new province
exports.createProvince = async (req, res) => {
  try {
    const newProvince = new Province(req.body);
    await newProvince.save();
    res.status(201).json(newProvince);
  } catch (error) {
    res.status(500).json({ message: 'Error creating province', error: error.message });
  }
};

// Update a province by ID
exports.updateProvince = async (req, res) => {
  try {
    const updatedProvince = await Province.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProvince) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json(updatedProvince);
  } catch (error) {
    res.status(500).json({ message: 'Error updating province', error: error.message });
  }
};

// Delete a province by ID
exports.deleteProvince = async (req, res) => {
  try {
    const deletedProvince = await Province.findByIdAndDelete(req.params.id);
    if (!deletedProvince) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json({ message: 'Province deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting province', error: error.message });
  }
};
