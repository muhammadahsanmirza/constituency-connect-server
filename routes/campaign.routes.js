const express = require('express');
const router = express.Router();
const campaignController = require('../controller/campaign.controller');
const { verifyAccessToken, isRepresentative } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Add this logging middleware at the very top
router.use((req, res, next) => {
  console.log('Campaign route accessed:', req.method, req.path);
  next();
});

// Add this test route before any authenticated routes
router.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Campaign route is working' });
});

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - representative
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Campaign title
 *         description:
 *           type: string
 *           description: HTML content from text editor
 *         representative:
 *           type: string
 *           description: ID of the representative who created the campaign
 *         imagePath:
 *           type: string
 *           description: Path to the campaign image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the campaign was created
 */

/**
 * @swagger
 * /api/v1/campaign:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     description: Create a new campaign. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 description: HTML content from text editor
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden - Only representatives can create campaigns
 *       500:
 *         description: Server error
 */
router.post('/', verifyAccessToken, isRepresentative, upload.single('image'), (req, res) => {
  campaignController.createCampaign(req, res);
});

/**
 * @swagger
 * /api/v1/campaign/my-representative:
 *   get:
 *     summary: Get campaigns by constituent's representative
 *     tags: [Campaigns]
 *     description: Retrieve all campaigns created by the constituent's representative. Only accessible by constituents.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of campaigns from the constituent's representative
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 *       403:
 *         description: Forbidden - Only constituents can access this endpoint
 *       404:
 *         description: No representative found for this constituent
 *       500:
 *         description: Server error
 */
router.get('/my-representative', verifyAccessToken, (req, res) => {
  campaignController.getCampaignsByMyRepresentative(req, res);
});

/**
 * @swagger
 * /api/v1/campaign/representative/{representativeId}:
 *   get:
 *     summary: Get campaigns by representative ID
 *     tags: [Campaigns]
 *     description: Retrieve all campaigns for a specific representative. Accessible by both constituents and representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: representativeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The representative ID
 *     responses:
 *       200:
 *         description: A list of campaigns for the representative
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: No campaigns found for this representative
 *       500:
 *         description: Server error
 */
router.get('/representative/:representativeId', verifyAccessToken, (req, res) => {
  campaignController.getCampaignsByRepresentative(req, res);
});

/**
 * @swagger
 * /api/v1/campaign/{id}:
 *   get:
 *     summary: Get a campaign by ID
 *     tags: [Campaigns]
 *     description: Retrieve a single campaign by its ID. Accessible by both constituents and representatives.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The campaign ID
 *     responses:
 *       200:
 *         description: A campaign object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyAccessToken, (req, res) => {
  campaignController.getCampaignById(req, res);
});

/**
 * @swagger
 * /api/v1/campaign/{id}:
 *   put:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     description: Update an existing campaign. Only accessible by the representative who created it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 description: HTML content from text editor
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       403:
 *         description: Forbidden - Not authorized to update this campaign
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyAccessToken, upload.single('image'), (req, res) => {
  campaignController.updateCampaign(req, res);
});

/**
 * @swagger
 * /api/v1/campaign/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     description: Delete a campaign. Only accessible by the representative who created it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The campaign ID
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       403:
 *         description: Forbidden - Not authorized to delete this campaign
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyAccessToken, (req, res) => {
  campaignController.deleteCampaign(req, res);
});

/**
 * @swagger
 * /api/v1/campaign:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     description: Retrieve a list of all campaigns. For representatives, returns their own campaigns. For constituents, returns campaigns from their constituency.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 *       500:
 *         description: Server error
 */
router.get('/', verifyAccessToken, (req, res) => {
  campaignController.getCampaigns(req, res);
});

module.exports = router;