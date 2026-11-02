const { Router } = require('express');
const orgController = require('./organizations.controller');
const { requireAuth } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  createOrgSchema,
  updateOrgSchema,
  addMemberSchema,
  createDepartmentSchema,
} = require('./organizations.validator');

const router = Router();

router.post('/', requireAuth, validate(createOrgSchema), orgController.createOrg);
router.get('/:id', requireAuth, orgController.getOrg);
router.patch('/:id', requireAuth, validate(updateOrgSchema), orgController.updateOrg);

router.get('/:id/members', requireAuth, orgController.getMembers);
router.post('/:id/members', requireAuth, validate(addMemberSchema), orgController.addMember);
router.delete('/:id/members/:memberId', requireAuth, orgController.removeMember);

router.get('/:id/departments', requireAuth, orgController.getDepartments);
router.post('/:id/departments', requireAuth, validate(createDepartmentSchema), orgController.createDepartment);

module.exports = router;
