const express = require('express');
const router = express.Router();
const feedbackController = require('../controller/feedback.controller');
// Update this path to match your project structure
const { verifyAccessToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/v1/feedback:
 *   post:
 *     summary: Submit feedback for a resolved complaint
 *     tags: [Feedback]
 *     description: Submit feedback for a resolved complaint. Only accessible by constituents for their own resolved complaints. Feedback can only be submitted once per complaint.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - complaintId
 *               - rating
 *             properties:
 *               complaintId:
 *                 type: string
 *                 description: ID of the resolved complaint
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *               comment:
 *                 type: string
 *                 description: Optional feedback comment
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid request or feedback already submitted
 *       403:
 *         description: Forbidden - Only constituents can submit feedback for their own resolved complaints
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.post('/', verifyAccessToken, feedbackController.submitFeedback);

/**
 * @swagger
 * /api/v1/feedback/complaint/{id}:
 *   get:
 *     summary: Get feedback for a specific complaint
 *     tags: [Feedback]
 *     description: Retrieve feedback for a specific complaint. Constituents can only view feedback for their own complaints. Representatives can only view feedback for complaints assigned to them.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The complaint ID
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *       403:
 *         description: Forbidden - Not authorized to view this feedback
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Server error
 */
router.get('/complaint/:id', verifyAccessToken, feedbackController.getFeedbackByComplaintId);

/**
 * @swagger
 * /api/v1/feedback/representative:
 *   get:
 *     summary: Get all feedbacks for a representative
 *     tags: [Feedback]
 *     description: Retrieve all feedbacks for complaints assigned to the authenticated representative. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
 *       403:
 *         description: Forbidden - Only representatives can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/representative', verifyAccessToken, feedbackController.getRepresentativeFeedbacks);

/**
 * @swagger
 * /api/v1/feedback/constituent:
 *   get:
 *     summary: Get all feedbacks submitted by a constituent
 *     tags: [Feedback]
 *     description: Retrieve all feedbacks submitted by the authenticated constituent. Only accessible by constituents.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
 *       403:
 *         description: Forbidden - Only constituents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/constituent', verifyAccessToken, feedbackController.getConstituentFeedbacks);

/**
 * @swagger
 * /api/v1/feedback/statistics:
 *   get:
 *     summary: Get feedback statistics for a representative
 *     tags: [Feedback]
 *     description: Retrieve feedback statistics for the authenticated representative. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedback statistics retrieved successfully
 *       403:
 *         description: Forbidden - Only representatives can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/statistics', verifyAccessToken, feedbackController.getFeedbackStatistics);

module.exports = router;