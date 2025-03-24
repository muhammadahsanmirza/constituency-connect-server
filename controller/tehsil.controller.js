const mongoose = require('mongoose');
const Tehsil = require('../model/tehsil.model');

/**
 * @swagger
 * /api/v1/tehsil:
 *   get:
 *     summary: Get all tehsils
 *     tags: [Tehsil]
 *     description: Retrieve a list of all tehsils. Accessible by both constituents and representatives.
 *     responses:
 *       200:
 *         description: A list of tehsils
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
 *                   district:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: Server error
 */
exports.getTehsils = async (req, res) => {
  try {
    const tehsils = await Tehsil.find().populate('district');
    res.status(200).json(tehsils);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tehsils', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/tehsil/{id}:
 *   get:
 *     summary: Get a tehsil by ID
 *     tags: [Tehsil]
 *     description: Retrieve a single tehsil by its ID. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tehsil ID
 *     responses:
 *       200:
 *         description: A tehsil object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 district:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Tehsil not found
 *       500:
 *         description: Server error
 */
exports.getTehsilById = async (req, res) => {
  try {
    const tehsil = await Tehsil.findById(req.params.id).populate('district');
    if (!tehsil) {
      return res.status(404).json({ message: 'Tehsil not found' });
    }
    res.status(200).json(tehsil);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tehsil', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/tehsil:
 *   post:
 *     summary: Create a new tehsil
 *     tags: [Tehsil]
 *     description: Create a new tehsil. Only accessible by representatives.
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
 *               - district
 *             properties:
 *               name:
 *                 type: string
 *               district:
 *                 type: string
 *                 description: District ID
 *     responses:
 *       201:
 *         description: Tehsil created successfully
 *       500:
 *         description: Server error
 */
exports.createTehsil = async (req, res) => {
  try {
    const newTehsil = new Tehsil(req.body);
    await newTehsil.save();
    res.status(201).json(newTehsil);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tehsil', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/tehsil/{id}:
 *   put:
 *     summary: Update a tehsil
 *     tags: [Tehsil]
 *     description: Update an existing tehsil. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tehsil ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               district:
 *                 type: string
 *                 description: District ID
 *     responses:
 *       200:
 *         description: Tehsil updated successfully
 *       404:
 *         description: Tehsil not found
 *       500:
 *         description: Server error
 */
exports.updateTehsil = async (req, res) => {
  try {
    const updatedTehsil = await Tehsil.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTehsil) {
      return res.status(404).json({ message: 'Tehsil not found' });
    }
    res.status(200).json(updatedTehsil);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tehsil', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/tehsil/{id}:
 *   delete:
 *     summary: Delete a tehsil
 *     tags: [Tehsil]
 *     description: Delete a tehsil. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tehsil ID
 *     responses:
 *       200:
 *         description: Tehsil deleted successfully
 *       404:
 *         description: Tehsil not found
 *       500:
 *         description: Server error
 */
exports.deleteTehsil = async (req, res) => {
  try {
    const deletedTehsil = await Tehsil.findByIdAndDelete(req.params.id);
    if (!deletedTehsil) {
      return res.status(404).json({ message: 'Tehsil not found' });
    }
    res.status(200).json({ message: 'Tehsil deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tehsil', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/tehsil/district/{districtId}:
 *   get:
 *     summary: Get tehsils by district ID
 *     tags: [Tehsil]
 *     description: Retrieve all tehsils for a specific district. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: districtId
 *         required: true
 *         schema:
 *           type: string
 *         description: The district ID
 *     responses:
 *       200:
 *         description: A list of tehsils in the district
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
 *                   district:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid district ID
 *       404:
 *         description: No tehsils found for the district
 *       500:
 *         description: Server error
 */
exports.getTehsilsByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    // Validate if the provided districtId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(districtId)) {
      return res.status(400).json({ message: 'Invalid district ID' });
    }

    // Find all tehsils that reference the given district ID
    const tehsils = await Tehsil.find({ district: districtId }).populate('district');

    if (tehsils.length === 0) {
      return res.status(404).json({ message: 'No tehsils found for the given district ID' });
    }

    res.status(200).json(tehsils);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tehsils by district', error: error.message });
  }
};