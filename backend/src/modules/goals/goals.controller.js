const goalsService = require('./goals.service');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

async function listGoals(req, res, next) {
  try {
    const goals = await goalsService.listGoalsWithProgress(req.workspace);
    return sendSuccess(res, goals);
  } catch (err) {
    next(err);
  }
}

async function createGoal(req, res, next) {
  try {
    const goal = await goalsService.createGoal(req.workspace, req.body);
    return sendCreated(res, goal);
  } catch (err) {
    next(err);
  }
}

async function updateGoalStatus(req, res, next) {
  try {
    const updated = await goalsService.updateGoalStatus(req.params.id, req.workspace, req.body);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listGoals,
  createGoal,
  updateGoalStatus,
};
