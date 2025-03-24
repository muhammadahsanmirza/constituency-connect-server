const mongoose = require('mongoose');
const City = require('../model/city.model');

/**
 * @swagger
 * /api/v1/city:
 *   get:
 *     summary: Get all cities
 *     tags: [City]
 *     description: Retrieve a list of all cities. Accessible by both constituents and representatives.
 *     responses:
 *       200:
 *         description: A list of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   tehsil:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: Server error
 */
exports.getCities = async (req, res) => {
  try {
    const cities = await City.find().populate('tehsil');
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cities', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/city/{id}:
 *   get:
 *     summary: Get a city by ID
 *     tags: [City]
 *     description: Retrieve a single city by its ID. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     responses:
 *       200:
 *         description: A city object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 tehsil:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: City not found
 *       500:
 *         description: Server error
 */
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate('tehsil');
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching city', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/city:
 *   post:
 *     summary: Create a new city
 *     tags: [City]
 *     description: Create a new city. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - tehsil
 *             properties:
 *               name:
 *                 type: string
 *               tehsil:
 *                 type: string
 *                 description: Tehsil ID
 *     responses:
 *       201:
 *         description: City created successfully
 *       500:
 *         description: Server error
 */
exports.createCity = async (req, res) => {
  try {
    const newCity = new City(req.body);
    await newCity.save();
    res.status(201).json(newCity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating city', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/city/{id}:
 *   put:
 *     summary: Update a city
 *     tags: [City]
 *     description: Update an existing city. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               tehsil:
 *                 type: string
 *                 description: Tehsil ID
 *     responses:
 *       200:
 *         description: City updated successfully
 *       404:
 *         description: City not found
 *       500:
 *         description: Server error
 */
exports.updateCity = async (req, res) => {
  try {
    const updatedCity = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCity) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json(updatedCity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating city', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/city/{id}:
 *   delete:
 *     summary: Delete a city
 *     tags: [City]
 *     description: Delete a city. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     responses:
 *       200:
 *         description: City deleted successfully
 *       404:
 *         description: City not found
 *       500:
 *         description: Server error
 */
exports.deleteCity = async (req, res) => {
  try {
    const deletedCity = await City.findByIdAndDelete(req.params.id);
    if (!deletedCity) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting city', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/city/tehsil/{tehsilId}:
 *   get:
 *     summary: Get cities by tehsil ID
 *     tags: [City]
 *     description: Retrieve all cities for a specific tehsil. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: tehsilId
 *         required: true
 *         schema:
 *           type: string
 *         description: The tehsil ID
 *     responses:
 *       200:
 *         description: A list of cities in the tehsil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   tehsil:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid tehsil ID
 *       404:
 *         description: No cities found for the tehsil
 *       500:
 *         description: Server error
 */
exports.getCitiesByTehsil = async (req, res) => {
  try {
    const { tehsilId } = req.params;

    // Validate if the provided tehsilId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(tehsilId)) {
      return res.status(400).json({ message: 'Invalid tehsil ID' });
    }

    // Find all cities that reference the given tehsil ID
    const cities = await City.find({ tehsil: tehsilId }).populate('tehsil');

    if (cities.length === 0) {
      return res.status(404).json({ message: 'No cities found for the given tehsil ID' });
    }

    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cities by tehsil', error: error.message });
  }
};