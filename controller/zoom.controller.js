const ZoomMeeting = require("../model/zoom.model");
const zoomService = require("../utils/zoom.service");
const responseHandler = require("../utils/responseHandler");
const logger = require("../utils/logger");

// Create a new Zoom meeting
exports.createZoomMeeting = async (req, res) => {
  try {
    logger.info("Creating new Zoom meeting", {
      userId: req.user.userId,
      body: req.body,
    });

    // Only representatives can create meetings
    if (req.user.role !== "representative") {
      logger.warn("Unauthorized attempt to create Zoom meeting", {
        userId: req.user.userId,
        role: req.user.role,
      });
      return responseHandler.forbidden(
        res,
        "Only representatives can create Zoom meetings"
      );
    }

    const { topic, agenda, startTime, duration } = req.body;

    // Create meeting in Zoom (do NOT include password)
    const zoomMeeting = await zoomService.createMeeting({
      topic,
      agenda,
      startTime,
      duration,
    });

    // Save meeting in database
    const meeting = new ZoomMeeting({
      topic,
      agenda,
      startTime,
      duration,
      zoomMeetingId: zoomMeeting.id,
      joinUrl: zoomMeeting.join_url,
      hostEmail: zoomMeeting.host_email || req.user.email,
      representative: req.user.userId,
      constituency: req.user.constituency, // <-- add this line
    });

    await meeting.save();
    logger.info("Zoom meeting saved to database", {
      meetingId: meeting._id,
      zoomMeetingId: zoomMeeting.id,
    });

    responseHandler.success(res, "Zoom meeting created successfully", meeting);
  } catch (error) {
    logger.error("Error creating Zoom meeting", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};


// Get all Zoom meetings for a representative
exports.getRepresentativeMeetings = async (req, res) => {
  try {
    logger.info("Fetching representative Zoom meetings", {
      userId: req.user.userId,
    });

    // Check if user is a representative
    if (req.user.role !== "representative") {
      logger.warn("Unauthorized attempt to fetch representative meetings", {
        userId: req.user.userId,
        role: req.user.role,
      });
      return responseHandler.forbidden(
        res,
        "Only representatives can access this endpoint"
      );
    }

    // Query parameters for filtering
    const { status, startDate, endDate } = req.query;

    // Build query
    const query = { representative: req.user.userId };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    // Get meetings from database
    const meetings = await ZoomMeeting.find(query)
      .populate("constituents", "name email")
      .sort({ startTime: 1 });

    logger.info("Representative meetings fetched successfully", {
      count: meetings.length,
    });
    responseHandler.success(res, "Meetings retrieved successfully", meetings);
  } catch (error) {
    logger.error("Error fetching representative meetings", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};

// Get meetings for a constituent - simplified to return only essential meeting info
exports.getConstituentMeetings = async (req, res) => {
  try {
    logger.info("Fetching constituent Zoom meetings", {
      userId: req.user.userId,
    });

    // Check if user is a constituent
    if (req.user.role !== "constituent") {
      logger.warn("Unauthorized attempt to fetch constituent meetings", {
        userId: req.user.userId,
        role: req.user.role,
      });
      return responseHandler.forbidden(
        res,
        "Only constituents can access this endpoint"
      );
    }

    // Build query - only get scheduled meetings with status=scheduled
    const query = { 
      status: "scheduled" // Default to scheduled meetings only
    };
    
    // Note: We're not filtering by constituency since we want to show all scheduled meetings

    // Get meetings from database
    const meetings = await ZoomMeeting.find(query)
      .populate("representative", "name email")
      .sort({ startTime: 1 });

    // Transform the data to include only necessary fields
    const simplifiedMeetings = meetings.map(meeting => ({
      topic: meeting.topic,
      joinUrl: meeting.joinUrl,
      startTime: meeting.startTime,
      duration: meeting.duration,
      representative: meeting.representative ? {
        name: meeting.representative.name,
        email: meeting.representative.email
      } : null
    }));

    logger.info("Constituent meetings fetched successfully", {
      count: simplifiedMeetings.length,
    });
    
    responseHandler.success(res, "Meetings retrieved successfully", simplifiedMeetings);
  } catch (error) {
    logger.error("Error fetching constituent meetings", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};

// Get a specific meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const meetingId = req.params.id;
    logger.info("Fetching Zoom meeting by ID", {
      meetingId,
      userId: req.user.userId,
    });
    // Check if constituent belongs to the meeting's constituency
    if (req.user.role === "constituent") {
      // Get the constituent's constituency
      const constituent = await Constituent.findById(req.user.userId);

      // Check if constituent's constituency matches meeting's constituency
      if (
        constituent.constituency.toString() !== meeting.constituency.toString()
      ) {
        return responseHandler.forbidden(
          res,
          "You can only view meetings for your constituency"
        );
      }
    }
    const meeting = await ZoomMeeting.findById(meetingId)
      .populate("representative", "name email")
      .populate("constituents", "name email");

    if (!meeting) {
      logger.warn("Meeting not found", { meetingId });
      return responseHandler.notFound(res, "Meeting not found");
    }

    // Check permissions
    if (
      req.user.role === "representative" &&
      meeting.representative.toString() !== req.user.userId
    ) {
      logger.warn("Unauthorized attempt to access meeting", {
        meetingId,
        userId: req.user.userId,
      });
      return responseHandler.forbidden(
        res,
        "You can only view your own meetings"
      );
    } else if (
      req.user.role === "constituent" &&
      !meeting.constituents.some((c) => c._id.toString() === req.user.userId)
    ) {
      logger.warn("Unauthorized constituent attempt to access meeting", {
        meetingId,
        userId: req.user.userId,
      });
      return responseHandler.forbidden(
        res,
        "You can only view meetings you are invited to"
      );
    }

    logger.info("Meeting fetched successfully", { meetingId });
    responseHandler.success(res, "Meeting retrieved successfully", meeting);
  } catch (error) {
    logger.error("Error fetching meeting by ID", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};

// Update a meeting
exports.updateMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    logger.info("Updating Zoom meeting", {
      meetingId,
      userId: req.user.userId,
      body: req.body,
    });

    // Check if user is a representative
    if (req.user.role !== "representative") {
      logger.warn("Unauthorized attempt to update meeting", {
        meetingId,
        userId: req.user.userId,
        role: req.user.role,
      });
      return responseHandler.forbidden(
        res,
        "Only representatives can update meetings"
      );
    }

    // Find the meeting
    const meeting = await ZoomMeeting.findById(meetingId);

    if (!meeting) {
      logger.warn("Meeting not found for update", { meetingId });
      return responseHandler.notFound(res, "Meeting not found");
    }

    // Check if the meeting belongs to this representative
    if (meeting.representative.toString() !== req.user.userId) {
      logger.warn(
        "Unauthorized attempt to update another representative's meeting",
        { meetingId, userId: req.user.userId }
      );
      return responseHandler.forbidden(
        res,
        "You can only update your own meetings"
      );
    }

    const {
      topic,
      agenda,
      startTime,
      duration,
      password,
      constituents,
      status,
    } = req.body;

    // Update meeting in Zoom
    await zoomService.updateMeeting(meeting.zoomMeetingId, {
      topic: topic || meeting.topic,
      agenda: agenda || meeting.agenda,
      startTime: startTime || meeting.startTime,
      duration: duration || meeting.duration,
      password: password || meeting.password,
    });

    // Update meeting in database
    if (topic) meeting.topic = topic;
    if (agenda) meeting.agenda = agenda;
    if (startTime) meeting.startTime = startTime;
    if (duration) meeting.duration = duration;
    if (password) meeting.password = password;
    if (constituents) meeting.constituents = constituents;
    if (status) meeting.status = status;

    meeting.updatedAt = Date.now();
    await meeting.save();

    logger.info("Meeting updated successfully", { meetingId });
    responseHandler.success(res, "Meeting updated successfully", meeting);
  } catch (error) {
    logger.error("Error updating meeting", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};

// Delete a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    logger.info("Deleting Zoom meeting", {
      meetingId,
      userId: req.user.userId,
    });

    // Check if user is a representative
    if (req.user.role !== "representative") {
      logger.warn("Unauthorized attempt to delete meeting", {
        meetingId,
        userId: req.user.userId,
        role: req.user.role,
      });
      return responseHandler.forbidden(
        res,
        "Only representatives can delete meetings"
      );
    }

    // Find the meeting
    const meeting = await ZoomMeeting.findById(meetingId);

    if (!meeting) {
      logger.warn("Meeting not found for deletion", { meetingId });
      return responseHandler.notFound(res, "Meeting not found");
    }

    // Check if the meeting belongs to this representative
    if (meeting.representative.toString() !== req.user.userId) {
      logger.warn(
        "Unauthorized attempt to delete another representative's meeting",
        { meetingId, userId: req.user.userId }
      );
      return responseHandler.forbidden(
        res,
        "You can only delete your own meetings"
      );
    }

    // Delete meeting from Zoom
    await zoomService.deleteMeeting(meeting.zoomMeetingId);

    // Delete meeting from database
    await ZoomMeeting.findByIdAndDelete(meetingId);

    logger.info("Meeting deleted successfully", { meetingId });
    responseHandler.success(res, "Meeting deleted successfully");
  } catch (error) {
    logger.error("Error deleting meeting", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};

// Add constituents to a meeting
exports.addConstituentsToMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const { constituents } = req.body;

    logger.info("Adding constituents to meeting", {
      meetingId,
      userId: req.user.userId,
      constituents,
    });

    // Check if user is a representative
    if (req.user.role !== "representative") {
      logger.warn("Unauthorized attempt to add constituents", {
        meetingId,
        userId: req.user.userId,
        role: req.user.role,
      });
      return responseHandler.forbidden(
        res,
        "Only representatives can add constituents to meetings"
      );
    }

    if (
      !constituents ||
      !Array.isArray(constituents) ||
      constituents.length === 0
    ) {
      logger.warn("Invalid constituents data", { constituents });
      return responseHandler.error(
        res,
        "Please provide a valid array of constituent IDs"
      );
    }

    // Find the meeting
    const meeting = await ZoomMeeting.findById(meetingId);

    if (!meeting) {
      logger.warn("Meeting not found for adding constituents", { meetingId });
      return responseHandler.notFound(res, "Meeting not found");
    }

    // Check if the meeting belongs to this representative
    if (meeting.representative.toString() !== req.user.userId) {
      logger.warn(
        "Unauthorized attempt to modify another representative's meeting",
        { meetingId, userId: req.user.userId }
      );
      return responseHandler.forbidden(
        res,
        "You can only modify your own meetings"
      );
    }

    // Add constituents to the meeting
    const existingConstituents = meeting.constituents.map((c) => c.toString());
    const newConstituents = constituents.filter(
      (c) => !existingConstituents.includes(c)
    );

    if (newConstituents.length === 0) {
      logger.info("No new constituents to add", { meetingId });
      return responseHandler.success(
        res,
        "No new constituents to add",
        meeting
      );
    }

    meeting.constituents = [...meeting.constituents, ...newConstituents];
    await meeting.save();

    logger.info("Constituents added successfully", {
      meetingId,
      count: newConstituents.length,
    });
    responseHandler.success(
      res,
      "Constituents added to meeting successfully",
      meeting
    );
  } catch (error) {
    logger.error("Error adding constituents to meeting", {
      error: error.message,
      stack: error.stack,
    });
    responseHandler.serverError(res, error.message);
  }
};
