const { z } = require('zod');

const STATUSES = ['To Do', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'is required').max(200),
  description: z.string().max(2000).optional().default(''),
  status: z.enum(STATUSES).optional().default('To Do'),
  priority: z.enum(PRIORITIES).optional().default('Medium'),
});

// All fields optional on update, but at least one must be present.
const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one field is required',
  });

module.exports = { createTaskSchema, updateTaskSchema };
