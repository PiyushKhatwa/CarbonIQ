const recService = require('./recommendations.service');
const { sendSuccess } = require('../../utils/response.util');

async function listRecommendations(req, res, next) {
  try {
    const list = await recService.listRecommendations(req.workspace);
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const updated = await recService.updateStatus(req.params.id, req.workspace, req.body.status);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

async function refreshRecommendations(req, res, next) {
  try {
    const result = await recService.refreshRecommendations(req.workspace);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listRecommendations,
  updateStatus,
  refreshRecommendations,
};

