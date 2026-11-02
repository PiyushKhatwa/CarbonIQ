const { Router } = require('express');
const workspacesController = require('./workspaces.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = Router();

router.get('/', requireAuth, workspacesController.getWorkspaces);

module.exports = router;

