const { z } = require('zod');

const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']);
const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'is required').max(200),
  description: z.string().max(2000).optional().default(''),
  status: taskStatusSchema.optional().default('TODO'),
  priority: taskPrioritySchema.optional().default('MEDIUM'),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one field is required',
  });

module.exports = { createTaskSchema, updateTaskSchema };
