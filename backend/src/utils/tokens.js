const jwt = require('jsonwebtoken');

// Secrets come from the environment. We fall back to obvious dev-only values so
// the app still boots locally, but production MUST set real secrets.
const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

const ACCESS_TTL = '1d'; // short-lived token sent on every request
const REFRESH_TTL = '7d'; // long-lived token kept in an httpOnly cookie

const signAccessToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });

const signRefreshToken = (user) =>
  jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
