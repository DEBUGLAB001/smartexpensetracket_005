const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const { isValidEmail, isStrongPassword } = require('../utils/validators');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || name.length < 3) return sendError(res, 422, 'Name must be at least 3 characters');
    if (!email || !isValidEmail(email)) return sendError(res, 422, 'Valid email is required');
    if (!password || !isStrongPassword(password)) return sendError(res, 422, 'Password must be at least 8 characters');
    
    const data = await authService.registerUser(name, email, password);
    sendSuccess(res, 201, data, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) return sendError(res, 400, 'Email and password are required');
    
    const data = await authService.loginUser(email, password);
    sendSuccess(res, 200, data, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    sendSuccess(res, 200, { user: req.user }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
