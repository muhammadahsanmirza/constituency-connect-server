const express = require('express');
const router = express.Router();
const constituencyController = require('../controller/constituency.controller');

// Define routes for Constituency
// Get all constituencies
router.get('/', constituencyController.getConstituencies);

// Get all constituencies by tehsil and city IDs
router.get('/tehsil/:tehsilId/city/:cityId', constituencyController.getConstituenciesByTehsilAndCity);

// Get a single constituency by ID
router.get('/:id', constituencyController.getConstituencyById);

// Create a new constituency
router.post('/', constituencyController.createConstituency);

// Update a constituency by ID
router.put('/:id', constituencyController.updateConstituency);

// Delete a constituency by ID
router.delete('/:id', constituencyController.deleteConstituency);

module.exports = router;