const db = require('../../config/db');
const emissionsRepo = require('./emissions.repository');
const actRepo = require('../activities/activities.repository');
const { calculateEmissions } = require('../../utils/calculation.util');

async function getSummary(workspace, { startDate, endDate }) {
  // Default to current 30-day window if not provided
  const end = endDate || new Date().toISOString().split('T')[0];
  const start =
    startDate ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const summary = await emissionsRepo.getWorkspaceSummary(workspace, start, end);

  return {
    period: {
      startDate: start,
      endDate: end,
    },
    currentPeriod: {
      totalCo2eKg: parseFloat(summary.current_total_co2e || 0),
      activityCount: parseInt(summary.current_activity_count || 0, 10),
    },
    previousPeriod: {
      totalCo2eKg: parseFloat(summary.previous_total_co2e || 0),
      activityCount: parseInt(summary.previous_activity_count || 0, 10),
    },
    percentageChange: parseFloat(summary.percentage_change || 0),
  };
}

async function getTrends(workspace, limit) {
  return emissionsRepo.getMonthlyTrends(workspace, limit);
}

async function getBreakdown(workspace) {
  const categories = await emissionsRepo.getCategoryBreakdown(workspace);

  // Compute total to derive percentages
  const grandTotal = categories.reduce((sum, c) => sum + parseFloat(c.total_co2e_kg), 0);

  return categories.map((c) => ({
    ...c,
    totalQuantity: parseFloat(c.total_quantity),
    totalCo2eKg: parseFloat(c.total_co2e_kg),
    percentageOfTotal:
      grandTotal > 0 ? Number(((parseFloat(c.total_co2e_kg) / grandTotal) * 100).toFixed(2)) : 0,
  }));
}

async function getDepartments(workspace) {
  if (workspace.type !== 'organization') {
    const error = new Error('Department breakdown is only available for organization workspaces');
    error.statusCode = 400;
    error.code = 'ORG_WORKSPACE_REQUIRED';
    throw error;
  }
  return emissionsRepo.getDepartmentBreakdown(workspace.organizationId);
}

async function calculatePreview({ activityTypeId, quantity, unit, activityDate, geography = 'India' }) {
  const date = activityDate || new Date().toISOString().split('T')[0];
  const factor = await actRepo.findMatchingFactor(db, activityTypeId, geography, date);

  if (!factor) {
    const error = new Error('No applicable emission factor found for activity type');
    error.statusCode = 404;
    error.code = 'NO_FACTOR_FOUND';
    throw error;
  }

  const estimatedCo2eKg = calculateEmissions(quantity, factor.factor_value);

  return {
    activityTypeId,
    quantity: parseFloat(quantity),
    unit,
    factorValue: parseFloat(factor.factor_value),
    factorUnit: factor.unit,
    sourceName: factor.source_name,
    estimatedCo2eKg,
  };
}

module.exports = {
  getSummary,
  getTrends,
  getBreakdown,
  getDepartments,
  calculatePreview,
};
