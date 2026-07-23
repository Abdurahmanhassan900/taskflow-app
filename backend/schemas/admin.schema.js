const { z } = require('zod');

const uuidParamSchema = z.object({
  id: z.string().uuid('must be a valid UUID'),
});

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

module.exports = { uuidParamSchema, updateRoleSchema };
