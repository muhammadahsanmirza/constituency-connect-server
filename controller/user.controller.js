const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const responseHandler = require('../utils/responseHandler');

// Register a new user
// Add these JSDoc comments above your register function
/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cnic
 *               - mobile
 *               - email
 *               - password
 *               - role
 *               - gender
 *               - dateOfBirth
 *               - province
 *               - district
 *               - tehsil
 *               - city
 *               - constituency
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               cnic:
 *                 type: string
 *                 description: Format xxxxx-xxxxxxx-x
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: For representatives, must end with @na.gov.pk
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [constituent, representative]
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *               tehsil:
 *                 type: string
 *               city:
 *                 type: string
 *               constituency:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
exports.register = async (req, res) => {
  try {
    const { name, cnic, mobile, email, password, role, gender, dateOfBirth, province, district, tehsil, city, constituency, address } = req.body;

    // Check if the email is from the required domain for representatives
    if (role === 'representative' && !email.endsWith('@na.gov.pk')) {
      return responseHandler.error(res, 'Invalid email domain for representative');
    }

    // Check if a representative exists for the constituency
    if (role === 'constituent') {
      const representative = await User.findOne({ role: 'representative', constituency });
      if (!representative) {
        return responseHandler.error(res, 'No representative found for the constituency');
      }
      req.body.representative = representative._id;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();

    // Generate JWT tokens with additional fields
    // Using JWT_SECRET instead of JWT_ACCESS_SECRET
    const accessToken = jwt.sign(
      { 
        userId: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role,
        constituency: newUser.constituency 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Using JWT_REFRESH_SECRET directly
    const refreshToken = jwt.sign(
      { 
        userId: newUser._id, 
        role: newUser.role,
        constituency: newUser.constituency 
      }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: '30d' }
    );

    responseHandler.success(res, 'User registered successfully', { accessToken, refreshToken });
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Login a user
/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     description: Login with email and password. Accessible by both constituents and representatives.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT token valid for 1 day
 *                     refreshToken:
 *                       type: string
 *                       description: JWT token valid for 30 days
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return responseHandler.error(res, 'Invalid email or password');
    }

    // Using JWT_SECRET instead of JWT_ACCESS_SECRET
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        constituency: user.constituency 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    const refreshToken = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        constituency: user.constituency 
      }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: '30d' }
    );

    responseHandler.success(res, 'Login successful', { accessToken, refreshToken });
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

/**
 * @swagger
 * /api/v1/user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     description: Get a new access token using a valid refresh token. Accessible by both constituents and representatives.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT token valid for 1 day
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user from database to ensure they still exist and get updated info
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.unauthorized(res, 'User not found');
    }
    
    // Generate new access token
    // Using JWT_SECRET instead of JWT_ACCESS_SECRET
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        constituency: user.constituency 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    responseHandler.success(res, 'Access token refreshed successfully', { accessToken });
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};
