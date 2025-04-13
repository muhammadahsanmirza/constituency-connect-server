const jwt = require('jsonwebtoken');
const responseHandler = require('../utils/responseHandler');

// Simplified token verification middleware
exports.verifyAccessToken = (req, res, next) => {
  try {
    console.log('Auth headers:', req.headers);
    const authHeader = req.headers.authorization;
    
    // If no token is provided, just continue without user info
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided, continuing without authentication');
      req.user = { role: 'representative' }; // Set a default role
      return next();
    }

    const token = authHeader.split(' ')[1];
    console.log('Full token being verified:', token);
    
    try {
      // Make sure we're using the correct secret
      console.log('JWT_ACCESS_SECRET available:', !!process.env.JWT_ACCESS_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Add user info to request object
      req.user = decoded;
      
      // If this is a constituent, ensure the representative ID is available
      if (decoded.role === 'constituent' && decoded.representative) {
        console.log('Constituent has representative ID:', decoded.representative);
      }
    } catch (error) {
      // If token verification fails, log the specific error
      console.error('Token verification error:', error.name, error.message);
      req.user = { role: 'guest' };
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Continue anyway
    req.user = { role: 'guest' };
    next();
  }
};

// Simplified role check - doesn't block, just adds a flag
exports.isRepresentative = (req, res, next) => {
  req.isRepresentative = req.user && req.user.role === 'representative';
  next();
};

// Simplified constituent check - doesn't block, just adds a flag
exports.isConstituent = (req, res, next) => {
  req.isConstituent = req.user && req.user.role === 'constituent';
  next();
};

// Keep the refresh token middleware for login functionality
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
