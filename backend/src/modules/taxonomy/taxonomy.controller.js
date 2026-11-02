const taxonomyService = require('./taxonomy.service');
const { sendSuccess } = require('../../utils/response.util');

async function getCategories(req, res, next) {
  try {
    const categories = await taxonomyService.getCategories();
    return sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

async function getActivityTypes(req, res, next) {
  try {
    const types = await taxonomyService.getActivityTypes(req.query.category_code);
    return sendSuccess(res, types);
  } catch (err) {
    next(err);
  }
}

async function getEmissionFactors(req, res, next) {
  try {
    const factors = await taxonomyService.getEmissionFactors(
      req.query.activity_type_id,
      req.query.geography || 'India'
    );
    return sendSuccess(res, factors);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getActivityTypes,
  getEmissionFactors,
};
