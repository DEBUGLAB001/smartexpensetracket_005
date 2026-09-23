const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/constants');
const datastore = require('../models/datastore');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return sendError(res, 401, 'Not authorized to access this route');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await datastore.findById('users', decoded.id);
    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }
    
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized to access this route');
  }
};

module.exports = {
  protect
};
