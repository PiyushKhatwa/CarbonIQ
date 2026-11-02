const db = require('../../config/db');

async function getUserOrganizations(userId) {
  const res = await db.query(
    `SELECT 
       o.id, 
       o.name, 
       o.slug, 
       o.industry, 
       o.country,
       om.role AS member_role,
       om.joined_at,
       (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) AS total_members,
       (SELECT COUNT(*) FROM departments WHERE organization_id = o.id) AS total_departments
     FROM organizations o
     JOIN organization_members om ON o.id = om.organization_id
     WHERE om.user_id = $1
     ORDER BY om.joined_at ASC`,
    [userId]
  );
  return res.rows;
}

module.exports = {
  getUserOrganizations,
};

