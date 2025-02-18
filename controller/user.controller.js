const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const responseHandler = require('../utils/responseHandler');

// Register a new user
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
    const accessToken = jwt.sign({ userId: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    responseHandler.success(res, 'User registered successfully', { accessToken, refreshToken });
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};

// Login a user
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

    const accessToken = jwt.sign({ userId: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    responseHandler.success(res, 'Login successful', { accessToken, refreshToken });
  } catch (error) {
    responseHandler.serverError(res, error.message);
  }
};
