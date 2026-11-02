const workspacesService = require('./workspaces.service');
const { sendSuccess } = require('../../utils/response.util');

async function getWorkspaces(req, res, next) {
  try {
    const data = await workspacesService.getAvailableWorkspaces(req.user);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWorkspaces,
};

