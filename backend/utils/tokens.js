const jwt = require('jsonwebtoken');

function requireSecret(name) {
  const value = process.env[name];
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set in production`);
  }

  // Development-only fallbacks so local bootstrapping still works.
  const devDefaults = {
    JWT_SECRET: 'dev_access_secret_change_me_32_chars_min',
    JWT_REFRESH_SECRET: 'dev_refresh_secret_change_me_32_chars',
  };

  return devDefaults[name];
}

const ACCESS_SECRET = requireSecret('JWT_SECRET');
const REFRESH_SECRET = requireSecret('JWT_REFRESH_SECRET');

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

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
