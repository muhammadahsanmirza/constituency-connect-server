const express = require('express');
const router = express.Router();
const zoomController = require('../controller/zoom.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/v1/zoom/meeting:
 *   post:
 *     summary: Create a new Zoom meeting
 *     tags: [Zoom]
 *     description: Create a new Zoom meeting. Only accessible by representatives.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - startTime
 *               - duration
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Meeting topic/title
 *               agenda:
 *                 type: string
 *                 description: Meeting agenda/description
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Meeting start time (ISO format)
 *               duration:
 *                 type: number
 *                 minimum: 15
 *                 maximum: 300
 *                 description: Meeting duration in minutes (15-300)
 *     responses:
 *       200:
 *         description: Meeting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Zoom meeting created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ZoomMeeting'
 *       403:
 *         description: Forbidden - Only representatives can create meetings
 *       500:
 *         description: Server error
 */
router.post('/meeting', verifyAccessToken, zoomController.createZoomMeeting);

/**
 * @swagger
 * /api/v1/zoom/representative:
 *   get:
 *     summary: Get all Zoom meetings for a representative
 *     tags: [Zoom]
 *     description: Retrieve all Zoom meetings created by the authenticated representative with optional filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: Filter meetings by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meetings starting on or after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meetings starting on or before this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Meetings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Meetings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ZoomMeeting'
 *       403:
 *         description: Forbidden - Only representatives can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/representative', verifyAccessToken, zoomController.getRepresentativeMeetings);

/**
 * @swagger
 * /api/v1/zoom/constituent:
 *   get:
 *     summary: Get all Zoom meetings for a constituent
 *     tags: [Zoom]
 *     description: Retrieve all Zoom meetings the authenticated constituent is invited to with optional filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: Filter meetings by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meetings starting on or after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter meetings starting on or before this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Meetings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Meetings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ZoomMeeting'
 *       403:
 *         description: Forbidden - Only constituents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/constituent', verifyAccessToken, zoomController.getConstituentMeetings);

/**
 * @swagger
 * /api/v1/zoom/meeting/{id}:
 *   get:
 *     summary: Get a specific Zoom meeting by ID
 *     tags: [Zoom]
 *     description: Retrieve details of a specific Zoom meeting. Representatives can only view their own meetings, and constituents can only view meetings they are invited to.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Meeting retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ZoomMeeting'
 *       403:
 *         description: Forbidden - Unauthorized access
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Server error
 */
router.get('/meeting/:id', verifyAccessToken, zoomController.getMeetingById);

/**
 * @swagger
 * /api/v1/zoom/meeting/{id}:
 *   put:
 *     summary: Update a Zoom meeting
 *     tags: [Zoom]
 *     description: Update an existing Zoom meeting. Only accessible by the representative who created the meeting.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Meeting topic/title
 *               agenda:
 *                 type: string
 *                 description: Meeting agenda/description
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Meeting start time (ISO format)
 *               duration:
 *                 type: number
 *                 minimum: 15
 *                 maximum: 300
 *                 description: Meeting duration in minutes (15-300)
 *               password:
 *                 type: string
 *                 description: Meeting password
 *               constituents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of constituent user IDs to invite
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *                 description: Meeting status
 *     responses:
 *       200:
 *         description: Meeting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Meeting updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ZoomMeeting'
 *       403:
 *         description: Forbidden - Only the meeting creator can update it
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Server error
 */
router.put('/meeting/:id', verifyAccessToken, zoomController.updateMeeting);

/**
 * @swagger
 * /api/v1/zoom/meeting/{id}:
 *   delete:
 *     summary: Delete a Zoom meeting
 *     tags: [Zoom]
 *     description: Delete an existing Zoom meeting. Only accessible by the representative who created the meeting.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Meeting deleted successfully
 *       403:
 *         description: Forbidden - Only the meeting creator can delete it
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Server error
 */
router.delete('/meeting/:id', verifyAccessToken, zoomController.deleteMeeting);

/**
 * @swagger
 * components:
 *   schemas:
 *     ZoomMeeting:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB document ID
 *         topic:
 *           type: string
 *           description: Meeting topic/title
 *         agenda:
 *           type: string
 *           description: Meeting agenda/description
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Meeting start time
 *         duration:
 *           type: number
 *           description: Meeting duration in minutes
 *         password:
 *           type: string
 *           description: Meeting password
 *         zoomMeetingId:
 *           type: string
 *           description: Zoom's internal meeting ID
 *         joinUrl:
 *           type: string
 *           description: URL to join the meeting
 *         hostEmail:
 *           type: string
 *           description: Email of the meeting host
 *         representative:
 *           type: object
 *           description: Representative who created the meeting
 *         constituents:
 *           type: array
 *           items:
 *             type: object
 *           description: Constituents invited to the meeting
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *           description: Current status of the meeting
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the meeting was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the meeting was last updated
 */

module.exports = router;