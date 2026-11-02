const recRepo = require('./recommendations.repository');
const emissionsRepo = require('../emissions/emissions.repository');

async function listRecommendations(workspace) {
  return recRepo.listRecommendations(workspace);
}

async function updateStatus(recId, workspace, status) {
  const updated = await recRepo.updateRecommendationStatus(recId, workspace, status);
  if (!updated) {
    const error = new Error('Recommendation not found in this workspace');
    error.statusCode = 404;
    error.code = 'REC_NOT_FOUND';
    throw error;
  }
  return updated;
}

async function refreshRecommendations(workspace) {
  // 1. Fetch current category breakdown
  const categories = await emissionsRepo.getCategoryBreakdown(workspace);

  if (categories.length === 0) {
    return {
      message: 'No activity data recorded yet to generate recommendations.',
      generatedCount: 0,
    };
  }

  // Sort by emissions descending
  const sorted = [...categories].sort(
    (a, b) => parseFloat(b.total_co2e_kg) - parseFloat(a.total_co2e_kg)
  );

  const topCategory = sorted[0];
  const topCo2e = parseFloat(topCategory.total_co2e_kg);

  // Rule-based insight generation templates
  const strategyMap = {
    electricity: {
      title: 'Optimize Cooling & Facility Standby Power',
      explanation: `Electricity represents your largest single emission footprint (${topCo2e.toFixed(1)} kg CO2e).`,
      actionText:
        'Increase cooling setpoints by 1°C, implement programmable timers on high-draw appliances, and deploy smart power strips.',
      priority: 'high',
      potentialReductionPct: 0.15,
    },
    transportation: {
      title: 'Transition Commute to Public Transit or Electric Fleets',
      explanation: `Transportation activities generated ${topCo2e.toFixed(1)} kg CO2e in this workspace.`,
      actionText:
        'Encourage shared transit, explore EV fleet options, or offset two private car commute days weekly with rail transit.',
      priority: 'high',
      potentialReductionPct: 0.2,
    },
    fuel: {
      title: 'Audit Standby Generator Run Times & Fuel Efficiency',
      explanation: `Liquid fuel combustion accounted for ${topCo2e.toFixed(1)} kg CO2e.`,
      actionText:
        'Ensure scheduled maintenance of diesel machinery, optimize generator load factor, and review battery energy storage alternatives.',
      priority: 'medium',
      potentialReductionPct: 0.12,
    },
    lpg: {
      title: 'Improve Kitchen Burner Efficiency & Heat Retention',
      explanation: `LPG cooking fuel accounted for ${topCo2e.toFixed(1)} kg CO2e.`,
      actionText:
        'Inspect burners for clean blue flame combustion, utilize induction cookware, and cover vessels during heating.',
      priority: 'medium',
      potentialReductionPct: 0.1,
    },
    waste: {
      title: 'Implement Source Segregation & Composting Program',
      explanation: `Waste disposal to landfill accounted for ${topCo2e.toFixed(1)} kg CO2e.`,
      actionText:
        'Segregate biodegradable food waste for local aerobic composting, diverting organic matter from anaerobic landfill decomposition.',
      priority: 'low',
      potentialReductionPct: 0.3,
    },
  };

  const strategy = strategyMap[topCategory.category_code] || {
    title: `Address ${topCategory.category_name} Footprint`,
    explanation: `${topCategory.category_name} is your leading emissions category (${topCo2e.toFixed(1)} kg CO2e).`,
    actionText: 'Review operational consumption patterns to identify conservation measures.',
    priority: 'medium',
    potentialReductionPct: 0.1,
  };

  const potentialReductionKg = Math.round(topCo2e * strategy.potentialReductionPct * 100) / 100;

  const newRec = await recRepo.insertRecommendation({
    userId: workspace.userId,
    organizationId: workspace.organizationId,
    categoryCode: topCategory.category_code,
    title: strategy.title,
    explanation: strategy.explanation,
    actionText: strategy.actionText,
    priority: strategy.priority,
    potentialReductionCo2eKg: potentialReductionKg,
    sourceType: 'rule_based',
    supportingMetric: `${topCo2e.toFixed(1)} kg CO2e from ${topCategory.category_name}`,
  });

  return {
    message: 'Recommendations refreshed based on verified activity data',
    recommendation: newRec,
  };
}

module.exports = {
  listRecommendations,
  updateStatus,
  refreshRecommendations,
};

