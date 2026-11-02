const db = require('../../config/db');

async function createOrganizationWithMember({ name, slug, description, industry, country, createdBy }) {
  return db.withTransaction(async (client) => {
    // 1. Insert organization
    const orgRes = await client.query(
      `INSERT INTO organizations (name, slug, description, industry, country, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, slug, description, industry, country, created_by, created_at`,
      [name, slug, description, industry, country, createdBy]
    );
    const org = orgRes.rows[0];

    // 2. Insert creator as owner in organization_members
    await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [org.id, createdBy]
    );

    return org;
  });
}

async function findOrgById(id) {
  const res = await db.query(
    `SELECT id, name, slug, description, industry, country, created_by, created_at, updated_at
     FROM organizations
     WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function updateOrganization(id, { name, description, industry, country }) {
  const updates = [];
  const params = [id];
  let paramIdx = 2;

  if (name !== undefined) {
    updates.push(`name = $${paramIdx++}`);
    params.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIdx++}`);
    params.push(description);
  }
  if (industry !== undefined) {
    updates.push(`industry = $${paramIdx++}`);
    params.push(industry);
  }
  if (country !== undefined) {
    updates.push(`country = $${paramIdx++}`);
    params.push(country);
  }

  if (updates.length === 0) return findOrgById(id);

  const res = await db.query(
    `UPDATE organizations
     SET ${updates.join(', ')}
     WHERE id = $1
     RETURNING id, name, slug, description, industry, country, created_at, updated_at`,
    params
  );
  return res.rows[0];
}

async function getOrganizationMembers(orgId) {
  const res = await db.query(
    `SELECT om.id AS membership_id, om.role, om.joined_at, u.id AS user_id, u.email, u.full_name
     FROM organization_members om
     JOIN users u ON om.user_id = u.id
     WHERE om.organization_id = $1
     ORDER BY om.joined_at ASC`,
    [orgId]
  );
  return res.rows;
}

async function addOrganizationMember(orgId, userId, role) {
  const res = await db.query(
    `INSERT INTO organization_members (organization_id, user_id, role)
     VALUES ($1, $2, $3)
     RETURNING id, organization_id, user_id, role, joined_at`,
    [orgId, userId, role]
  );
  return res.rows[0];
}

async function removeOrganizationMember(orgId, memberId) {
  const res = await db.query(
    `DELETE FROM organization_members
     WHERE organization_id = $1 AND (id = $2 OR user_id = $2)
     RETURNING id, user_id`,
    [orgId, memberId]
  );
  return res.rows[0] || null;
}

async function getOrganizationDepartments(orgId) {
  const res = await db.query(
    `SELECT id, name, code, description, created_at
     FROM departments
     WHERE organization_id = $1
     ORDER BY name ASC`,
    [orgId]
  );
  return res.rows;
}

async function createDepartment(orgId, { name, code, description }) {
  const res = await db.query(
    `INSERT INTO departments (organization_id, name, code, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, organization_id, name, code, description, created_at`,
    [orgId, name, code, description]
  );
  return res.rows[0];
}

async function getMemberRole(orgId, userId) {
  const res = await db.query(
    `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
    [orgId, userId]
  );
  return res.rows[0] ? res.rows[0].role : null;
}

module.exports = {
  createOrganizationWithMember,
  findOrgById,
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
  getOrganizationDepartments,
  createDepartment,
  getMemberRole,
};
