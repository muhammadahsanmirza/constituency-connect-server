const express = require('express');
const router = express.Router();
const districtController = require('../controller/district.controller');

// Define routes for District
// Get all districts
router.get('/', districtController.getDistricts);

// Get all districts by province ID
router.get('/province/:provinceId', districtController.getDistrictsByProvince);

// Get a single district by ID
router.get('/:id', districtController.getDistrictById);

// Create a new district
router.post('/', districtController.createDistrict);

// Update a district by ID
router.put('/:id', districtController.updateDistrict);

// Delete a district by ID
router.delete('/:id', districtController.deleteDistrict);

module.exports = router;