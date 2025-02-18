const Complaint = require('../model/complaint.model');
const responseHandler = require('../utils/responseHandler');

// Create a new complaint
exports.createComplaint = async (req, res) => {
    try {
      const { userId, subject, category, description, complaintDate } = req.body;
  
      // Collect individual files
      const attachments = [];
      if (req.files['attachfile1']) {
        attachments.push({
          filePath: req.files['attachfile1'][0].path,
          originalName: req.files['attachfile1'][0].originalname,
        });
      }
      if (req.files['attachfile2']) {
        attachments.push({
          filePath: req.files['attachfile2'][0].path,
          originalName: req.files['attachfile2'][0].originalname,
        });
      }
      if (req.files['attachfile3']) {
        attachments.push({
          filePath: req.files['attachfile3'][0].path,
          originalName: req.files['attachfile3'][0].originalname,
        });
      }
  
      const newComplaint = new Complaint({
        userId,
        subject,
        category,
        description,
        complaintDate,
        attachments,
      });
  
      await newComplaint.save();
      responseHandler.success(res, 'Complaint created successfully', newComplaint);
    } catch (error) {
      responseHandler.serverError(res, error.message);
    }
  };

// Get all complaints
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId');
    responseHandler.success(res, 'Complaints retrieved successfully', complaints);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Get a single complaint by ID
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

// Update a complaint by ID
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

// Delete a complaint by ID
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
