const axios = require('axios');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

// Zoom API base URL
const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

// Generate Zoom JWT token
const generateZoomJWT = () => {
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // Token expires in 1 hour
  };

  return jwt.sign(payload, process.env.ZOOM_API_SECRET);
};

// Create Zoom API client with authentication
const zoomClient = axios.create({
  baseURL: ZOOM_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${generateZoomJWT()}`
  }
});

// Refresh token before each request
zoomClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${generateZoomJWT()}`;
  return config;
});

// Create a Zoom meeting
exports.createMeeting = async (meetingDetails) => {
  try {
    logger.info('Creating Zoom meeting', { meetingDetails: { ...meetingDetails, password: '[REDACTED]' } });
    
    const response = await zoomClient.post(`/users/${process.env.ZOOM_ACCOUNT_ID}/meetings`, {
      topic: meetingDetails.topic,
      type: 2, // Scheduled meeting
      start_time: meetingDetails.startTime,
      duration: 40, // Fixed duration of 40 minutes
      timezone: 'Asia/Karachi',
      agenda: meetingDetails.agenda,
      settings: {
        host_video: false,
        participant_video: false,
        join_before_host: true,
        mute_upon_entry: true,
        waiting_room: false,
        meeting_authentication: false
      }
    });

    logger.info('Zoom meeting created successfully', { meetingId: response.data.id });
    return response.data;
  } catch (error) {
    logger.error('Error creating Zoom meeting', { 
      error: error.message, 
      response: error.response?.data 
    });
    throw error;
  }
};

exports.getMeeting = async (meetingId) => {
  try {
    logger.info('Fetching Zoom meeting', { meetingId });
    
    const response = await zoomClient.get(`/meetings/${meetingId}`);
    
    logger.info('Zoom meeting fetched successfully', { meetingId });
    return response.data;
  } catch (error) {
    logger.error('Error fetching Zoom meeting', { 
      error: error.message, 
      meetingId,
      response: error.response?.data 
    });
    throw error;
  }
};

// Update a Zoom meeting
exports.updateMeeting = async (meetingId, meetingDetails) => {
  try {
    logger.info('Updating Zoom meeting', { 
      meetingId, 
      meetingDetails: { ...meetingDetails, password: meetingDetails.password ? '[REDACTED]' : undefined } 
    });
    
    const response = await zoomClient.patch(`/meetings/${meetingId}`, {
      topic: meetingDetails.topic,
      start_time: meetingDetails.startTime,
      duration: meetingDetails.duration,
      agenda: meetingDetails.agenda,
      password: meetingDetails.password,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true
      }
    });
    
    logger.info('Zoom meeting updated successfully', { meetingId });
    return response.data;
  } catch (error) {
    logger.error('Error updating Zoom meeting', { 
      error: error.message, 
      meetingId,
      response: error.response?.data 
    });
    throw error;
  }
};

// Delete a Zoom meeting
exports.deleteMeeting = async (meetingId) => {
  try {
    logger.info('Deleting Zoom meeting', { meetingId });
    
    const response = await zoomClient.delete(`/meetings/${meetingId}`);
    
    logger.info('Zoom meeting deleted successfully', { meetingId });
    return response.data;
  } catch (error) {
    logger.error('Error deleting Zoom meeting', { 
      error: error.message, 
      meetingId,
      response: error.response?.data 
    });
    throw error;
  }
};

// List all meetings for a user
exports.listMeetings = async () => {
  try {
    logger.info('Listing Zoom meetings');
    
    const response = await zoomClient.get(`/users/${process.env.ZOOM_ACCOUNT_ID}/meetings`);
    
    logger.info('Zoom meetings listed successfully', { count: response.data.meetings.length });
    return response.data;
  } catch (error) {
    logger.error('Error listing Zoom meetings', { 
      error: error.message, 
      response: error.response?.data 
    });
    throw error;
  }
};