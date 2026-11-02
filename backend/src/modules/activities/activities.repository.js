const db = require('../../config/db');

async function findMatchingFactor(client, activityTypeId, geography, activityDate) {
  // Query factor for given type, geography, and date window
  let res = await client.query(
    `SELECT ef.id, ef.factor_value, ef.unit, efs.short_name AS source_name
     FROM emission_factors ef
     JOIN emission_factor_sources efs ON ef.source_id = efs.id
     WHERE ef.activity_type_id = $1
       AND ef.geography = $2
       AND ef.valid_from <= $3
       AND (ef.valid_to IS NULL OR ef.valid_to >= $3)
       AND ef.is_verified = TRUE
     ORDER BY ef.valid_from DESC
     LIMIT 1`,
    [activityTypeId, geography, activityDate]
  );

  // Fallback to Global or any valid factor for this activity type
  if (res.rowCount === 0) {
    res = await client.query(
      `SELECT ef.id, ef.factor_value, ef.unit, efs.short_name AS source_name
       FROM emission_factors ef
       JOIN emission_factor_sources efs ON ef.source_id = efs.id
       WHERE ef.activity_type_id = $1
         AND ef.valid_from <= $2
         AND (ef.valid_to IS NULL OR ef.valid_to >= $2)
         AND ef.is_verified = TRUE
       ORDER BY ef.valid_from DESC
       LIMIT 1`,
      [activityTypeId, activityDate]
    );
  }

  return res.rows[0] || null;
}

async function createActivityWithEmissions({
  userId,
  organizationId,
  departmentId,
  activityTypeId,
  createdBy,
  quantity,
  unit,
  activityDate,
  notes,
  geography = 'India',
  calculatedCo2e,
  factorId,
  factorSnapshot,
  sourceSnapshot,
}) {
  return db.withTransaction(async (client) => {
    // 1. Insert activity row
    const actRes = await client.query(
      `INSERT INTO activities (
         user_id, organization_id, department_id, activity_type_id, created_by,
         quantity, unit, activity_date, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, user_id, organization_id, department_id, activity_type_id, created_by,
                 quantity, unit, activity_date, notes, created_at, updated_at`,
      [
        userId,
        organizationId,
        departmentId || null,
        activityTypeId,
        createdBy,
        quantity,
        unit,
        activityDate,
        notes || null,
      ]
    );
    const activity = actRes.rows[0];

    // 2. Insert emission record with frozen factor snapshot
    const emRes = await client.query(
      `INSERT INTO emission_records (
         activity_id, emission_factor_id, emission_factor_snapshot,
         factor_source_snapshot, calculated_co2e_kg, calculation_method
       ) VALUES ($1, $2, $3, $4, $5, 'backend_deterministic')
       RETURNING id, activity_id, emission_factor_id, emission_factor_snapshot,
                 factor_source_snapshot, calculated_co2e_kg, calculation_method, calculated_at`,
      [activity.id, factorId, factorSnapshot, sourceSnapshot, calculatedCo2e]
    );

    return {
      ...activity,
      emissionRecord: emRes.rows[0],
    };
  });
}

async function getActivityDetail(activityId, workspace) {
  let queryText = `SELECT * FROM v_activities_detailed WHERE activity_id = $1`;
  const params = [activityId];

  if (workspace.type === 'personal') {
    queryText += ` AND user_id = $2`;
    params.push(workspace.userId);
  } else {
    queryText += ` AND organization_id = $2`;
    params.push(workspace.organizationId);
  }

  const res = await db.query(queryText, params);
  return res.rows[0] || null;
}

