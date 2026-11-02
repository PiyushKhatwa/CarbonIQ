const { z } = require('zod');

const registerSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters long').max(100),
    fullName: z.string().min(2, 'Full name is required').max(150),
    defaultWorkspaceType: z.enum(['personal', 'organization']).optional().default('personal'),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

const updateProfileSchema = {
  body: z.object({
    fullName: z.string().min(2).max(150).optional(),
    defaultWorkspaceType: z.enum(['personal', 'organization']).optional(),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
