const { sendError } = require('../utils/response.util');

/**
 * Zod validation middleware for request body, query params, and URL params
 */
function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (err) {
      if (err.errors) {
        const issues = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 'Validation failed for request data', 400, 'VALIDATION_ERROR', issues);
      }
      next(err);
    }
  };
}

module.exports = {
  validate,
};
