// In your login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Add debug logs
    console.log('Login attempt:', email);
    
    // Find the user
    const user = await User.findOne({ email });
    
    // Log if user was found
    console.log('User found:', !!user);
    
    if (!user) {
      return responseHandler.unauthorized(res, 'Invalid credentials');
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Log password match result
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return responseHandler.unauthorized(res, 'Invalid credentials');
    }
    
    // Rest of your login logic...
  } catch (error) {
    console.error('Login error:', error);
    responseHandler.serverError(res, error.message);
  }
};