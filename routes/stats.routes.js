const express = require('express');
const router = express.Router();
const statsController = require('../controller/stats.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/v1/stats/constituent/complaints:
 *   get:
 *     summary: Get complaint statistics for a constituent's representative
 *     tags: [Statistics]
 *     description: Retrieve complaint statistics for the representative assigned to the authenticated constituent.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Forbidden - Only constituents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/constituent/complaints', verifyAccessToken, statsController.getConstituentComplaintStats);

/**
 * @swagger
 * /api/v1/stats/representative/complaints:
 *   get:
 *     summary: Get complaint statistics for a representative
 *     tags: [Statistics]
 *     description: Retrieve complaint statistics for the authenticated representative.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Forbidden - Only representatives can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/representative/complaints', verifyAccessToken, statsController.getRepresentativeComplaintStats);

/**
 * @swagger
 * /api/v1/stats/complaints/trends:
 *   get:
 *     summary: Get complaint trends over time
 *     tags: [Statistics]
 *     description: Retrieve complaint trends over time for the appropriate representative.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, week, year]
 *         description: Grouping period (default is month)
 *     responses:
 *       200:
 *         description: Trends retrieved successfully
 *       403:
 *         description: Forbidden - Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/complaints/trends', verifyAccessToken, statsController.getComplaintTrends);

/**
 * @swagger
 * /api/v1/stats/complaints/categories:
 *   get:
 *     summary: Get complaint category distribution
 *     tags: [Statistics]
 *     description: Retrieve complaint category distribution for the appropriate representative.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       403:
 *         description: Forbidden - Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/complaints/categories', verifyAccessToken, statsController.getComplaintCategories);

/**
 * @swagger
 * /api/v1/stats/interactions:
 *   get:
 *     summary: Get interaction statistics
 *     tags: [Statistics]
 *     description: Retrieve virtual meetup and physical interaction statistics for the appropriate representative.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Interaction statistics retrieved successfully
 *       403:
 *         description: Forbidden - Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/interactions', verifyAccessToken, statsController.getInteractionStats);

module.exports = router;