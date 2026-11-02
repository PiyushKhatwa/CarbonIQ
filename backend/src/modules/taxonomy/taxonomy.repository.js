const db = require('../../config/db');

async function getCategories() {
  const res = await db.query(
    `SELECT id, code, name, description, icon_name, display_order
     FROM activity_categories
     WHERE is_active = TRUE
     ORDER BY display_order ASC, name ASC`
  );
  return res.rows;
}

async function getActivityTypes(categoryCode = null) {
  let queryText = `
    SELECT 
      t.id, 
      t.code, 
      t.name, 
      t.standard_unit, 
      t.description,
      c.id AS category_id,
      c.code AS category_code,
      c.name AS category_name,
      c.icon_name AS category_icon
    FROM activity_types t
    JOIN activity_categories c ON t.category_id = c.id
    WHERE t.is_active = TRUE
  `;
  const params = [];

  if (categoryCode) {
    queryText += ` AND c.code = $1`;
    params.push(categoryCode);
  }

  queryText += ` ORDER BY c.display_order ASC, t.name ASC`;
  const res = await db.query(queryText, params);
  return res.rows;
}

async function getEmissionFactors(activityTypeId = null, geography = 'India') {
  let queryText = `
    SELECT 
      ef.id,
      ef.factor_value,
      ef.unit,
      ef.geography,
      ef.valid_from,
      ef.valid_to,
      ef.version_tag,
      ef.is_verified,
      t.id AS activity_type_id,
      t.code AS activity_type_code,
      t.name AS activity_type_name,
      s.id AS source_id,
      s.short_name AS source_name,
      s.publisher,
      s.source_title,
      s.reference_url,
      s.publication_year
    FROM emission_factors ef
    JOIN activity_types t ON ef.activity_type_id = t.id
    JOIN emission_factor_sources s ON ef.source_id = s.id
    WHERE ef.is_verified = TRUE
  `;
  const params = [];
  let paramIdx = 1;

  if (activityTypeId) {
    queryText += ` AND ef.activity_type_id = $${paramIdx++}`;
    params.push(activityTypeId);
  }
  if (geography) {
    queryText += ` AND (ef.geography = $${paramIdx++} OR ef.geography = 'Global')`;
    params.push(geography);
  }

  queryText += ` ORDER BY ef.valid_from DESC`;
  const res = await db.query(queryText, params);
  return res.rows;
}

module.exports = {
  getCategories,
  getActivityTypes,
  getEmissionFactors,
};

