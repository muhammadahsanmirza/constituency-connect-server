const jwt = require('jsonwebtoken');
const responseHandler = require('../utils/responseHandler');

// Verify access token middleware
exports.verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseHandler.unauthorized(res, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return responseHandler.unauthorized(res, 'Access token has expired');
    }
    return responseHandler.unauthorized(res, 'Invalid access token');
  }
};

// Verify refresh token middleware
exports.verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return responseHandler.unauthorized(res, 'Refresh token is required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return responseHandler.unauthorized(res, 'Refresh token has expired, please login again');
    }
    return responseHandler.unauthorized(res, 'Invalid refresh token');
  }
};

// Check if user is a representative
exports.isRepresentative = (req, res, next) => {
  if (req.user.role !== 'representative') {
    return responseHandler.forbidden(res, 'Access denied. Only representatives can perform this action');
  }
  next();
};

// Check if user is a constituent
exports.isConstituent = (req, res, next) => {
  if (req.user.role !== 'constituent') {
    return responseHandler.forbidden(res, 'Access denied. Only constituents can perform this action');
  }
  next();
};
