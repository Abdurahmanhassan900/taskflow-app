const { ApiError } = require('../utils/ApiError');
const { logger } = require('../utils/logger');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    logger.error(err.message, {
      requestId: req.requestId,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(err.message, {
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
      statusCode,
    });
  }

  res.status(statusCode).json({
    error: {
      message: isServerError ? 'Internal server error' : err.message,
    },
  });
};

module.exports = { notFound, errorHandler };
