const Feedback = require('../model/feedback.model');
// This line is incorrect - it's importing campaign model instead of complaint model
const Complaint = require('../model/complaint.model');
const responseHandler = require('../utils/responseHandler');

// Submit feedback for a resolved complaint
exports.submitFeedback = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can submit feedback');
    }

    const { complaintId, rating, comment } = req.body;

    if (!complaintId || !rating) {
      return responseHandler.error(res, 'Complaint ID and rating are required');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return responseHandler.error(res, 'Rating must be between 1 and 5');
    }

    // Find the complaint
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }

    // Check if the complaint belongs to this constituent
    if (complaint.constituent.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only provide feedback for your own complaints');
    }

    // Check if the complaint is resolved
    if (complaint.status !== 'resolved') {
      return responseHandler.error(res, 'Feedback can only be provided for resolved complaints');
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      complaint: complaintId,
      constituent: req.user.userId
    });

    if (existingFeedback) {
      return responseHandler.error(res, 'You have already provided feedback for this complaint');
    }

    // Create new feedback
    const feedback = new Feedback({
      complaint: complaintId,
      constituent: req.user.userId,
      rating,
      comment: comment || ''
    });

    await feedback.save();

    // Update the complaint to mark feedback as submitted
    complaint.isFeedbackSubmitted = true;
    await complaint.save();

    responseHandler.success(res, 'Feedback submitted successfully', feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get feedback for a specific complaint
exports.getFeedbackByComplaintId = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    // Find the complaint
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return responseHandler.notFound(res, 'Complaint not found');
    }

    // Check permissions
    if (req.user.role === 'constituent' && complaint.constituent.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only view feedback for your own complaints');
    } else if (req.user.role === 'representative' && complaint.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only view feedback for complaints assigned to you');
    }

    // Get feedback
    const feedback = await Feedback.findOne({ complaint: complaintId })
      .populate('constituent', 'name email');

    if (!feedback) {
      return responseHandler.notFound(res, 'No feedback found for this complaint');
    }

    responseHandler.success(res, 'Feedback retrieved successfully', feedback);
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get all feedbacks for complaints assigned to a representative
exports.getRepresentativeFeedbacks = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can access this endpoint');
    }

    // Find all complaints assigned to this representative that have feedback
    const feedbacks = await Feedback.find()
      .populate({
        path: 'complaint',
        match: { representative: req.user.userId, status: 'resolved' },
        select: 'title category status createdAt updatedAt'
      })
      .populate('constituent', 'name email')
      .sort({ createdAt: -1 });

    // Filter out feedbacks where complaint is null (not assigned to this representative)
    const validFeedbacks = feedbacks.filter(feedback => feedback.complaint !== null);

    responseHandler.success(res, 'Feedbacks retrieved successfully', validFeedbacks);
  } catch (error) {
    console.error('Error retrieving feedbacks:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get all feedbacks submitted by a constituent
exports.getConstituentFeedbacks = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can access this endpoint');
    }

    // Find all feedbacks submitted by this constituent
    const feedbacks = await Feedback.find({ constituent: req.user.userId })
      .populate('complaint', 'title category status createdAt updatedAt')
      .sort({ createdAt: -1 });

    responseHandler.success(res, 'Feedbacks retrieved successfully', feedbacks);
  } catch (error) {
    console.error('Error retrieving feedbacks:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get feedback statistics for a representative
exports.getFeedbackStatistics = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can access this endpoint');
    }

    // Find all feedbacks for complaints assigned to this representative
    const feedbacks = await Feedback.find()
      .populate({
        path: 'complaint',
        match: { representative: req.user.userId },
        select: 'title'
      });

    // Filter out feedbacks where complaint is null (not assigned to this representative)
    const validFeedbacks = feedbacks.filter(feedback => feedback.complaint !== null);

    // Calculate statistics
    const totalFeedbacks = validFeedbacks.length;
    const totalRating = validFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalFeedbacks > 0 ? (totalRating / totalFeedbacks).toFixed(1) : 0;

    // Count ratings by star
    const ratingCounts = {
      1: validFeedbacks.filter(f => f.rating === 1).length,
      2: validFeedbacks.filter(f => f.rating === 2).length,
      3: validFeedbacks.filter(f => f.rating === 3).length,
      4: validFeedbacks.filter(f => f.rating === 4).length,
      5: validFeedbacks.filter(f => f.rating === 5).length
    };

    const statistics = {
      totalFeedbacks,
      averageRating,
      ratingCounts
    };

    responseHandler.success(res, 'Feedback statistics retrieved successfully', statistics);
  } catch (error) {
    console.error('Error retrieving feedback statistics:', error);
    responseHandler.serverError(res, error.message);
  }
};