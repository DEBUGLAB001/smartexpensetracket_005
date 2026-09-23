const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const datastore = require('../models/datastore');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../utils/constants');

const registerUser = async (name, email, password) => {
  // INTENTIONAL BUG 5: Email duplicate validation is case-sensitive!
  // It should be comparing with email.toLowerCase()
  const users = await datastore.find('users');
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  const newUser = await datastore.insert('users', {
    name,
    email, // Should probably save as lowercase, but we leave it as is to allow the bug
    passwordHash
  });
  
  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  return {
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token
  };
};

const loginUser = async (email, password) => {
  // During login, we should probably check case insensitively, but since they register with different cases...
  // Actually let's make login case-sensitive too so they can log into the duplicated account.
  // Or we just find the exact match.
  const users = await datastore.find('users');
  const user = users.find(u => u.email === email);
  
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  return {
    user: { id: user.id, name: user.name, email: user.email },
    token
  };
};

module.exports = {
  registerUser,
  loginUser
};
