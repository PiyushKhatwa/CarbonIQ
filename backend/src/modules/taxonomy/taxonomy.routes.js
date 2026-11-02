const { Router } = require('express');
const taxonomyController = require('./taxonomy.controller');

const router = Router();

// Taxonomy routes are public/authenticated read-only reference data
router.get('/categories', taxonomyController.getCategories);
router.get('/types', taxonomyController.getActivityTypes);
router.get('/factors', taxonomyController.getEmissionFactors);

module.exports = router;
