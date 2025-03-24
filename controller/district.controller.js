const mongoose = require('mongoose');
const District = require('../model/district.model');

/**
 * @swagger
 * /api/v1/district:
 *   get:
 *     summary: Get all districts
 *     tags: [District]
 *     description: Retrieve a list of all districts. Accessible by both constituents and representatives.
 *     responses:
 *       200:
 *         description: A list of districts
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
 *                   province:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: Server error
 */
exports.getDistricts = async (req, res) => {
  try {
    const districts = await District.find().populate('province');
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/district/{id}:
 *   get:
 *     summary: Get a district by ID
 *     tags: [District]
 *     description: Retrieve a single district by its ID. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The district ID
 *     responses:
 *       200:
 *         description: A district object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 province:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: District not found
 *       500:
 *         description: Server error
 */
exports.getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate('province');
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.status(200).json(district);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching district', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/district:
 *   post:
 *     summary: Create a new district
 *     tags: [District]
 *     description: Create a new district. Only accessible by representatives.
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
 *               - province
 *             properties:
 *               name:
 *                 type: string
 *               province:
 *                 type: string
 *                 description: Province ID
 *     responses:
 *       201:
 *         description: District created successfully
 *       500:
 *         description: Server error
 */
exports.createDistrict = async (req, res) => {
  try {
    const newDistrict = new District(req.body);
    await newDistrict.save();
    res.status(201).json(newDistrict);
  } catch (error) {
    res.status(500).json({ message: 'Error creating district', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/district/{id}:
 *   put:
 *     summary: Update a district
 *     tags: [District]
 *     description: Update an existing district. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The district ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               province:
 *                 type: string
 *                 description: Province ID
 *     responses:
 *       200:
 *         description: District updated successfully
 *       404:
 *         description: District not found
 *       500:
 *         description: Server error
 */
exports.updateDistrict = async (req, res) => {
  try {
    const updatedDistrict = await District.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDistrict) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.status(200).json(updatedDistrict);
  } catch (error) {
    res.status(500).json({ message: 'Error updating district', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/district/{id}:
 *   delete:
 *     summary: Delete a district
 *     tags: [District]
 *     description: Delete a district. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The district ID
 *     responses:
 *       200:
 *         description: District deleted successfully
 *       404:
 *         description: District not found
 *       500:
 *         description: Server error
 */
exports.deleteDistrict = async (req, res) => {
  try {
    const deletedDistrict = await District.findByIdAndDelete(req.params.id);
    if (!deletedDistrict) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.status(200).json({ message: 'District deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting district', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/district/province/{provinceId}:
 *   get:
 *     summary: Get districts by province ID
 *     tags: [District]
 *     description: Retrieve all districts for a specific province. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The province ID
 *     responses:
 *       200:
 *         description: A list of districts in the province
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
 *                   province:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid province ID
 *       404:
 *         description: No districts found for the province
 *       500:
 *         description: Server error
 */
exports.getDistrictsByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;

    // Validate if the provided provinceId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(provinceId)) {
      return res.status(400).json({ message: 'Invalid province ID' });
    }

    // Find all districts that reference the given province ID
    const districts = await District.find({ province: provinceId }).populate('province');

    if (districts.length === 0) {
      return res.status(404).json({ message: 'No districts found for the given province ID' });
    }

    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching districts by province', error: error.message });
  }
};