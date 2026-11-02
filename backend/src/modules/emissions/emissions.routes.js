const { Router } = require('express');
const emissionsController = require('./emissions.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { resolveWorkspaceScope } = require('../../middleware/workspace.middleware');

const router = Router();

// Calculation preview can be called without workspace lock
router.post('/preview', requireAuth, emissionsController.previewCalculation);

// Analytics endpoints require active workspace resolution
router.get('/summary', requireAuth, resolveWorkspaceScope, emissionsController.getSummary);
router.get('/trends', requireAuth, resolveWorkspaceScope, emissionsController.getTrends);
router.get('/breakdown', requireAuth, resolveWorkspaceScope, emissionsController.getBreakdown);
router.get('/departments', requireAuth, resolveWorkspaceScope, emissionsController.getDepartments);

module.exports = router;

