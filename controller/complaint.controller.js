const Complaint = require('../model/complaint.model');
const responseHandler = require('../utils/responseHandler');
const notificationService = require('../utils/notification.service');
const pdfGenerator = require('../utils/pdfGenerator');

exports.submitComplaint = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can submit complaints');
    }

    const { title, description, category } = req.body;
    
    // Create a new complaint with constituent and representative info from JWT
    const newComplaint = new Complaint({
      title,
      description,
      category,
      constituent: req.user.userId,
      representative: req.user.representative, // Get representative ID from JWT
      status: 'pending',
      attachments: [] // Initialize empty attachments array
    });

    // Handle attachments if provided
    if (req.files) {
      // Process each file field (attachment1, attachment2, attachment3)
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0]; // Get the file from the field
        newComplaint.attachments.push({
          path: file.path,
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype
        });
      });
    }

    await newComplaint.save();
    responseHandler.success(res, 'Complaint submitted successfully', newComplaint);
  } catch (error) {
    console.error('Error submitting complaint:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get complaints for a representative - only their constituents' complaints
exports.getRepresentativeComplaints = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can access this endpoint');
    }

    const { page = 1, limit = 20, title, category, status, dateFilter } = req.query;
    
    // Build query object
    const query = { representative: req.user.userId };
    
    // Add filters if provided
    if (title) query.title = { $regex: title, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;
    
    // Date filtering
    if (dateFilter) {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this-week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this-month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this-year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Execute query with pagination and deep population
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: {
        path: 'constituent',
        select: 'name email province district tehsil city address',
        populate: [
          { path: 'province', select: 'name' },
          { path: 'district', select: 'name' },
          { path: 'tehsil', select: 'name' }
        ]
      }
    };

    const result = await Complaint.paginate(query, options);
    
    responseHandler.success(res, 'Complaints retrieved successfully', {
      complaints: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error getting representative complaints:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get complaints submitted by a constituent
exports.getConstituentComplaints = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can access this endpoint');
    }

    const { page = 1, limit = 20, title, category, status, dateFilter } = req.query;
    
    // Build query object
    const query = { constituent: req.user.userId };
    // Add filters if provided
    if (title) query.title = { $regex: title, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;
    
    // Date filtering
    if (dateFilter) {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this-week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this-month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this-year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'representative', select: 'name email' }
      ]
    };

    const result = await Complaint.paginate(query, options);
    
    responseHandler.success(res, 'Complaints retrieved successfully', {
      complaints: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching constituent complaints:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get a single complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('constituent', 'name email')
      .populate('representative', 'name email');
    
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }

    // Check if user has permission to view this complaint
    console.log("Get Complaint by user ID->",req.user);
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'You do not have permission to view this complaint');
    } else if (req.user.role === 'representative' && complaint.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'This complaint is not assigned to you');
    }
    
    // For file previews, the frontend will use the attachment paths returned here
    responseHandler.success(res, 'Complaint retrieved successfully', complaint);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Update a complaint - only representatives can update status
