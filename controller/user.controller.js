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
    let representativeId = null;
    if (role === 'constituent') {
      const representative = await User.findOne({ role: 'representative', constituency });
      if (!representative) {
        return responseHandler.error(res, 'No representative found for the constituency');
      }
      representativeId = representative._id;
      req.body.representative = representativeId;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();

    // Create payload with all necessary information
    const payload = { 
      userId: newUser._id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role,
      constituency: newUser.constituency 
    };
    
    // Add representative ID to the payload for constituents
    if (role === 'constituent' && representativeId) {
      payload.representative = representativeId;
      console.log('Adding representative ID to token:', representativeId);
    }

    // Generate JWT tokens with the complete payload
    const accessToken = jwt.sign(
      payload, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Include the same payload in refresh token
    const refreshToken = jwt.sign(
      payload, 
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
    
    // Find the user by CNIC
    console.log("Login Attempt",req.body )
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.unauthorized(res, 'Invalid credentials');
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler.unauthorized(res, 'Invalid credentials');
    }
    
    // Create token payload
    const payload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      constituency: user.constituency
    };
    
    // If user is a constituent, add representative ID to the payload
    if (user.role === 'constituent' && user.representative) {
      payload.representative = user.representative;
    }
    
    // Generate tokens
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    responseHandler.success(res, 'Login successful', { 
      accessToken, 
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    responseHandler.serverError(res, error.message);
  }
};

// Also update the refresh token function to include representative ID
exports.refreshToken = (req, res) => {
  try {
    const payload = {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      constituency: req.user.constituency
    };
    
    // If user is a constituent, add representative ID to the payload
    if (req.user.role === 'constituent' && req.user.representative) {
      payload.representative = req.user.representative;
    }
    
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
    
    responseHandler.success(res, 'Token refreshed successfully', { accessToken });
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Add this new method to your existing user.controller.js file

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Log the entire user object from the request
    console.log('Auth user object from JWT:', req.user);
    
    // The user ID is available from the auth middleware
    const userId = req.user.userId;
    console.log('Extracted userId from JWT:', userId);
    
    if (!userId) {
      console.log('No userId found in the token');
      return responseHandler.unauthorized(res, 'User not authenticated');
    }
    
    console.log('Attempting to find user with ID:', userId);
    
    // First, get the user without population to check what fields exist
    const userDoc = await User.findById(userId).select('-password -__v');
    
    if (!userDoc) {
      console.log('User not found in database for ID:', userId);
      return responseHandler.notFound(res, 'User not found');
    }
    
    // Create a query to populate only the fields that exist in the user document
    let query = User.findById(userId).select('-password -__v');
    
    // Check each field and only populate if it exists and has a value
    if (userDoc.province) {
      query = query.populate('province', 'name code');
    }
    
    if (userDoc.district) {
      query = query.populate('district', 'name code province');
    }
    
    if (userDoc.tehsil) {
      query = query.populate('tehsil', 'name code district');
    }
    
    if (userDoc.constituency) {
      query = query.populate('constituency', 'name code district');
    }
    
    if (userDoc.representative) {
      query = query.populate('representative', 'name email mobile');
    }
    
    // Execute the query with the appropriate populate calls
    const user = await query.exec();
    
    console.log('User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Return the user profile
    responseHandler.success(res, 'User profile retrieved successfully', user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    responseHandler.serverError(res, error.message);
  }
};
