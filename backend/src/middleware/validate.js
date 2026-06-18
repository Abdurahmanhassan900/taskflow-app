const { ZodError } = require('zod');

// Runs a Zod schema against req.body. On success it replaces req.body with the
// parsed (and type-coerced) data; on failure it returns a 400 with the first
// validation message. This keeps controllers free of manual input checks.
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.issues[0];
      const field = first.path.join('.');
      return res.status(400).json({
        error: { message: field ? `${field}: ${first.message}` : first.message },
      });
    }
    next(err);
  }
};

module.exports = { validate };
