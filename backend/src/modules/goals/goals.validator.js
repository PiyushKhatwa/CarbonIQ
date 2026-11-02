const { z } = require('zod');

const createGoalSchema = {
  body: z.object({
    title: z.string().min(2, 'Title required').max(200),
    description: z.string().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    targetReductionPct: z.number().min(1).max(100).optional().nullable(),
    baselineCo2eKg: z.number().positive('Baseline CO2e must be positive'),
    targetCo2eKg: z.number().nonnegative('Target CO2e cannot be negative'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be YYYY-MM-DD'),
  }),
};

const updateGoalStatusSchema = {
  params: z.object({
    id: z.string().uuid('Valid goal UUID required'),
  }),
  body: z.object({
    status: z.enum(['active', 'achieved', 'missed', 'cancelled']),
    description: z.string().optional(),
  }),
};

module.exports = {
  createGoalSchema,
  updateGoalStatusSchema,
};
