const jwt = require('jsonwebtoken');
const responseHandler = require('../utils/responseHandler');

// Middleware to verify access token
exports.verifyAccessToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return responseHandler.unauthorized(res, 'Access token is required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return responseHandler.unauthorized(res, 'Invalid access token');
    }
    req.user = decoded;
    next();
  });
};

// Middleware to verify refresh token
exports.verifyRefreshToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return responseHandler.unauthorized(res, 'Refresh token is required');
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return responseHandler.unauthorized(res, 'Invalid refresh token');
    }
    req.user = decoded;
    next();
  });
};
