const Constituent = require('../model/constituent.model');
const { validateRegistrationData } = require('../utils/validation');

// Register a new constituent
const registerConstituent = async (req, res) => {
  try {
    const { name, cnic, password, phoneNumber, constituency, representative } = req.body;

    // Validate input data
    const validationErrors = validateRegistrationData({ name, cnic, password, phoneNumber, constituency, representative }, 'constituent');
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Check for existing user with the same CNIC or phone number
    const existingUser = await Constituent.findOne({ $or: [{ cnic }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ error: 'CNIC or phone number already registered.' });
    }

    // Create and save a new constituent
    const newConstituent = new Constituent({ name, cnic, password, phoneNumber, constituency, representative });
    await newConstituent.save();

    res.status(201).json({ message: 'Constituent registered successfully.' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Login a constituent
const loginConstituent = async (req, res) => {
  try {
    // Functionality will be implemented later
  } catch (error) {
    // Error handling
  }
};
// Get the All Constituents profile
const getAllConstituentsProfile = async (req, res) => {
  try {
    // Functionality will be implemented later
  } catch (error) {
    // Error handling
  }
};

// Get the logged-in user's profile
const getConstituentProfile = async (req, res) => {
  try {
    // Functionality will be implemented later
  } catch (error) {
    // Error handling
  }
};

// Update the logged-in user's profile
const updateConstituentProfile = async (req, res) => {
  try {
    // Functionality will be implemented later
  } catch (error) {
    // Error handling
  }
};

// Reset password
const resetConstituentPassword = async (req, res) => {
  try {
    // Functionality will be implemented later
  } catch (error) {
    // Error handling
  }
};

// Export each method
module.exports = {
  registerConstituent,
  loginConstituent,
  getAllConstituentsProfile,
  getConstituentProfile,
  updateConstituentProfile,
  resetConstituentPassword
};
