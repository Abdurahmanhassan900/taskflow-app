const { ApiError } = require('../utils/ApiError');

// Catch-all for unmatched routes -> 404.
const notFound = (req, res) => {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
};

// Central error handler. Every error funnels here so responses share one shape:
// { error: { message } }. Stack traces are logged but never sent to clients.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({ error: { message } });
};

module.exports = { notFound, errorHandler };
