const emissionsService = require('./emissions.service');
const { sendSuccess } = require('../../utils/response.util');

async function getSummary(req, res, next) {
  try {
    const summary = await emissionsService.getSummary(req.workspace, req.query);
    return sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
}

async function getTrends(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '12', 10);
    const trends = await emissionsService.getTrends(req.workspace, limit);
    return sendSuccess(res, trends);
  } catch (err) {
    next(err);
  }
}

async function getBreakdown(req, res, next) {
  try {
    const breakdown = await emissionsService.getBreakdown(req.workspace);
    return sendSuccess(res, breakdown);
  } catch (err) {
    next(err);
  }
}

async function getDepartments(req, res, next) {
  try {
    const departments = await emissionsService.getDepartments(req.workspace);
    return sendSuccess(res, departments);
  } catch (err) {
    next(err);
  }
}

async function previewCalculation(req, res, next) {
  try {
    const preview = await emissionsService.calculatePreview(req.body);
    return sendSuccess(res, preview);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getTrends,
  getBreakdown,
  getDepartments,
  previewCalculation,
};

