const express = require('express');
const router = express.Router();
const provinceController = require('../controller/province.controller');

// Define routes for Province

// Get all provinces
router.get('/', provinceController.getProvinces);

// Get a single province by ID
router.get('/:id', provinceController.getProvinceById);

// Create a new province
router.post('/', provinceController.createProvince);

// Update a province by ID
router.put('/:id', provinceController.updateProvince);

// Delete a province by ID
router.delete('/:id', provinceController.deleteProvince);

module.exports = router;
