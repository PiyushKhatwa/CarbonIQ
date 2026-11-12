const recRepo = require('./recommendations.repository');
const emissionsRepo = require('../emissions/emissions.repository');
const env = require('../../config/env');

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

/**
 * Calls the Python AI microservice (or uses local fallback) to generate
 * structured recommendations based on verified database aggregates.
 */
async function refreshRecommendations(workspace) {
  // 1. Fetch current category breakdown from database view
  const categories = await emissionsRepo.getCategoryBreakdown(workspace);

  if (categories.length === 0) {
    return {
      message: 'No activity data recorded yet to generate recommendations.',
      generatedCount: 0,
    };
  }

  // 2. Compute total emissions
  const grandTotal = categories.reduce((sum, c) => sum + parseFloat(c.total_co2e_kg), 0);

  // 3. Prepare anonymous aggregate payload for AI microservice
  const aiPayload = {
    period: new Date().toISOString().substring(0, 7),
    workspace_type: workspace.type,
    total_emissions_kg_co2e: Number(grandTotal.toFixed(2)),
    previous_period_emissions_kg_co2e: 0.0,
    category_totals: categories.map((c) => ({
      category: c.category_code,
      kg_co2e: Number(parseFloat(c.total_co2e_kg).toFixed(2)),
    })),
  };

  let insightData = null;
  const aiServiceUrl = `${env.aiService.url}/api/v1/insights/generate`;

  // 4. Attempt calling Python FastAPI AI microservice (15s timeout for cloud cold starts)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(aiServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      insightData = await response.json();
    }
  } catch (err) {
    // Graceful silent fallback to backend rule-based engine if microservice is offline
  }

  // 5. If microservice responded, insert its recommendations
  if (insightData && insightData.recommendations && insightData.recommendations.length > 0) {
    let savedRec = null;
    for (const rec of insightData.recommendations) {
      savedRec = await recRepo.insertRecommendation({
        userId: workspace.userId,
        organizationId: workspace.organizationId,
        categoryCode: rec.category,
        title: rec.title,
        explanation: rec.reason,
        actionText: rec.action,
        priority: rec.priority,
        potentialReductionCo2eKg: rec.potential_reduction_co2e_kg || null,
        sourceType: insightData.source_engine || 'ai_service',
        supportingMetric: rec.supporting_metric || `${grandTotal.toFixed(1)} kg CO2e`,
      });
    }
    return {
      message: `Recommendations generated successfully via ${insightData.source_engine}`,
      recommendation: savedRec,
      summary: insightData.summary,
    };
  }

  // 6. Local deterministic fallback (if AI microservice was unreachable)
  const sorted = [...categories].sort(
    (a, b) => parseFloat(b.total_co2e_kg) - parseFloat(a.total_co2e_kg)
  );
  const topCategory = sorted[0];
  const topCo2e = parseFloat(topCategory.total_co2e_kg);

  const strategyMap = {
    electricity: {
      title: 'Optimize HVAC Setpoints and Eliminate Phantom Standby Loads',
      explanation: `Electricity represents your largest single emission footprint (${topCo2e.toFixed(1)} kg CO2e).`,
      actionText:
        'Increase cooling setpoints by 1°C, implement programmable timers on high-draw appliances, and deploy smart power strips.',
      priority: 'high',
      potentialReductionPct: 0.15,
    },
    transportation: {
      title: 'Transition Commute to Public Transit or Shared Mobility',
      explanation: `Transportation activities generated ${topCo2e.toFixed(1)} kg CO2e in this workspace.`,
      actionText:
        'Substitute two private driving days per week with metro transit, carpooling, or evaluate corporate fleet electrification.',
      priority: 'high',
      potentialReductionPct: 0.2,
    },
    fuel: {
      title: 'Audit Standby Generator Run Times & Combustion Efficiency',
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
      explanation: `Solid waste disposal to landfill accounted for ${topCo2e.toFixed(1)} kg CO2e.`,
      actionText:
        'Segregate biodegradable food waste for local aerobic composting, diverting organic matter from anaerobic landfill decomposition.',
      priority: 'low',
      potentialReductionPct: 0.25,
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

  const fallbackRec = await recRepo.insertRecommendation({
    userId: workspace.userId,
    organizationId: workspace.organizationId,
    categoryCode: topCategory.category_code,
    title: strategy.title,
    explanation: strategy.explanation,
    actionText: strategy.actionText,
    priority: strategy.priority,
    potentialReductionCo2eKg: potentialReductionKg,
    sourceType: 'rule_based_fallback',
    supportingMetric: `${topCo2e.toFixed(1)} kg CO2e from ${topCategory.category_name}`,
  });

  return {
    message: 'Recommendations generated via deterministic rule-based engine',
    recommendation: fallbackRec,
  };
}

module.exports = {
  listRecommendations,
  updateStatus,
  refreshRecommendations,
};
