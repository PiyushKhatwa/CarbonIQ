const { verifyToken } = require('../utils/token.util');
const { sendError } = require('../utils/response.util');
const db = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid or expired token', 401, 'AUTH_INVALID_TOKEN');
    }

    // Retrieve active user from PostgreSQL
    const userRes = await db.query(
      `SELECT id, email, full_name, system_role, default_workspace_type 
       FROM users 
       WHERE id = $1`,
      [decoded.userId]
    );

    if (userRes.rowCount === 0) {
      return sendError(res, 'User account no longer exists', 401, 'AUTH_USER_NOT_FOUND');
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
    }
    if (!allowedRoles.includes(req.user.system_role)) {
      return sendError(res, 'Insufficient system privileges', 403, 'FORBIDDEN');
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};

