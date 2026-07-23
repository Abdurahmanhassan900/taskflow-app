const { ZodError } = require('zod');
const { ApiError } = require('../utils/ApiError');

const formatZodError = (err) => {
  const first = err.issues[0];
  const field = first.path.join('.');
  return field ? `${field}: ${first.message}` : first.message;
};

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new ApiError(400, formatZodError(err)));
    }
    next(err);
  }
};

const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new ApiError(400, formatZodError(err)));
    }
    next(err);
  }
};

module.exports = { validate, validateParams };
