const { sendError } = require('../utils/response.util');

function errorHandler(err, req, res, next) {
  // PostgreSQL Check Violation
  if (err.code === '23514') {
    return sendError(res, `Check constraint violation: ${err.message}`, 400, 'CHECK_VIOLATION');
  }

  // PostgreSQL Unique Violation
  if (err.code === '23505') {
    return sendError(res, `Resource conflict: ${err.detail || 'Duplicate entry'}`, 409, 'UNIQUE_VIOLATION');
  }

  // PostgreSQL Foreign Key Violation
  if (err.code === '23503') {
    return sendError(res, `Referenced entity not found: ${err.detail || 'Foreign key violation'}`, 400, 'FOREIGN_KEY_VIOLATION');
  }

  // Custom application error with statusCode
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode, err.code || 'APPLICATION_ERROR', err.details || null);
  }

  // JSON parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload', 400, 'INVALID_JSON');
  }

  console.error('[Unhandled Server Error]:', err);
  return sendError(res, 'An unexpected internal server error occurred', 500, 'INTERNAL_SERVER_ERROR');
}

function notFoundHandler(req, res) {
  return sendError(
    res,
    `Endpoint not found: ${req.method} ${req.originalUrl}. Supported base prefix is /api/v1 (e.g. /api/v1/auth/register).`,
    404,
    'NOT_FOUND'
  );
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

