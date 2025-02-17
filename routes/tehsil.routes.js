const express = require('express');
const router = express.Router();
const tehsilController = require('../controller/tehsil.controller');

// Define routes for Tehsil

// Get all tehsils
router.get('/', tehsilController.getTehsils);

// Get a single tehsil by ID
router.get('/:id', tehsilController.getTehsilById);

// Create a new tehsil
router.post('/', tehsilController.createTehsil);

// Update a tehsil by ID
router.put('/:id', tehsilController.updateTehsil);

// Delete a tehsil by ID
router.delete('/:id', tehsilController.deleteTehsil);

module.exports = router;
