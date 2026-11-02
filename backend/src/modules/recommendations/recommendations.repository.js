const db = require('../../config/db');

async function listRecommendations(workspace) {
  let queryText = `
    SELECT 
      id, user_id, organization_id, category_code, title,
      explanation, action_text, priority, potential_reduction_co2e_kg,
      source_type, status, supporting_metric, created_at, updated_at
    FROM recommendations
  `;
  const params = [];

  if (workspace.type === 'personal') {
    queryText += ` WHERE user_id = $1`;
    params.push(workspace.userId);
  } else {
    queryText += ` WHERE organization_id = $1`;
    params.push(workspace.organizationId);
  }

  queryText += ` ORDER BY 
    CASE priority 
      WHEN 'high' THEN 1 
      WHEN 'medium' THEN 2 
      WHEN 'low' THEN 3 
      ELSE 4 
    END, created_at DESC`;

  const res = await db.query(queryText, params);
  return res.rows;
}

async function updateRecommendationStatus(id, workspace, status) {
  let queryText = `UPDATE recommendations SET status = $1 WHERE id = $2`;
  const params = [status, id];

  if (workspace.type === 'personal') {
    queryText += ` AND user_id = $3`;
    params.push(workspace.userId);
  } else {
    queryText += ` AND organization_id = $3`;
    params.push(workspace.organizationId);
  }

  queryText += ` RETURNING *`;
  const res = await db.query(queryText, params);
  return res.rows[0] || null;
}

async function insertRecommendation({
  userId,
  organizationId,
  categoryCode,
  title,
  explanation,
  actionText,
  priority,
  potentialReductionCo2eKg,
  sourceType = 'rule_based',
  supportingMetric,
}) {
  const res = await db.query(
    `INSERT INTO recommendations (
       user_id, organization_id, category_code, title,
       explanation, action_text, priority, potential_reduction_co2e_kg,
       source_type, status, supporting_metric
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10)
     RETURNING *`,
    [
      userId,
      organizationId,
      categoryCode,
      title,
      explanation,
      actionText,
      priority,
      potentialReductionCo2eKg || null,
      sourceType,
      supportingMetric || null,
    ]
  );
  return res.rows[0];
}

module.exports = {
  listRecommendations,
  updateRecommendationStatus,
  insertRecommendation,
};
