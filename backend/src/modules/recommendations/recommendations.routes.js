const { Router } = require('express');
const recController = require('./recommendations.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { resolveWorkspaceScope } = require('../../middleware/workspace.middleware');
const { z } = require('zod');
const { validate } = require('../../middleware/validate.middleware');

const router = Router();

const statusSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['active', 'completed', 'dismissed']),
  }),
};

router.use(requireAuth, resolveWorkspaceScope);

router.get('/', recController.listRecommendations);
router.post('/refresh', recController.refreshRecommendations);
router.patch('/:id/status', validate(statusSchema), recController.updateStatus);

module.exports = router;
