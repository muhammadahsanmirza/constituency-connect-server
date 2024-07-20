const express = require('express');
const router = express.Router();
const {registerConstituent,
    loginConstituent,
    getAllConstituentsProfile,
    getConstituentProfile,
    updateConstituentProfile,
    resetConstituentPassword
} = require('../controller/constituent.controller')

// Register a new constituent
router.post('/register', registerConstituent);

// Login a constituent
router.post('/login', loginConstituent);

// Get the All Constituents profile
router.get('/profile', getAllConstituentsProfile);

// Get the logged-in user's profile
router.get('/profile:id', getConstituentProfile);

// Update the logged-in user's profile
router.put('/profile', updateConstituentProfile);

// Reset password (optional)
router.post('/reset-password', resetConstituentPassword);

module.exports = router;
