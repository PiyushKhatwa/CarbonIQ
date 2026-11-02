const { Router } = require('express');
const goalsController = require('./goals.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { resolveWorkspaceScope } = require('../../middleware/workspace.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createGoalSchema, updateGoalStatusSchema } = require('./goals.validator');

const router = Router();

router.use(requireAuth, resolveWorkspaceScope);

router.get('/', goalsController.listGoals);
router.post('/', validate(createGoalSchema), goalsController.createGoal);
router.patch('/:id/status', validate(updateGoalStatusSchema), goalsController.updateGoalStatus);

module.exports = router;

