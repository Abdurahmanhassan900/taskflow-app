const bcrypt = require('bcryptjs');
const { prisma } = require('../prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');

const REFRESH_COOKIE = 'refreshToken';

// Cookie holding the refresh token: httpOnly so JavaScript (and therefore XSS)
// can't read it; secure+SameSite=None in production so it works across the
// Vercel<->Render domains over HTTPS.
const refreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

// Shape returned to the client. Never includes the password hash.
const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email, password: passwordHash },
  });

  res.cookie(REFRESH_COOKIE, signRefreshToken(user), refreshCookieOptions());
  res.status(201).json({ accessToken: signAccessToken(user), user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.cookie(REFRESH_COOKIE, signRefreshToken(user), refreshCookieOptions());
  res.status(200).json({ accessToken: signAccessToken(user), user: publicUser(user) });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw new ApiError(401, 'No refresh token');
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  res.status(200).json({ accessToken: signAccessToken(user) });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
  res.status(200).json({ message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json({ user: publicUser(user) });
});

module.exports = { register, login, refresh, logout, me };
