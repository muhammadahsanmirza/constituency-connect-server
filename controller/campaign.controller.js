const Campaign = require('../model/campaign.model');
const User = require('../model/user.model');
const responseHandler = require('../utils/responseHandler');
const fs = require('fs');
const path = require('path');

// Create a new campaign
exports.createCampaign = async (req, res) => {
  try {
    console.log('Full request headers:', req.headers);
    console.log('Authorization header:', req.headers.authorization);
    console.log('User from token:', req.user);
    
    const { title, description } = req.body;
    
    // Check if we have a representative role
    if (req.user && req.user.role === 'representative') {
      console.log('Representative confirmed, creating campaign with ID:', req.user.userId);
      
      // Create a new campaign object
      const newCampaign = new Campaign({
        title,
        description,
        representative: req.user.userId
      });

      // Handle image upload if provided
      if (req.file) {
        newCampaign.imagePath = req.file.path;
      }

      // Save the campaign to the database
      await newCampaign.save();

      return responseHandler.success(res, 'Campaign created successfully', newCampaign);
    } else {
      console.log('User role is not representative:', req.user ? req.user.role : 'undefined');
      return responseHandler.forbidden(res, 'Only representatives can create campaigns');
    }
  } catch (error) {
    console.error('Campaign creation error:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get all campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('representative', 'name email');
    responseHandler.success(res, 'Campaigns retrieved successfully', campaigns);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Get campaigns by representative ID
exports.getCampaignsByRepresentative = async (req, res) => {
  try {
    const representativeId = req.params.representativeId;
    
    console.log('Fetching campaigns for representative ID:', representativeId);
    
    // Find all campaigns by this representative
    const campaigns = await Campaign.find({ representative: representativeId })
      .sort({ createdAt: -1 });
    
    if (campaigns.length === 0) {
      return responseHandler.notFound(res, 'No campaigns found for this representative');
    }
    
    responseHandler.success(res, 'Campaigns retrieved successfully', campaigns);
  } catch (error) {
    console.error('Error fetching representative campaigns:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Get campaigns by constituent's representative
exports.getCampaignsByMyRepresentative = async (req, res) => {
  try {
    // Check if user is a constituent
    if (req.user.role !== 'constituent') {
      return responseHandler.forbidden(res, 'Only constituents can access this endpoint');
    }
    
    // Get the constituent's representative ID from user object
    const user = await User.findById(req.user.userId);
    if (!user || !user.representative) {
      return responseHandler.notFound(res, 'No representative found for this constituent');
    }
    
    // Get campaigns by the representative
    const campaigns = await Campaign.find({ representative: user.representative }).populate('representative', 'name email');
    
    responseHandler.success(res, 'Representative campaigns retrieved successfully', campaigns);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Get a single campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('representative', 'name email');
    if (!campaign) {
      return responseHandler.notFound(res, 'Campaign not found');
    }
    responseHandler.success(res, 'Campaign retrieved successfully', campaign);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Update a campaign by ID
exports.updateCampaign = async (req, res) => {
  try {
    const { title, description } = req.body;
    const campaignId = req.params.id;
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return responseHandler.notFound(res, 'Campaign not found');
    }
    
    // Check if the user is the owner of the campaign
    if (campaign.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You are not authorized to update this campaign');
    }
    
    // Update campaign fields
    campaign.title = title || campaign.title;
    campaign.description = description || campaign.description;
    
    // Handle image update if provided
    if (req.file) {
      // Delete old image if exists
      if (campaign.imagePath) {
        try {
          fs.unlinkSync(campaign.imagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      campaign.imagePath = req.file.path;
    }
    
    // Save the updated campaign
    await campaign.save();
    
    responseHandler.success(res, 'Campaign updated successfully', campaign);
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Delete a campaign by ID
exports.deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return responseHandler.notFound(res, 'Campaign not found');
    }
    
    // Check if the user is the owner of the campaign
    if (campaign.representative.toString() !== req.user.userId) {
      return responseHandler.forbidden(res, 'You are not authorized to delete this campaign');
    }
    
    // Delete the image file if exists
    if (campaign.imagePath) {
      try {
        fs.unlinkSync(campaign.imagePath);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    // Delete the campaign from the database
    await Campaign.findByIdAndDelete(campaignId);
    
    responseHandler.success(res, 'Campaign deleted successfully');
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Get campaigns by constituent's representative from JWT
exports.getCampaignsByMyRepresentativeFromJWT = async (req, res) => {
  try {
    // Get representative ID from JWT
    const representativeId = req.user.representative;
    
    if (!representativeId) {
      return responseHandler.error(res, 'Representative information not found in your profile');
    }
    
    console.log('Fetching campaigns for representative ID from JWT:', representativeId);
    
    // Find all campaigns by this representative
    const campaigns = await Campaign.find({ representative: representativeId })
      .sort({ createdAt: -1 });
    
    if (campaigns.length === 0) {
      return responseHandler.notFound(res, 'No campaigns found for your representative');
    }
    
    responseHandler.success(res, 'Campaigns retrieved successfully', campaigns);
  } catch (error) {
    console.error('Error fetching representative campaigns:', error);
    responseHandler.serverError(res, error.message);
  }
};