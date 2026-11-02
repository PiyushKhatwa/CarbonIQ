const { Router } = require('express');
const activitiesController = require('./activities.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { resolveWorkspaceScope } = require('../../middleware/workspace.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  createActivitySchema,
  updateActivitySchema,
  listActivitiesSchema,
} = require('./activities.validator');

const router = Router();

// All activity routes require authentication and workspace scope resolution
router.use(requireAuth, resolveWorkspaceScope);

router.post('/', validate(createActivitySchema), activitiesController.createActivity);
router.get('/', validate(listActivitiesSchema), activitiesController.listActivities);
router.get('/:id', activitiesController.getActivity);
router.patch('/:id', validate(updateActivitySchema), activitiesController.updateActivity);
router.delete('/:id', activitiesController.deleteActivity);

module.exports = router;

