const db = require('../../config/db');
const actRepo = require('./activities.repository');
const { calculateEmissions } = require('../../utils/calculation.util');

async function createActivity(workspace, user, data) {
  // 1. Check department restriction: personal activities cannot specify a department
  if (workspace.type === 'personal' && data.departmentId) {
    const error = new Error('Department cannot be assigned to a personal activity');
    error.statusCode = 400;
    error.code = 'INVALID_DEPARTMENT_ASSIGNMENT';
    throw error;
  }

  // 2. Resolve factor
  const factor = await actRepo.findMatchingFactor(
    db,
    data.activityTypeId,
    data.geography || 'India',
    data.activityDate
  );

  if (!factor) {
    const error = new Error(
      `No verified emission factor found for activity type ${data.activityTypeId} on ${data.activityDate}`
    );
    error.statusCode = 400;
    error.code = 'NO_FACTOR_FOUND';
    throw error;
  }

  // 3. Deterministic calculation
  const calculatedCo2e = calculateEmissions(data.quantity, factor.factor_value);

  // 4. Persistence in ACID transaction
  return actRepo.createActivityWithEmissions({
    userId: workspace.userId,
    organizationId: workspace.organizationId,
    departmentId: data.departmentId || null,
    activityTypeId: data.activityTypeId,
    createdBy: user.id,
    quantity: data.quantity,
    unit: data.unit,
    activityDate: data.activityDate,
    notes: data.notes || null,
    geography: data.geography || 'India',
    calculatedCo2e,
    factorId: factor.id,
    factorSnapshot: factor.factor_value,
    sourceSnapshot: factor.source_name,
  });
}

async function listActivities(workspace, filters) {
  return actRepo.listActivities(workspace, filters);
}

async function getActivity(activityId, workspace) {
  const activity = await actRepo.getActivityDetail(activityId, workspace);
  if (!activity) {
    const error = new Error('Activity not found in this workspace');
    error.statusCode = 404;
    error.code = 'ACTIVITY_NOT_FOUND';
    throw error;
  }
  return activity;
}

async function updateActivity(activityId, workspace, updateData) {
  const updated = await actRepo.updateActivityWithEmissions(activityId, workspace, updateData);
  if (!updated) {
    const error = new Error('Activity not found in this workspace');
    error.statusCode = 404;
    error.code = 'ACTIVITY_NOT_FOUND';
    throw error;
  }
  return updated;
}

async function deleteActivity(activityId, workspace) {
  const success = await actRepo.deleteActivity(activityId, workspace);
  if (!success) {
    const error = new Error('Activity not found in this workspace');
    error.statusCode = 404;
    error.code = 'ACTIVITY_NOT_FOUND';
    throw error;
  }
  return { success: true };
}

module.exports = {
  createActivity,
  listActivities,
  getActivity,
  updateActivity,
  deleteActivity,
};
