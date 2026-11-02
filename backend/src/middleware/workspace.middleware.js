const { sendError } = require('../utils/response.util');
const db = require('../config/db');

/**
 * Resolves and validates the active workspace context (personal vs organization).
 * Attaches `req.workspace` object to the request.
 */
async function resolveWorkspaceScope(req, res, next) {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to resolve workspace', 401, 'AUTH_REQUIRED');
    }

    // Determine requested workspace type from header, query, or user default
    const workspaceType = (
      req.headers['x-workspace-type'] ||
      req.query.workspace_type ||
      req.user.default_workspace_type ||
      'personal'
    ).toLowerCase();

    if (workspaceType === 'personal') {
      req.workspace = {
        type: 'personal',
        userId: req.user.id,
        organizationId: null,
        departmentId: null,
      };
      return next();
    }

    if (workspaceType === 'organization') {
      const organizationId = req.headers['x-organization-id'] || req.query.organization_id || req.body.organization_id;

      if (!organizationId) {
        return sendError(
          res,
          'Active organization ID is required for organization workspace (x-organization-id header)',
          400,
          'ORG_ID_REQUIRED'
        );
      }

      // Verify that the user is an active member of this organization
      const memberRes = await db.query(
        `SELECT om.id, om.role, o.name, o.slug
         FROM organization_members om
         JOIN organizations o ON om.organization_id = o.id
         WHERE om.organization_id = $1 AND om.user_id = $2`,
        [organizationId, req.user.id]
      );

      if (memberRes.rowCount === 0) {
        return sendError(
          res,
          'Access denied: You are not a member of the requested organization workspace',
          403,
          'WORKSPACE_ACCESS_DENIED'
        );
      }

      const membership = memberRes.rows[0];
      req.workspace = {
        type: 'organization',
        userId: null,
        organizationId,
        organizationName: membership.name,
        memberRole: membership.role,
      };
      return next();
    }

    return sendError(res, "Invalid workspace type. Expected 'personal' or 'organization'", 400, 'INVALID_WORKSPACE_TYPE');
  } catch (err) {
    next(err);
  }
}

/**
 * Requires member to hold an administrative role within the active organization
 */
function requireOrgAdmin(req, res, next) {
  if (!req.workspace || req.workspace.type !== 'organization') {
    return sendError(res, 'Organization workspace required for this operation', 400, 'ORG_WORKSPACE_REQUIRED');
  }
  if (!['owner', 'admin'].includes(req.workspace.memberRole)) {
    return sendError(res, 'Organization administrator role required', 403, 'ORG_ADMIN_REQUIRED');
  }
  next();
}

module.exports = {
  resolveWorkspaceScope,
  requireOrgAdmin,
};
