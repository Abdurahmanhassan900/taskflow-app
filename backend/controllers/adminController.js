const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

const BCRYPT_ROUNDS = 12;

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user.id) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
  });

  res.json({
    message: 'User role updated successfully',
    user: publicUser(updated),
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: 'User deleted successfully' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: { id: req.user.id, deletedAt: null },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  res.json({ message: 'Password updated successfully' });
});

module.exports = { listUsers, updateUserRole, deleteUser, changePassword };
