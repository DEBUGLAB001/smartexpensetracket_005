const sendSuccess = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    status: 'error',
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
