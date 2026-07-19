const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');

const REFRESH_COOKIE = 'refreshToken';
const BCRYPT_ROUNDS = 12;

const refreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, 'Full name, email, and password are required');
  }

  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (existing) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
    },
  });

  res.cookie(REFRESH_COOKIE, signRefreshToken(user), refreshCookieOptions());
  res.status(201).json({
    accessToken: signAccessToken(user),
    user: publicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.cookie(REFRESH_COOKIE, signRefreshToken(user), refreshCookieOptions());
  res.status(200).json({
    accessToken: signAccessToken(user),
    user: publicUser(user),
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (!token) {
    throw new ApiError(401, 'No refresh token');
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null },
  });

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  res.status(200).json({ accessToken: signAccessToken(user) });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = { register, login, refresh, logout };
