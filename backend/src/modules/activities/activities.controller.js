const activitiesService = require('./activities.service');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');

async function createActivity(req, res, next) {
  try {
    const result = await activitiesService.createActivity(req.workspace, req.user, req.body);
    return sendCreated(res, result);
  } catch (err) {
    next(err);
  }
}

async function listActivities(req, res, next) {
  try {
    const { items, totalCount, page, limit } = await activitiesService.listActivities(req.workspace, req.query);
    return sendPaginated(res, items, page, limit, totalCount);
  } catch (err) {
    next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    const activity = await activitiesService.getActivity(req.params.id, req.workspace);
    return sendSuccess(res, activity);
  } catch (err) {
    next(err);
  }
}

async function updateActivity(req, res, next) {
  try {
    const updated = await activitiesService.updateActivity(req.params.id, req.workspace, req.body);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

async function deleteActivity(req, res, next) {
  try {
    const result = await activitiesService.deleteActivity(req.params.id, req.workspace);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createActivity,
  listActivities,
  getActivity,
  updateActivity,
  deleteActivity,
};
