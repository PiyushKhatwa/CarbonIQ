const { z } = require('zod');

const createOrgSchema = {
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters').max(200),
    slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with dashes').optional(),
    description: z.string().optional(),
    industry: z.string().max(100).optional(),
    country: z.string().max(100).optional().default('India'),
  }),
};

const updateOrgSchema = {
  params: z.object({
    id: z.string().uuid('Valid organization UUID required'),
  }),
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().optional(),
    industry: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
  }),
};

const addMemberSchema = {
  params: z.object({
    id: z.string().uuid('Valid organization UUID required'),
  }),
  body: z.object({
    email: z.string().email('Valid user email required'),
    role: z.enum(['owner', 'admin', 'member']).optional().default('member'),
  }),
};

const createDepartmentSchema = {
  params: z.object({
    id: z.string().uuid('Valid organization UUID required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Department name required').max(120),
    code: z.string().max(50).optional(),
    description: z.string().optional(),
  }),
};

module.exports = {
  createOrgSchema,
  updateOrgSchema,
  addMemberSchema,
  createDepartmentSchema,
};

