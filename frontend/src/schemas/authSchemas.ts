import { z } from 'zod';

// A "schema" is just a description of what valid data looks like. Zod lets us
// declare the rules once, then it can both CHECK data against them and TELL us
// the TypeScript type of that data for free.

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// z.infer reads the schema above and produces the matching TS type, so the form
// values and the validation rules can never drift apart.
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
