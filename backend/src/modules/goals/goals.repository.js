const db = require('../../config/db');

async function listGoals(workspace) {
  let queryText = `
    SELECT 
      g.id,
      g.user_id,
      g.organization_id,
      g.title,
      g.description,
      g.category_id,
      c.name AS category_name,
      c.code AS category_code,
      g.target_reduction_pct,
      g.baseline_co2e_kg,
      g.target_co2e_kg,
      g.start_date,
      g.target_date,
      g.status,
      g.created_at,
      g.updated_at
    FROM goals g
    LEFT JOIN activity_categories c ON g.category_id = c.id
  `;
  const params = [];

  if (workspace.type === 'personal') {
    queryText += ` WHERE g.user_id = $1`;
    params.push(workspace.userId);
  } else {
    queryText += ` WHERE g.organization_id = $1`;
    params.push(workspace.organizationId);
  }

  queryText += ` ORDER BY g.created_at DESC`;
  const res = await db.query(queryText, params);
  return res.rows;
}

async function createGoal({
  userId,
  organizationId,
  title,
  description,
  categoryId,
  targetReductionPct,
  baselineCo2eKg,
  targetCo2eKg,
  startDate,
  targetDate,
}) {
  const res = await db.query(
    `INSERT INTO goals (
       user_id, organization_id, title, description, category_id,
       target_reduction_pct, baseline_co2e_kg, target_co2e_kg,
       start_date, target_date, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
     RETURNING *`,
    [
      userId,
      organizationId,
      title,
      description || null,
      categoryId || null,
      targetReductionPct || null,
      baselineCo2eKg,
      targetCo2eKg,
      startDate,
      targetDate,
    ]
  );
  return res.rows[0];
}

async function updateGoalStatus(goalId, workspace, { status, description }) {
  let queryText = `UPDATE goals SET status = $1`;
  const params = [status, goalId];
  let paramIdx = 3;

  if (description !== undefined) {
    queryText += `, description = $${paramIdx++}`;
    params.push(description);
  }

  queryText += ` WHERE id = $2`;
  if (workspace.type === 'personal') {
    queryText += ` AND user_id = $${paramIdx++}`;
    params.push(workspace.userId);
  } else {
    queryText += ` AND organization_id = $${paramIdx++}`;
    params.push(workspace.organizationId);
  }

  queryText += ` RETURNING *`;
  const res = await db.query(queryText, params);
  return res.rows[0] || null;
}

async function calculateGoalCurrentEmissions(workspace, categoryId, startDate, targetDate) {
  let queryText = `
    SELECT COALESCE(SUM(er.calculated_co2e_kg), 0) AS current_co2e
    FROM activities a
    JOIN emission_records er ON a.id = er.activity_id
    JOIN activity_types t ON a.activity_type_id = t.id
    WHERE a.activity_date BETWEEN $1 AND $2
  `;
  const params = [startDate, targetDate];
  let paramIdx = 3;

  if (workspace.type === 'personal') {
    queryText += ` AND a.user_id = $${paramIdx++}`;
    params.push(workspace.userId);
  } else {
    queryText += ` AND a.organization_id = $${paramIdx++}`;
    params.push(workspace.organizationId);
  }

  if (categoryId) {
    queryText += ` AND t.category_id = $${paramIdx++}`;
    params.push(categoryId);
  }

  const res = await db.query(queryText, params);
  return parseFloat(res.rows[0].current_co2e);
}

module.exports = {
  listGoals,
  createGoal,
  updateGoalStatus,
  calculateGoalCurrentEmissions,
};
