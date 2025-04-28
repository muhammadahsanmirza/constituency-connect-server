const Complaint = require('../model/complaint.model');
const User = require('../model/user.model');
const Interaction = require('../model/interaction.model');
const responseHandler = require('../utils/responseHandler');
const mongoose = require('mongoose');

// Get basic complaint statistics for a constituent's representative
exports.getConstituentComplaintStats = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can access this endpoint');
    }

    // Get the representative ID from the JWT token
    const representativeId = req.user.representative;
    
    if (!representativeId) {
      return responseHandler.success(res, 'No representative assigned yet', {
        totalComplaints: 0,
        newComplaints: 0,
        inProgressComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        rejectedComplaints: 0
      });
    }

    // Calculate 24 hours ago for new complaints
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Get complaint counts by status for this representative
    const totalComplaints = await Complaint.countDocuments({ representative: representativeId });
    const newComplaints = await Complaint.countDocuments({ 
      representative: representativeId,
      createdAt: { $gte: last24Hours }
    });
    const inProgressComplaints = await Complaint.countDocuments({ 
      representative: representativeId,
      status: 'in-progress'
    });
    const resolvedComplaints = await Complaint.countDocuments({ 
      representative: representativeId,
      status: 'resolved'
    });
    const pendingComplaints = await Complaint.countDocuments({ 
      representative: representativeId,
      status: 'pending'
    });
    const rejectedComplaints = await Complaint.countDocuments({ 
      representative: representativeId,
      status: 'rejected'
    });

    const stats = {
      totalComplaints,
      newComplaints,
      inProgressComplaints,
      resolvedComplaints,
      pendingComplaints,
      rejectedComplaints
    };

    responseHandler.success(res, 'Complaint statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error retrieving complaint statistics:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get representative's own complaint statistics
exports.getRepresentativeComplaintStats = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can access this endpoint');
    }

    // Calculate 24 hours ago for new complaints
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Get complaint counts by status for this representative
    const totalComplaints = await Complaint.countDocuments({ representative: req.user.userId });
    const newComplaints = await Complaint.countDocuments({ 
      representative: req.user.userId,
      createdAt: { $gte: last24Hours }
    });
    const inProgressComplaints = await Complaint.countDocuments({ 
      representative: req.user.userId,
      status: 'in-progress'
    });
    const resolvedComplaints = await Complaint.countDocuments({ 
      representative: req.user.userId,
      status: 'resolved'
    });
    const pendingComplaints = await Complaint.countDocuments({ 
      representative: req.user.userId,
      status: 'pending'
    });
    const rejectedComplaints = await Complaint.countDocuments({ 
      representative: req.user.userId,
      status: 'rejected'
    });

    const stats = {
      totalComplaints,
      newComplaints,
      inProgressComplaints,
      resolvedComplaints,
      pendingComplaints,
      rejectedComplaints
    };

    responseHandler.success(res, 'Complaint statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Error retrieving complaint statistics:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get monthly complaint trends
exports.getComplaintTrends = async (req, res) => {
  try {
    // Check user role and get appropriate representative ID
    let representativeId;
    
    if (req.user.role === 'representative') {
      representativeId = req.user.userId;
    } else if (req.user.role === 'constituent') {
      // Find the constituent's complaints to get their representative
      const userComplaints = await Complaint.find({ constituent: req.user.userId });
      
      if (!userComplaints || userComplaints.length === 0) {
        return responseHandler.success(res, 'No complaints found', []);
      }
      
      // Get the representative ID from the first complaint
      representativeId = userComplaints[0].representative;
      
      if (!representativeId) {
        return responseHandler.success(res, 'No representative assigned yet', []);
      }
    } else {
      return responseHandler.forbidden(res, 'Unauthorized access');
    }

    // Parse query parameters for date range
    const { startDate, endDate, period } = req.query;
    
    let matchStage = { representative: mongoose.Types.ObjectId(representativeId) };
    let groupStage = {};
    
    // Set up date range if provided
    if (startDate && endDate) {
      matchStage.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // Set up grouping based on period (month, week, year)
    if (period === 'week') {
      groupStage = {
        $week: '$createdAt'
      };
    } else if (period === 'year') {
      groupStage = {
        $year: '$createdAt'
      };
    } else {
      // Default to month
      groupStage = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    }

    // Aggregate complaints by date and status
    const trends = await Complaint.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: {
            date: groupStage,
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format the results
    const formattedTrends = trends.map(item => {
      let dateLabel;
      
      if (period === 'week') {
        dateLabel = `Week ${item._id}`;
      } else if (period === 'year') {
        dateLabel = `${item._id}`;
      } else {
        // Format as Month Year
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }
      
      // Initialize all statuses with 0
      const result = {
        date: dateLabel,
        total: item.total,
        pending: 0,
        'in-progress': 0,
        resolved: 0,
        rejected: 0
      };
      
      // Fill in actual counts
      item.statuses.forEach(status => {
        result[status.status] = status.count;
      });
      
      return result;
    });

    responseHandler.success(res, 'Complaint trends retrieved successfully', formattedTrends);
  } catch (error) {
    console.error('Error retrieving complaint trends:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get complaint category distribution
exports.getComplaintCategories = async (req, res) => {
  try {
    // Check user role and get appropriate representative ID
    let representativeId;
    
    if (req.user.role === 'representative') {
      representativeId = req.user.userId;
    } else if (req.user.role === 'constituent') {
      // Find the constituent's complaints to get their representative
      const userComplaints = await Complaint.find({ constituent: req.user.userId });
      
      if (!userComplaints || userComplaints.length === 0) {
        return responseHandler.success(res, 'No complaints found', []);
      }
      
      // Get the representative ID from the first complaint
      representativeId = userComplaints[0].representative;
      
      if (!representativeId) {
        return responseHandler.success(res, 'No representative assigned yet', []);
      }
    } else {
      return responseHandler.forbidden(res, 'Unauthorized access');
    }

    // Aggregate complaints by category
    const categories = await Complaint.aggregate([
      { 
        $match: { 
          representative: mongoose.Types.ObjectId(representativeId) 
        } 
      },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Format the results
    const formattedCategories = categories.map(item => ({
      category: item._id,
      count: item.count
    }));

    responseHandler.success(res, 'Complaint categories retrieved successfully', formattedCategories);
  } catch (error) {
    console.error('Error retrieving complaint categories:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get interaction statistics
/**
 * @swagger
 * /api/v1/stats/interaction-stats:
 *   get:
 *     summary: Get interaction statistics for constituent/representative
 *     tags: [Statistics]
 *     description: Retrieve virtual meetup and physical interaction statistics. Accessible by both constituents and representatives.
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
 *         description: Statistics retrieved successfully
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
 *                   example: Statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     virtualMeetups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: number
 *                     physicalInteractions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
exports.getInteractionStats = async (req, res) => {
    try {
        // Verify user role
        if (!['constituent', 'representative'].includes(req.user.role)) {
            return responseHandler.forbidden(res, 'Access denied');
        }

        const { startDate, endDate } = req.query;
        let query = {};

        // Add date filtering if provided
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Add user-specific filtering
        if (req.user.role === 'constituent') {
            query.constituent = req.user.userId;
        } else {
            query.representative = req.user.userId;
        }

        // Get virtual meetup stats
        const virtualMeetups = await VirtualMeetup.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);

        // Get physical interaction stats
        const physicalInteractions = await PhysicalInteraction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);

        responseHandler.success(res, 'Statistics retrieved successfully', {
            virtualMeetups,
            physicalInteractions
        });

    } catch (error) {
        console.error('Error fetching interaction stats:', error);
        responseHandler.serverError(res, error.message);
    }
};

// Get monthly complaint statistics
exports.getMonthlyComplaintStats = async (req, res) => {
  try {
    // Check user role and get appropriate representative ID
    let representativeId;
    
    if (req.user.role === 'representative') {
      representativeId = new mongoose.Types.ObjectId(req.user.userId);
    } else if (req.user.role === 'constituent') {
      representativeId = new mongoose.Types.ObjectId(req.user.representative);
    } else {
      return responseHandler.forbidden(res, 'Unauthorized access');
    }

    // Get current date and calculate start date (6 months ago)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    // Aggregate complaints by month and status
    const stats = await Complaint.aggregate([
      {
        $match: {
          representative: new mongoose.Types.ObjectId(representativeId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month"
          },
          stats: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format the results
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedStats = stats.map(item => {
      const monthLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      const result = {
        month: monthLabel,
        inProgress: 0,
        newComplaints: 0,
        resolved: 0
      };

      item.stats.forEach(stat => {
        if (stat.status === 'in-progress') result.inProgress = stat.count;
        if (stat.status === 'pending') result.newComplaints = stat.count;
        if (stat.status === 'resolved') result.resolved = stat.count;
      });

      return result;
    });

    responseHandler.success(res, 'Monthly complaint statistics retrieved successfully', formattedStats);
  } catch (error) {
    console.error('Error retrieving monthly complaint statistics:', error);
    responseHandler.serverError(res, error.message);
  }
};