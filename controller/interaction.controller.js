const Interaction = require('../model/interaction.model');
const responseHandler = require('../utils/responseHandler');

// Create a new interaction (virtual or physical)
exports.createInteraction = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can create interactions');
    }

    const {
      title,
      description,
      type,
      date,
      duration,
      meetingLink,
      platform,
      location,
      address,
      attendees
    } = req.body;

    // Validate required fields
    if (!title || !type || !date || !duration) {
      return responseHandler.error(res, 'Title, type, date, and duration are required');
    }

    // Validate type-specific fields
    if (type === 'virtual' && (!meetingLink || !platform)) {
      return responseHandler.error(res, 'Meeting link and platform are required for virtual interactions');
    }

    if (type === 'physical' && (!location || !address)) {
      return responseHandler.error(res, 'Location and address are required for physical interactions');
    }

    // Create new interaction
    const interaction = new Interaction({
      title,
      description,
      type,
      representative: req.user.userId,
      date: new Date(date),
      duration,
      meetingLink,
      platform,
      location,
      address,
      attendees: attendees || 0,
      status: 'scheduled'
    });

    await interaction.save();

    responseHandler.success(res, 'Interaction created successfully', interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get all interactions for a representative
exports.getRepresentativeInteractions = async (req, res) => {
  try {
    // Parse query parameters
    const { type, status, startDate, endDate } = req.query;
    
    // Build query based on user role
    let representativeId;
    
    if (req.user.role === 'constituent') {
      // If user is a constituent, get their representative's ID from the JWT
      if (!req.user.representative) {
        return responseHandler.error(res, 'Representative information not found in your profile');
      }
      representativeId = req.user.representative;
    } else {
      // If user is a representative, use their own ID
      representativeId = req.user.userId;
    }
    
    // Build the query with the determined representative ID
    const query = { representative: representativeId };
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Get interactions
    const interactions = await Interaction.find(query)
      .sort({ date: -1 });

    responseHandler.success(res, 'Interactions retrieved successfully', interactions);
  } catch (error) {
    console.error('Error retrieving interactions:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get a specific interaction
exports.getInteraction = async (req, res) => {
  try {
    const interactionId = req.params.id;
    
    // Find the interaction
    const interaction = await Interaction.findById(interactionId);
    
    if (!interaction) {
      return responseHandler.notFound(res, 'Interaction not found');
    }

    // Check permissions based on user role
    if (req.user.role === 'representative' && interaction.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only view your own interactions');
    } else if (req.user.role === 'constituent') {
      // If user is a constituent, check if the interaction belongs to their representative
      if (!req.user.representative || interaction.representative.toString() !== req.user.representative) {
        return responseHandler.forbidden(res, 'You can only view interactions from your representative');
      }
    }

    responseHandler.success(res, 'Interaction retrieved successfully', interaction);
  } catch (error) {
    console.error('Error retrieving interaction:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Update an interaction
exports.updateInteraction = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can update interactions');
    }

    const interactionId = req.params.id;
    
    // Find the interaction
    const interaction = await Interaction.findById(interactionId);
    
    if (!interaction) {
      return responseHandler.notFound(res, 'Interaction not found');
    }

    // Check if the interaction belongs to this representative
    if (interaction.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only update your own interactions');
    }

    // Update fields
    const updateFields = req.body;
    
    // Don't allow changing the representative
    delete updateFields.representative;
    
    // Update the interaction
    const updatedInteraction = await Interaction.findByIdAndUpdate(
      interactionId,
      { 
        ...updateFields,
        updatedAt: Date.now()
      },
      { new: true }
    );

    responseHandler.success(res, 'Interaction updated successfully', updatedInteraction);
  } catch (error) {
    console.error('Error updating interaction:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Delete an interaction
exports.deleteInteraction = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can delete interactions');
    }

    const interactionId = req.params.id;
    
    // Find the interaction
    const interaction = await Interaction.findById(interactionId);
    
    if (!interaction) {
      return responseHandler.notFound(res, 'Interaction not found');
    }

    // Check if the interaction belongs to this representative
    if (interaction.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only delete your own interactions');
    }

    // Delete the interaction
    await Interaction.findByIdAndDelete(interactionId);

    responseHandler.success(res, 'Interaction deleted successfully');
  } catch (error) {
    console.error('Error deleting interaction:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Update interaction status
exports.updateInteractionStatus = async (req, res) => {
  try {
    // Check if user is a representative
    if (req.user.role !== 'representative') {
      return responseHandler.forbidden(res, 'Only representatives can update interaction status');
    }

    const interactionId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return responseHandler.error(res, 'Valid status (scheduled, completed, cancelled) is required');
    }
    
    // Find the interaction
    const interaction = await Interaction.findById(interactionId);
    
    if (!interaction) {
      return responseHandler.notFound(res, 'Interaction not found');
    }

    // Check if the interaction belongs to this representative
    if (interaction.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You can only update your own interactions');
    }

    // Update the status
    interaction.status = status;
    interaction.updatedAt = Date.now();
    
    await interaction.save();

    responseHandler.success(res, 'Interaction status updated successfully', interaction);
  } catch (error) {
    console.error('Error updating interaction status:', error);
    responseHandler.serverError(res, error.message);
  }
};