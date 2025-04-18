const Complaint = require('../model/complaint.model');
const responseHandler = require('../utils/responseHandler');
const notificationService = require('../utils/notification.service');

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

    // Find all complaints assigned to this representative
    const complaints = await Complaint.find({ representative: req.user.userId })
      .populate('constituent', 'name email')
      .sort({ createdAt: -1 });
    
    responseHandler.success(res, 'Complaints retrieved successfully', complaints);
  } catch (error) {
    console.error('Error fetching representative complaints:', error);
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

    // Find all complaints submitted by this constituent
    const complaints = await Complaint.find({ constituent: req.user.userId })
      .sort({ createdAt: -1 });
    
    responseHandler.success(res, 'Complaints retrieved successfully', complaints);
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
    if (req.user.role === 'constituent' && complaint.constituent.toString() !== req.user.userId) {
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

// Update a complaint - only representatives can update their constituents' complaints
exports.updateComplaint = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can update complaints');
    }

    const { status, response } = req.body;
    const complaintId = req.params.id;
    
    // Find the complaint
    const complaint = await Complaint.findById(complaintId)
      .populate('constituent', 'name email');
    
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }
    
    // Check if the complaint is assigned to this representative
    if (complaint.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'This complaint is not assigned to you');
    }
    
    // Check if complaint is already resolved or rejected
    if (complaint.status === 'resolved' || complaint.status === 'rejected') {
      return responseHandler.error(res, `Cannot update complaint that is already ${complaint.status}`);
    }
    
    // Store the previous status for comparison
    const previousStatus = complaint.status;
    
    // Update complaint fields
    complaint.status = status || complaint.status;
    complaint.response = response || complaint.response;
    complaint.updatedAt = Date.now();
    
    // Save the updated complaint
    await complaint.save();
    
    // Create notification if status has changed
    if (previousStatus !== complaint.status) {
      const title = `Complaint Status Updated: ${complaint.title}`;
      const message = `Your complaint "${complaint.title}" has been updated to ${complaint.status}${complaint.response ? '. Response: ' + complaint.response : ''}`;
      
      const notification = await notificationService.createNotification(
        complaint.constituent._id,
        'complaint_status_update',
        title,
        message,
        complaint._id
      );
      
      // Get the io instance
      const io = req.app.get('io');
      
      // Emit to the constituent's room
      if (io) {
        io.to(complaint.constituent._id.toString()).emit('notification', {
          type: 'status_update',
          notification: notification
        });
      }
    }
    
    responseHandler.success(res, 'Complaint updated successfully', complaint);
  } catch (error) {
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
