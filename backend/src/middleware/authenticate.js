const { verifyAccessToken } = require('../utils/tokens');
const { ApiError } = require('../utils/ApiError');

// Reads the "Authorization: Bearer <token>" header, verifies the JWT, and
// attaches { id, role } to req.user. Any protected route uses this so the
// controller can trust who is making the request.
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

// Optional role gate, e.g. requireRole('ADMIN') for admin-only routes.
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return next(new ApiError(403, 'Forbidden'));
  }
  next();
};

module.exports = { authenticate, requireRole };
