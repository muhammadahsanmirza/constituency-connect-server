const express = require('express');
const router = express.Router();
const complaintController = require('../controller/complaint.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { uploadFields } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * /api/v1/complaint:
 *   post:
 *     summary: Submit a new complaint
 *     tags: [Complaints]
 *     description: Submit a new complaint. Only accessible by constituents. The representative is automatically assigned based on the constituent's JWT token.
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
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [infrastructure, education, healthcare, security, other]
 *               attachment1:
 *                 type: string
 *                 format: binary
 *                 description: First image attachment (optional)
 *               attachment2:
 *                 type: string
 *                 format: binary
 *                 description: Second image attachment (optional)
 *               attachment3:
 *                 type: string
 *                 format: binary
 *                 description: Third image attachment (optional)
 *     responses:
 *       200:
 *         description: Complaint submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Complaint'
 *       403:
 *         description: Forbidden - Only constituents can submit complaints
 *       500:
 *         description: Server error
 */
// Update the route to handle multiple file uploads
// Update the route to use the fields middleware
router.post('/', verifyAccessToken, uploadFields, complaintController.submitComplaint);

/**
 * @swagger
 * /api/v1/complaint/representative:
 *   get:
 *     summary: Get complaints for a representative 
 *     tags: [Complaints]
 *     description: /api/v1/complaint/representative?title=road&category=infrastructure&status=pending&dateFilter=this-month&page=1&limit=20
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter complaints by title (case-insensitive partial match)
 *         example: road issue
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [infrastructure, education, healthcare, security, other]
 *         description: Filter complaints by exact category
 *         example: infrastructure
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, resolved, rejected]
 *         description: Filter complaints by status
 *         example: pending
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: string
 *           enum: [today, this-week, this-month, this-year]
 *         description: Filter complaints by predefined date ranges based on createdAt field
 *         example: this-month
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of complaints per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Complaints retrieved successfully
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
 *                   example: Complaints retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     complaints:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Complaint'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 120
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not a representative
 *       500:
 *         description: Server error
 *     x-code-samples:
 *       - lang: url
 *         source: |
 *           # Basic request
 *           /api/v1/complaint/representative
 *           
 *           # Filter by title
 *           /api/v1/complaint/representative?title=road
 *           
 *           # Filter by category and status
 *           /api/v1/complaint/representative?category=infrastructure&status=pending
 *           
 *           # Filter by predefined date range
 *           /api/v1/complaint/representative?dateFilter=this-month
 *           
 *           # Pagination
 *           /api/v1/complaint/representative?page=2&limit=10
 *           
 *           # All filters applied with pagination
 *           /api/v1/complaint/representative?title=road&category=infrastructure&status=pending&dateFilter=this-month&page=1&limit=20
 */
router.get('/representative', verifyAccessToken, complaintController.getRepresentativeComplaints);

/**
 * @swagger
 * /api/v1/complaint/constituent:
 *   get:
 *     summary: Get complaints submitted by a constituent
 *     tags: [Complaints]
 *     description: Retrieve all complaints submitted by the authenticated constituent. Only accessible by constituents.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of complaints submitted by the constituent
 *       403:
 *         description: Forbidden - Only constituents can access this endpoint
 *       500:
 *         description: Server error
 */
router.get('/constituent', verifyAccessToken, complaintController.getConstituentComplaints);

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaints]
 *     description: Retrieve a single complaint by its ID. Constituents can only view their own complaints. Representatives can only view complaints assigned to them.
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
 *         description: A complaint object
 *       403:
 *         description: Forbidden - Not authorized to view this complaint
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyAccessToken, complaintController.getComplaintById);

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaints]
 *     description: Update a complaint status and response. Only accessible by representatives for complaints assigned to them. Cannot update resolved/rejected complaints.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved, rejected]
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       400:
 *         description: Cannot update resolved/rejected complaints
 *       403:
 *         description: Forbidden - Only representatives can update complaints assigned to them
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyAccessToken, complaintController.updateComplaint);

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - constituent
 *         - representative
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the complaint
 *         title:
 *           type: string
 *           description: The title of the complaint
 *         description:
 *           type: string
 *           description: Detailed description of the complaint
 *         category:
 *           type: string
 *           enum: [infrastructure, education, healthcare, security, other]
 *           description: The category of the complaint
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 description: Path to the uploaded file
 *               filename:
 *                 type: string
 *                 description: Generated filename on the server
 *               originalname:
 *                 type: string
 *                 description: Original filename from the user
 *               mimetype:
 *                 type: string
 *                 description: MIME type of the file
 *           description: Array of uploaded attachments (up to 3 images)
 *         constituent:
 *           type: string
 *           description: ID of the constituent who submitted the complaint
 *         representative:
 *           type: string
 *           description: ID of the representative assigned to the complaint
 *         status:
 *           type: string
 *           enum: [pending, in-progress, resolved, rejected]
 *           description: Current status of the complaint
 *         response:
 *           type: string
 *           description: Representative's response to the complaint
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the complaint was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the complaint was last updated
 */
router.get('/constituent', verifyAccessToken, complaintController.getConstituentComplaints);

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaints]
 *     description: Retrieve a single complaint by its ID. Constituents can only view their own complaints. Representatives can only view complaints assigned to them.
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
 *         description: A complaint object
 *       403:
 *         description: Forbidden - Not authorized to view this complaint
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyAccessToken, complaintController.getComplaintById);

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaints]
 *     description: Update a complaint status and response. Only accessible by representatives for complaints assigned to them. Cannot update resolved/rejected complaints.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved, rejected]
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       400:
 *         description: Cannot update resolved/rejected complaints
 *       403:
 *         description: Forbidden - Only representatives can update complaints assigned to them
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyAccessToken, complaintController.updateComplaint);

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaints]
 *     description: Delete a complaint. Only accessible by the constituent who created it.
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
 *         description: Complaint deleted successfully
 *       403:
 *         description: Forbidden - Only the constituent who created the complaint can delete it
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyAccessToken, complaintController.deleteComplaint);

/**
 * @swagger
 * /api/v1/complaint/{id}/pdf:
 *   get:
 *     summary: Download complaint as PDF
 *     tags: [Complaints]
 *     description: Download a complaint in PDF format. Constituents can only download their own complaints. Representatives can only download complaints assigned to them.
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
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Forbidden - Not authorized to download this complaint
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/v1/complaint/{complaintId}/feedback:
 *   post:
 *     summary: Submit feedback for a resolved complaint
 *     tags: [Complaints]
 *     description: Submit feedback for a resolved complaint. Only accessible by constituents for their own complaints.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: The complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *               - rating
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: Feedback text from the constituent
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
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
 *                   example: Feedback submitted successfully
 *       400:
 *         description: Bad request - Invalid input or feedback already submitted
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only constituents can submit feedback for their own complaints
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
// Submit feedback for a complaint
router.post('/:complaintId/feedback', verifyAccessToken, complaintController.submitFeedback);

module.exports = router;
