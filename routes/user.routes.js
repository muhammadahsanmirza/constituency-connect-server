const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const responseHandler = require('../utils/responseHandler');
const { verifyRefreshToken } = require('../middlewares/auth.middleware');

// Register a new user
router.post('/register', userController.register);

// Login a user
router.post('/login', userController.login);

// Refresh token
router.post('/refresh-token', verifyRefreshToken, userController.refreshToken);

// Handle incorrect methods
router.all('/register', (req, res) => {
  responseHandler.methodNotAllowed(res);
});

router.all('/login', (req, res) => {
  responseHandler.methodNotAllowed(res);
});

router.all('/refresh-token', (req, res) => {
  responseHandler.methodNotAllowed(res);
});

module.exports = router;
