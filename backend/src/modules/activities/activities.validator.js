const { z } = require('zod');

const createActivitySchema = {
  body: z.object({
    activityTypeId: z.string().uuid('Valid activity type UUID required'),
    quantity: z.number().positive('Quantity must be greater than zero'),
    unit: z.string().min(1, 'Unit is required').max(30),
    activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Activity date must be YYYY-MM-DD'),
    departmentId: z.string().uuid().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    geography: z.string().optional().default('India'),
  }),
};

const updateActivitySchema = {
  params: z.object({
    id: z.string().uuid('Valid activity UUID required'),
  }),
  body: z.object({
    activityTypeId: z.string().uuid().optional(),
    quantity: z.number().positive('Quantity must be greater than zero').optional(),
    unit: z.string().min(1).max(30).optional(),
    activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Activity date must be YYYY-MM-DD').optional(),
    departmentId: z.string().uuid().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    geography: z.string().optional(),
  }),
};

const listActivitiesSchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    categoryId: z.string().uuid().optional(),
    categoryCode: z.string().optional(),
    departmentId: z.string().uuid().optional(),
  }),
};

module.exports = {
  createActivitySchema,
  updateActivitySchema,
  listActivitiesSchema,
};
