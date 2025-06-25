const axios = require('axios');
const logger = require('./logger');

// Zoom API base URLs
const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

// In-memory cache for the access token
let cachedToken = null;
let cachedTokenExpiry = null;

/**
 * Get a valid Zoom Server-to-Server OAuth access token
 * Caches token in memory until expiry.
 */
const getAccessToken = async () => {
  const now = Math.floor(Date.now() / 1000);

  // If token is cached and not expired, return it
  if (cachedToken && cachedTokenExpiry && now < cachedTokenExpiry - 60) {
    return cachedToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'account_credentials');
    params.append('account_id', process.env.ZOOM_ACCOUNT_ID);

    const response = await axios.post(
      ZOOM_OAUTH_URL,
      params,
      {
        auth: {
          username: process.env.ZOOM_CLIENT_ID,
          password: process.env.ZOOM_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = response.data.access_token;
    // expires_in is in seconds
    cachedTokenExpiry = now + response.data.expires_in;
    logger.info('Obtained new Zoom access token');
    return cachedToken;
  } catch (error) {
    logger.error('Failed to obtain Zoom access token', {
      error: error.response?.data || error.message,
    });
    throw new Error('Failed to obtain Zoom access token');
  }
};

/**
 * Get an authenticated axios client for Zoom API
 */
const getZoomClient = async () => {
  const accessToken = await getAccessToken();
  return axios.create({
    baseURL: ZOOM_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Create a Zoom meeting
 */
exports.createMeeting = async (meetingDetails) => {
  try {
    logger.info('Creating Zoom meeting', { meetingDetails: { ...meetingDetails, password: '[REDACTED]' } });

    const zoomClient = await getZoomClient();
    const response = await zoomClient.post('/users/me/meetings', {
      topic: meetingDetails.topic,
      type: 2, // Scheduled meeting
      start_time: meetingDetails.startTime,
      duration: meetingDetails.duration,
      timezone: 'Asia/Karachi',
      agenda: meetingDetails.agenda,
      password: meetingDetails.password,
      settings: {
        host_video: false,
        participant_video: false,
        join_before_host: true,
        mute_upon_entry: true,
        waiting_room: false,
        meeting_authentication: false,
      },
    });

    logger.info('Zoom meeting created successfully', { meetingId: response.data.id });
    return response.data;
  } catch (error) {
    logger.error('Error creating Zoom meeting', {
      error: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};

/**
 * Get a Zoom meeting by ID
 */
exports.getMeeting = async (meetingId) => {
  try {
    logger.info('Fetching Zoom meeting', { meetingId });

    const zoomClient = await getZoomClient();
    const response = await zoomClient.get(`/meetings/${meetingId}`);

    logger.info('Zoom meeting fetched successfully', { meetingId });
    return response.data;
  } catch (error) {
    logger.error('Error fetching Zoom meeting', {
      error: error.message,
      meetingId,
      response: error.response?.data,
    });
    throw error;
  }
};

/**
 * Update a Zoom meeting by ID
 */
exports.updateMeeting = async (meetingId, meetingDetails) => {
  try {
    logger.info('Updating Zoom meeting', {
      meetingId,
      meetingDetails: { ...meetingDetails, password: meetingDetails.password ? '[REDACTED]' : undefined },
    });

    const zoomClient = await getZoomClient();
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
        waiting_room: true,
      },
    });

    logger.info('Zoom meeting updated successfully', { meetingId });
    return response.data;
  } catch (error) {
    logger.error('Error updating Zoom meeting', {
      error: error.message,
      meetingId,
      response: error.response?.data,
    });
    throw error;
  }
};

/**
 * Delete a Zoom meeting by ID
 */
exports.deleteMeeting = async (meetingId) => {
  try {
    logger.info('Deleting Zoom meeting', { meetingId });

    const zoomClient = await getZoomClient();
    const response = await zoomClient.delete(`/meetings/${meetingId}`);

    logger.info('Zoom meeting deleted successfully', { meetingId });
    return response.data;
  } catch (error) {
    logger.error('Error deleting Zoom meeting', {
      error: error.message,
      meetingId,
      response: error.response?.data,
    });
    throw error;
  }
};

/**
 * List all meetings for the authenticated user
 */
exports.listMeetings = async () => {
  try {
    logger.info('Listing Zoom meetings');

    const zoomClient = await getZoomClient();
    const response = await zoomClient.get('/users/me/meetings');

    logger.info('Zoom meetings listed successfully', { count: response.data.meetings.length });
    return response.data;
  } catch (error) {
    logger.error('Error listing Zoom meetings', {
      error: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};
