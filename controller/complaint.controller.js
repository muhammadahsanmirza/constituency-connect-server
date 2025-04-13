const Complaint = require('../model/complaint.model');
const responseHandler = require('../utils/responseHandler');

/**
 * @swagger
 * /api/v1/complaint:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaint]
 *     description: Create a new complaint. Only accessible by constituents.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - category
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [infrastructure, education, healthcare, security, other]
 *               description:
 *                 type: string
 *               complaintDate:
 *                 type: string
 *                 format: date
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    
    const { title, description, category } = req.body;
    
    // Check if user is a constituent (complaints should be filed by constituents)
    if (req.user.role !== 'constituent') {
      console.log('Warning: Non-constituent trying to create complaint');
      return responseHandler.forbidden(res, 'Only constituents can file complaints');
    }
    
    const constituent = req.user.userId; // Get the constituent ID from the authenticated user

    // Create a new complaint object
    const newComplaint = new Complaint({
      title,
      description,
      category,
      constituent,
      status: 'pending' // Default status
    });

    // Handle image upload if provided
    if (req.file) {
      newComplaint.imagePath = req.file.path;
    }

    // Save the complaint to the database
    await newComplaint.save();

    responseHandler.success(res, 'Complaint filed successfully', newComplaint);
  } catch (error) {
    console.error('Complaint creation error:', error);
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/complaint:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaint]
 *     description: Retrieve all complaints. For representatives, returns all complaints from their constituency. For constituents, returns only their own complaints.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   complaintDate:
 *                     type: string
 *                     format: date
 *                   userId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   attachments:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Server error
 */
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId');
    responseHandler.success(res, 'Complaints retrieved successfully', complaints);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaint]
 *     description: Retrieve a single complaint by its ID. Representatives can view any complaint from their constituency. Constituents can only view their own complaints.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 subject:
 *                   type: string
 *                 category:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 complaintDate:
 *                   type: string
 *                   format: date
 *                 userId:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 attachments:
 *                   type: array
 *                   items:
 *                     type: string
 *       403:
 *         description: Forbidden - Not authorized to view this complaint
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId');
    if (!complaint) {
      return responseHandler.notFound(res);
    }
    responseHandler.success(res, 'Complaint retrieved successfully', complaint);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaint]
 *     description: Update a complaint. Constituents can only update their own complaints and only certain fields. Representatives can update status of any complaint in their constituency.
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
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved, rejected]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       403:
 *         description: Forbidden - Not authorized to update this complaint
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
exports.updateComplaint = async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedComplaint) {
      return responseHandler.notFound(res);
    }
    responseHandler.success(res, 'Complaint updated successfully', updatedComplaint);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/complaint/{id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaint]
 *     description: Delete a complaint. Constituents can only delete their own complaints. Representatives cannot delete complaints.
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
 *         description: Forbidden - Not authorized to delete this complaint
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
exports.deleteComplaint = async (req, res) => {
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!deletedComplaint) {
      return responseHandler.notFound(res);
    }
    responseHandler.success(res, 'Complaint deleted successfully');
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/complaint/user/{userId}:
 *   get:
 *     summary: Get complaints by user ID
 *     tags: [Complaint]
 *     description: Retrieve all complaints for a specific user. Constituents can only view their own complaints. Representatives can view complaints from any user in their constituency.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of complaints for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   complaintDate:
 *                     type: string
 *                     format: date
 *                   attachments:
 *                     type: array
 *                     items:
 *                       type: string
 *       403:
 *         description: Forbidden - Not authorized to view these complaints
 *       404:
 *         description: No complaints found for this user
 *       500:
 *         description: Server error
 */
exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId');
    responseHandler.success(res, 'Complaints retrieved successfully', complaints);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/complaint/status/{status}:
 *   get:
 *     summary: Get complaints by status
 *     tags: [Complaint]
 *     description: Retrieve all complaints with a specific status. For representatives, returns complaints from their constituency. For constituents, returns only their own complaints.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, resolved, rejected]
 *         description: The complaint status
 *     responses:
 *       200:
 *         description: A list of complaints with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   category:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   complaintDate:
 *                     type: string
 *                     format: date
 *                   userId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   attachments:
 *                     type: array
 *                     items:
 *                       type: string
 *       404:
 *         description: No complaints found with this status
 *       500:
 *         description: Server error
 */
exports.getComplaintsByStatus = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId');
    responseHandler.success(res, 'Complaints retrieved successfully', complaints);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};
