const db = require('../../config/db');

async function findUserByEmail(email) {
  const res = await db.query(
    `SELECT id, email, password_hash, full_name, system_role, default_workspace_type, created_at, updated_at
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return res.rows[0] || null;
}

async function findUserById(id) {
  const res = await db.query(
    `SELECT id, email, full_name, system_role, default_workspace_type, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function createUser({ email, passwordHash, fullName, defaultWorkspaceType = 'personal' }) {
  const res = await db.query(
    `INSERT INTO users (email, password_hash, full_name, default_workspace_type)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, system_role, default_workspace_type, created_at`,
    [email.toLowerCase(), passwordHash, fullName, defaultWorkspaceType]
  );
  return res.rows[0];
}

async function updateUserProfile(id, { fullName, defaultWorkspaceType }) {
  const updates = [];
  const params = [id];
  let paramIdx = 2;

  if (fullName !== undefined) {
    updates.push(`full_name = $${paramIdx++}`);
    params.push(fullName);
  }
  if (defaultWorkspaceType !== undefined) {
    updates.push(`default_workspace_type = $${paramIdx++}`);
    params.push(defaultWorkspaceType);
  }

  if (updates.length === 0) {
    return findUserById(id);
  }

  const queryText = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING id, email, full_name, system_role, default_workspace_type, created_at, updated_at
  `;
  const res = await db.query(queryText, params);
  return res.rows[0];
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
};
