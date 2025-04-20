const express = require('express');
const router = express.Router();
const interactionController = require('../controller/interaction.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/v1/interactions:
 *   post:
 *     summary: Create a new interaction
 *     tags: [Interactions]
 *     description: Create a new virtual meetup or physical interaction. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - date
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [virtual, physical]
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               meetingLink:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [zoom, google-meet, microsoft-teams, other]
 *               location:
 *                 type: string
 *               address:
 *                 type: string
 *               attendees:
 *                 type: number
 *     responses:
 *       200:
 *         description: Interaction created successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden - Only representatives can create interactions
 *       500:
 *         description: Server error
 */
router.post('/', verifyAccessToken, interactionController.createInteraction);

/**
 * @swagger
 * /api/v1/interactions/representative:
 *   get:
 *     summary: Get all interactions for a representative
 *     tags: [Interactions]
 *     description: Retrieve all interactions created by the authenticated representative.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [virtual, physical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Interactions retrieved successfully
 *       403:
 *         description: Forbidden - Only representatives can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/representative', verifyAccessToken, interactionController.getRepresentativeInteractions);

/**
 * @swagger
 * /api/v1/interactions/{id}:
 *   get:
 *     summary: Get a specific interaction
 *     tags: [Interactions]
 *     description: Retrieve a specific interaction by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interaction retrieved successfully
 *       403:
 *         description: Forbidden - Not authorized to view this interaction
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyAccessToken, interactionController.getInteraction);

/**
 * @swagger
 * /api/v1/interactions/{id}:
 *   put:
 *     summary: Update an interaction
 *     tags: [Interactions]
 *     description: Update a specific interaction by ID. Only accessible by the representative who created it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Interaction updated successfully
 *       403:
 *         description: Forbidden - Only the creator can update this interaction
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyAccessToken, interactionController.updateInteraction);

/**
 * @swagger
 * /api/v1/interactions/{id}:
 *   delete:
 *     summary: Delete an interaction
 *     tags: [Interactions]
 *     description: Delete a specific interaction by ID. Only accessible by the representative who created it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interaction deleted successfully
 *       403:
 *         description: Forbidden - Only the creator can delete this interaction
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyAccessToken, interactionController.deleteInteraction);

/**
 * @swagger
 * /api/v1/interactions/{id}/status:
 *   patch:
 *     summary: Update interaction status
 *     tags: [Interactions]
 *     description: Update the status of a specific interaction. Only accessible by the representative who created it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *     responses:
 *       200:
 *         description: Interaction status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Forbidden - Only the creator can update this interaction
 *       404:
 *         description: Interaction not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', verifyAccessToken, interactionController.updateInteractionStatus);

module.exports = router;