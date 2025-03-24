const express = require('express');
const router = express.Router();
const campaignController = require('../controller/campaign.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Create a new campaign (only for representatives)
router.post('/', 
  verifyAccessToken, 
  upload.single('image'), 
  campaignController.createCampaign
);

// Get all campaigns
router.get('/', campaignController.getCampaigns);

// Get campaigns by representative ID
router.get('/representative/:representativeId?', verifyAccessToken, campaignController.getCampaignsByRepresentative);

// Get a single campaign by ID
router.get('/:id', campaignController.getCampaignById);

// Update a campaign by ID (only for the owner)
router.put('/:id', 
  verifyAccessToken, 
  upload.single('image'), 
  campaignController.updateCampaign
);

// Delete a campaign by ID (only for the owner)
router.delete('/:id', verifyAccessToken, campaignController.deleteCampaign);

module.exports = router;