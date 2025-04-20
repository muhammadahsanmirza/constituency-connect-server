const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const responseHandler = require('../utils/responseHandler');
const { verifyRefreshToken, verifyAccessToken } = require('../middlewares/auth.middleware');

// Register a new user
router.post('/register', userController.register);

// Login a user
router.post('/login', userController.login);

// Refresh token
router.post('/refresh-token', verifyRefreshToken, userController.refreshToken);

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Users]
 *     description: Retrieve the profile information of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     cnic:
 *                       type: string
 *                     mobile:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [constituent, representative]
 *                     gender:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     province:
 *                       type: object
 *                     district:
 *                       type: object
 *                     tehsil:
 *                       type: object
 *                     city:
 *                       type: object
 *                     constituency:
 *                       type: object
 *                     address:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', verifyAccessToken, userController.getUserProfile);

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
