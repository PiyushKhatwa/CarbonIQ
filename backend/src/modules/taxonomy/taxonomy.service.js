const taxonomyRepo = require('./taxonomy.repository');

async function getCategories() {
  return taxonomyRepo.getCategories();
}

async function getActivityTypes(categoryCode) {
  return taxonomyRepo.getActivityTypes(categoryCode);
}

async function getEmissionFactors(activityTypeId, geography) {
  return taxonomyRepo.getEmissionFactors(activityTypeId, geography);
}

module.exports = {
  getCategories,
  getActivityTypes,
  getEmissionFactors,
};
