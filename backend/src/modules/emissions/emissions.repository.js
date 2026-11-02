const db = require('../../config/db');

async function getWorkspaceSummary(workspace, startDate, endDate) {
  const res = await db.query(
    `SELECT * FROM fn_get_workspace_summary($1, $2, $3, $4);`,
    [workspace.userId, workspace.organizationId, startDate, endDate]
  );
  return res.rows[0];
}

async function getMonthlyTrends(workspace, limit = 12) {
  let queryText = `
    SELECT 
      year_month,
      activity_year,
      activity_month,
      total_activities,
      total_co2e_kg,
      avg_co2e_kg_per_activity
    FROM v_monthly_emissions
  `;
  const params = [];

  if (workspace.type === 'personal') {
    queryText += ` WHERE user_id = $1`;
    params.push(workspace.userId);
  } else {
    queryText += ` WHERE organization_id = $1`;
    params.push(workspace.organizationId);
  }

  queryText += ` ORDER BY year_month ASC LIMIT $2`;
  params.push(limit);

  const res = await db.query(queryText, params);
  return res.rows;
}

async function getCategoryBreakdown(workspace) {
  let queryText = `
    SELECT 
      category_id,
      category_code,
      category_name,
      category_icon,
      activity_count,
      total_quantity,
      unit,
      total_co2e_kg
    FROM v_category_emissions
  `;
  const params = [];

  if (workspace.type === 'personal') {
    queryText += ` WHERE user_id = $1`;
    params.push(workspace.userId);
  } else {
    queryText += ` WHERE organization_id = $1`;
    params.push(workspace.organizationId);
  }

  queryText += ` ORDER BY total_co2e_kg DESC`;

  const res = await db.query(queryText, params);
  return res.rows;
}

async function getDepartmentBreakdown(orgId) {
  const res = await db.query(
    `SELECT 
       department_id,
       department_name,
       activity_count,
       total_co2e_kg
     FROM v_department_emissions
     WHERE organization_id = $1
     ORDER BY total_co2e_kg DESC`,
    [orgId]
  );
  return res.rows;
}

module.exports = {
  getWorkspaceSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getDepartmentBreakdown,
};
