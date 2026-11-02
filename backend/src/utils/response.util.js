/**
 * Standardized API Response Utilities
 */

function sendSuccess(res, data, statusCode = 200, meta = null) {
  const payload = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

function sendCreated(res, data, meta = null) {
  return sendSuccess(res, data, 201, meta);
}

function sendPaginated(res, items, page, limit, totalCount) {
  const totalPages = Math.ceil(totalCount / limit);
  return res.status(200).json({
    success: true,
    data: items,
    meta: {
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalItems: parseInt(totalCount, 10),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
}

function sendError(res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
};
