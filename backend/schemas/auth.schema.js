const { z } = require('zod');

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'is required').max(120),
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(8, 'must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(1, 'is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'is required'),
  newPassword: z.string().min(8, 'must be at least 8 characters').max(128),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
