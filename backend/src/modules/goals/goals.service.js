const goalsRepo = require('./goals.repository');

async function listGoalsWithProgress(workspace) {
  const goals = await goalsRepo.listGoals(workspace);

  // Compute live progress for each goal based on recorded activities
  return Promise.all(
    goals.map(async (g) => {
      const currentEmissions = await goalsRepo.calculateGoalCurrentEmissions(
        workspace,
        g.category_id,
        g.start_date,
        g.target_date
      );

      const baseline = parseFloat(g.baseline_co2e_kg);
      const target = parseFloat(g.target_co2e_kg);
      let progressPct = 0;

      if (baseline > target) {
        // Reduction goal: progress is how much reduced towards target
        const requiredReduction = baseline - target;
        const currentReduction = Math.max(0, baseline - currentEmissions);
        progressPct = Math.min(100, Math.round((currentReduction / requiredReduction) * 100));
      }

      return {
        ...g,
        baselineCo2eKg: baseline,
        targetCo2eKg: target,
        currentEmissionsKg: currentEmissions,
        progressPct,
        isOnTrack: currentEmissions <= target,
      };
    })
  );
}

async function createGoal(workspace, data) {
  return goalsRepo.createGoal({
    userId: workspace.userId,
    organizationId: workspace.organizationId,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    targetReductionPct: data.targetReductionPct,
    baselineCo2eKg: data.baselineCo2eKg,
    targetCo2eKg: data.targetCo2eKg,
    startDate: data.startDate,
    targetDate: data.targetDate,
  });
}

async function updateGoalStatus(goalId, workspace, updateData) {
  const updated = await goalsRepo.updateGoalStatus(goalId, workspace, updateData);
  if (!updated) {
    const error = new Error('Goal not found in this workspace');
    error.statusCode = 404;
    error.code = 'GOAL_NOT_FOUND';
    throw error;
  }
  return updated;
}

module.exports = {
  listGoalsWithProgress,
  createGoal,
  updateGoalStatus,
};
