const mongoose = require('mongoose');
const Constituency = require('../model/constituency.model');

/**
 * @swagger
 * /api/v1/constituency:
 *   get:
 *     summary: Get all constituencies
 *     tags: [Constituency]
 *     description: Retrieve a list of all constituencies. Accessible by both constituents and representatives.
 *     responses:
 *       200:
 *         description: A list of constituencies
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
 *                   city:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       500:
 *         description: Server error
 */
exports.getConstituencies = async (req, res) => {
  try {
    const constituencies = await Constituency.find()
      .populate('tehsil')
      .populate('city'); // Populate the single city field
    res.status(200).json(constituencies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching constituencies', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/constituency/{id}:
 *   get:
 *     summary: Get a constituency by ID
 *     tags: [Constituency]
 *     description: Retrieve a single constituency by its ID. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The constituency ID
 *     responses:
 *       200:
 *         description: A constituency object
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
 *                 city:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Server error
 */
exports.getConstituencyById = async (req, res) => {
  try {
    const constituency = await Constituency.findById(req.params.id)
      .populate('tehsil')
      .populate('city'); // Populate the single city field
    if (!constituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.status(200).json(constituency);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching constituency', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/constituency:
 *   post:
 *     summary: Create a new constituency
 *     tags: [Constituency]
 *     description: Create a new constituency. Only accessible by representatives.
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
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               tehsil:
 *                 type: string
 *                 description: Tehsil ID
 *               city:
 *                 type: string
 *                 description: City ID
 *     responses:
 *       201:
 *         description: Constituency created successfully
 *       500:
 *         description: Server error
 */
exports.createConstituency = async (req, res) => {
  try {
    const newConstituency = new Constituency(req.body);
    await newConstituency.save();
    res.status(201).json(newConstituency);
  } catch (error) {
    res.status(500).json({ message: 'Error creating constituency', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/constituency/{id}:
 *   put:
 *     summary: Update a constituency
 *     tags: [Constituency]
 *     description: Update an existing constituency. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The constituency ID
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
 *               city:
 *                 type: string
 *                 description: City ID
 *     responses:
 *       200:
 *         description: Constituency updated successfully
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Server error
 */
exports.updateConstituency = async (req, res) => {
  try {
    const updatedConstituency = await Constituency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedConstituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.status(200).json(updatedConstituency);
  } catch (error) {
    res.status(500).json({ message: 'Error updating constituency', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/constituency/{id}:
 *   delete:
 *     summary: Delete a constituency
 *     tags: [Constituency]
 *     description: Delete a constituency. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The constituency ID
 *     responses:
 *       200:
 *         description: Constituency deleted successfully
 *       404:
 *         description: Constituency not found
 *       500:
 *         description: Server error
 */
exports.deleteConstituency = async (req, res) => {
  try {
    const deletedConstituency = await Constituency.findByIdAndDelete(req.params.id);
    if (!deletedConstituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.status(200).json({ message: 'Constituency deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting constituency', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/constituency/tehsil/{tehsilId}/city/{cityId}:
 *   get:
 *     summary: Get constituencies by tehsil and city IDs
 *     tags: [Constituency]
 *     description: Retrieve all constituencies for a specific tehsil and city. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: tehsilId
 *         required: true
 *         schema:
 *           type: string
 *         description: The tehsil ID
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The city ID
 *     responses:
 *       200:
 *         description: A list of constituencies in the tehsil and city
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
 *                   city:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid tehsil or city ID
 *       404:
 *         description: No constituencies found
 *       500:
 *         description: Server error
 */
exports.getConstituenciesByTehsilAndCity = async (req, res) => {
  try {
    const { tehsilId, cityId } = req.params;

    // Validate if the provided tehsilId and cityId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(tehsilId) || !mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: 'Invalid tehsil or city ID' });
    }

    // Find all constituencies that match both tehsil and city IDs
    const constituencies = await Constituency.find({
      tehsil: tehsilId,
      city: cityId,
    })
      .populate('tehsil')
      .populate('city');

    if (constituencies.length === 0) {
      return res.status(404).json({ message: 'No constituencies found for the given tehsil and city IDs' });
    }

    res.status(200).json(constituencies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching constituencies by tehsil and city', error: error.message });
  }
};