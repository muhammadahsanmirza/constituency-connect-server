const Province = require('../model/province.model');

/**
 * @swagger
 * /api/v1/province:
 *   get:
 *     summary: Get all provinces
 *     tags: [Province]
 *     description: Retrieve a list of all provinces. Accessible by both constituents and representatives.
 *     responses:
 *       200:
 *         description: A list of provinces
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
 *       500:
 *         description: Server error
 */
exports.getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find();
    res.status(200).json(provinces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching provinces', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/province/{id}:
 *   get:
 *     summary: Get a province by ID
 *     tags: [Province]
 *     description: Retrieve a single province by its ID. Accessible by both constituents and representatives.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The province ID
 *     responses:
 *       200:
 *         description: A province object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Province not found
 *       500:
 *         description: Server error
 */
exports.getProvinceById = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);
    if (!province) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json(province);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching province', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/province:
 *   post:
 *     summary: Create a new province
 *     tags: [Province]
 *     description: Create a new province. Only accessible by representatives.
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Province created successfully
 *       500:
 *         description: Server error
 */
exports.createProvince = async (req, res) => {
  try {
    const newProvince = new Province(req.body);
    await newProvince.save();
    res.status(201).json(newProvince);
  } catch (error) {
    res.status(500).json({ message: 'Error creating province', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/province/{id}:
 *   put:
 *     summary: Update a province
 *     tags: [Province]
 *     description: Update an existing province. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The province ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Province updated successfully
 *       404:
 *         description: Province not found
 *       500:
 *         description: Server error
 */
exports.updateProvince = async (req, res) => {
  try {
    const updatedProvince = await Province.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProvince) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json(updatedProvince);
  } catch (error) {
    res.status(500).json({ message: 'Error updating province', error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/province/{id}:
 *   delete:
 *     summary: Delete a province
 *     tags: [Province]
 *     description: Delete a province. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The province ID
 *     responses:
 *       200:
 *         description: Province deleted successfully
 *       404:
 *         description: Province not found
 *       500:
 *         description: Server error
 */
exports.deleteProvince = async (req, res) => {
  try {
    const deletedProvince = await Province.findByIdAndDelete(req.params.id);
    if (!deletedProvince) {
      return res.status(404).json({ message: 'Province not found' });
    }
    res.status(200).json({ message: 'Province deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting province', error: error.message });
  }
};