async function listActivities(workspace, filters) {
  const { page = 1, limit = 20, startDate, endDate, categoryId, categoryCode, departmentId } = filters;
  const offset = (page - 1) * limit;

  let whereClauses = [];
  const params = [];
  let paramIdx = 1;

  if (workspace.type === 'personal') {
    whereClauses.push(`user_id = $${paramIdx++}`);
    params.push(workspace.userId);
  } else {
    whereClauses.push(`organization_id = $${paramIdx++}`);
    params.push(workspace.organizationId);
  }

  if (startDate) {
    whereClauses.push(`activity_date >= $${paramIdx++}`);
    params.push(startDate);
  }
  if (endDate) {
    whereClauses.push(`activity_date <= $${paramIdx++}`);
    params.push(endDate);
  }
  if (categoryId) {
    whereClauses.push(`category_id = $${paramIdx++}`);
    params.push(categoryId);
  }
  if (categoryCode) {
    whereClauses.push(`category_code = $${paramIdx++}`);
    params.push(categoryCode);
  }
  if (departmentId) {
    whereClauses.push(`department_id = $${paramIdx++}`);
    params.push(departmentId);
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const countRes = await db.query(`SELECT COUNT(*) FROM v_activities_detailed ${whereSQL}`, params);
  const totalCount = parseInt(countRes.rows[0].count, 10);

  // Query paginated items
  const querySQL = `
    SELECT * 
    FROM v_activities_detailed 
    ${whereSQL}
    ORDER BY activity_date DESC, created_at DESC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  params.push(limit, offset);

  const itemsRes = await db.query(querySQL, params);

  return {
    items: itemsRes.rows,
    totalCount,
    page,
    limit,
  };
}

async function updateActivityWithEmissions(activityId, workspace, updateData) {
  return db.withTransaction(async (client) => {
    // 1. Fetch current activity row within workspace
    let checkQuery = `SELECT * FROM activities WHERE id = $1`;
    const checkParams = [activityId];
    if (workspace.type === 'personal') {
      checkQuery += ` AND user_id = $2`;
      checkParams.push(workspace.userId);
    } else {
      checkQuery += ` AND organization_id = $2`;
      checkParams.push(workspace.organizationId);
    }

    const currentRes = await client.query(checkQuery, checkParams);
    if (currentRes.rowCount === 0) {
      return null;
    }
    const current = currentRes.rows[0];

    const newActivityTypeId = updateData.activityTypeId || current.activity_type_id;
    const newQuantity = updateData.quantity !== undefined ? updateData.quantity : parseFloat(current.quantity);
    const newUnit = updateData.unit || current.unit;
    const newActivityDate = updateData.activityDate || current.activity_date;
    const newDepartmentId = updateData.departmentId !== undefined ? updateData.departmentId : current.department_id;
    const newNotes = updateData.notes !== undefined ? updateData.notes : current.notes;
    const geography = updateData.geography || 'India';

    // 2. Resolve matching factor
    const factor = await findMatchingFactor(client, newActivityTypeId, geography, newActivityDate);
    if (!factor) {
      const err = new Error('No valid emission factor found for activity parameters');
      err.statusCode = 400;
      throw err;
    }

    const calculatedCo2e = Math.round((newQuantity * parseFloat(factor.factor_value)) * 10000) / 10000;

    // 3. Update activity
    await client.query(
      `UPDATE activities
       SET activity_type_id = $1, quantity = $2, unit = $3, activity_date = $4,
           department_id = $5, notes = $6
       WHERE id = $7`,
      [newActivityTypeId, newQuantity, newUnit, newActivityDate, newDepartmentId, newNotes, activityId]
    );

    // 4. Update emission record
    await client.query(
      `UPDATE emission_records
       SET emission_factor_id = $1,
           emission_factor_snapshot = $2,
           factor_source_snapshot = $3,
           calculated_co2e_kg = $4,
           calculated_at = CURRENT_TIMESTAMP
       WHERE activity_id = $5`,
      [factor.id, factor.factor_value, factor.source_name, calculatedCo2e, activityId]
    );

    // 5. Return updated detailed view row
    const updatedView = await client.query(
      `SELECT * FROM v_activities_detailed WHERE activity_id = $1`,
      [activityId]
    );
    return updatedView.rows[0];
  });
}

async function deleteActivity(activityId, workspace) {
  let deleteQuery = `DELETE FROM activities WHERE id = $1`;
  const params = [activityId];

  if (workspace.type === 'personal') {
    deleteQuery += ` AND user_id = $2`;
    params.push(workspace.userId);
  } else {
    deleteQuery += ` AND organization_id = $2`;
    params.push(workspace.organizationId);
  }

  deleteQuery += ` RETURNING id`;
  const res = await db.query(deleteQuery, params);
  return res.rowCount > 0;
}

module.exports = {
  findMatchingFactor,
  createActivityWithEmissions,
  getActivityDetail,
  listActivities,
  updateActivityWithEmissions,
  deleteActivity,
};