exports.updateComplaint = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can update complaints');
    }

    const { id } = req.params;
    const { status, response } = req.body;

    // Find the complaint
    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }

    // Check if the complaint is assigned to this representative
    if (complaint.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only update complaints assigned to you');
    }

    // Check if status is valid
    if (status && !['pending', 'resolved', 'rejected'].includes(status)) {
      return responseHandler.error(res, 'Invalid status value');
    }

    // Set isComplaintUpdated to true if status is changing from pending to resolved/rejected
    if (complaint.status === 'pending' && (status === 'resolved' || status === 'rejected')) {
      complaint.isComplaintUpdated = true;
    }

    // Update the complaint
    if (status) complaint.status = status;
    if (response) complaint.response = response;

    await complaint.save();
    
    responseHandler.success(res, 'Complaint updated successfully', complaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Delete a complaint - only the constituent who created it can delete
exports.deleteComplaint = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can delete complaints');
    }

    const complaintId = req.params.id;
    
    // Find the complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }
    
    // Check if the complaint belongs to this constituent
    if (complaint.constituent.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only delete your own complaints');
    }
    
    // Delete the complaint
    await Complaint.findByIdAndDelete(complaintId);
    
    responseHandler.success(res, 'Complaint deleted successfully');
  } catch (error) {
    console.error('Error deleting complaint:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Download complaint as PDF
exports.downloadComplaintPDF = async (req, res) => {
  try {
    console.log('PDF Download: Starting process');
    const complaintId = req.params.id;
    console.log(`PDF Download: Complaint ID - ${complaintId}`);
    
    // Find the complaint with populated constituent and representative
    console.log('PDF Download: Fetching complaint data');
    const complaint = await Complaint.findById(complaintId)
      .populate('constituent', 'name email')
      .populate('representative', 'name email');
    
    if (!complaint) {
      console.log('PDF Download: Complaint not found');
      return responseHandler.notFound(res, 'Complaint not found');
    }
    console.log(`PDF Download: Complaint found - ${complaint.title}`);

    // Check if user has permission to view this complaint
    console.log(`PDF Download: Checking permissions for user role ${req.user.role}`);
    if (req.user.role === 'constituent' && complaint.constituent._id.toString() !== req.user.userId) {
      console.log('PDF Download: Permission denied - constituent mismatch');
      return responseHandler.forbidden(res, 'You do not have permission to download this complaint');
    } else if (req.user.role === 'representative' && complaint.representative._id.toString() !== req.user.userId) {
      console.log('PDF Download: Permission denied - representative mismatch');
      return responseHandler.forbidden(res, 'This complaint is not assigned to you');
    }
    console.log('PDF Download: Permission check passed');
    
    // Try to generate and send the PDF
    console.log('PDF Download: Starting PDF generation');
    const result = await pdfGenerator.generateComplaintPDF(complaint, res);
    console.log(`PDF Download: PDF generation result - ${result}`);
    
    // If PDF generation failed and no response has been sent yet
    if (!result && !res.headersSent) {
      console.log('PDF Download: PDF generation failed but no response sent yet');
      responseHandler.serverError(res, 'Failed to generate PDF. Please try again later.');
    }
    
  } catch (error) {
    console.error('Error downloading complaint PDF:', error);
    console.log(`PDF Download: Error caught - ${error.message}`);
    if (!res.headersSent) {
      console.log('PDF Download: Sending error response');
      responseHandler.serverError(res, 'Error downloading PDF: ' + error.message);
    } else {
      console.log('PDF Download: Headers already sent, cannot send error response');
    }
  }
};

// Submit feedback for a complaint
exports.submitFeedback = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { feedback, rating } = req.body;
    
    // Validate input
    if (!feedback || !rating) {
      return responseHandler.badRequest(res, 'Feedback and rating are required');
    }
    
    // Find the complaint
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }
    
    // Check if the user is the constituent who created the complaint
    if (complaint.constituent.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only submit feedback for your own complaints');
    }
    
    // Check if the complaint status is resolved
    if (complaint.status !== 'resolved') {
      return responseHandler.badRequest(res, 'Feedback can only be submitted for resolved complaints');
    }
    
    // Check if feedback has already been submitted
    if (complaint.isFeedbackSubmitted) {
      return responseHandler.badRequest(res, 'Feedback has already been submitted for this complaint');
    }
    
    // Create a new feedback document
    const newFeedback = new Feedback({
      complaint: complaintId,
      constituent: req.user.userId,
      representative: complaint.representative,
      feedback,
      rating
    });
    
    await newFeedback.save();
    
    // Update the complaint to mark feedback as submitted
    complaint.isFeedbackSubmitted = true;
    await complaint.save();
    
    // Send notification to representative
    await notificationService.sendNotification({
      recipient: complaint.representative,
      title: 'New Feedback Received',
      message: `Constituent has submitted feedback for complaint: ${complaint.title}`,
      type: 'feedback',
      relatedId: complaintId
    });
    
    responseHandler.success(res, 'Feedback submitted successfully');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    responseHandler.serverError(res, error.message);
  }
};
