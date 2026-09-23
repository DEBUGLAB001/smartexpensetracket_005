const datastore = require('../models/datastore');
const { sendSuccess, sendError } = require('../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const users = await datastore.find('users');
    const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email }));
    sendSuccess(res, 200, safeUsers, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await datastore.findById('users', req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    sendSuccess(res, 200, { id: user.id, name: user.name, email: user.email }, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await datastore.update('users', req.params.id, req.body);
    if (!updatedUser) return sendError(res, 404, 'User not found');
    sendSuccess(res, 200, { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email }, 'User updated');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const success = await datastore.remove('users', req.params.id);
    if (!success) return sendError(res, 404, 'User not found');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
