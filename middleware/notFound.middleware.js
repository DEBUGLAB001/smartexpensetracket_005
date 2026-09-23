const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  sendError(res, 404, `Not Found - ${req.originalUrl}`);
};

module.exports = notFound;
