const orgService = require('./organizations.service');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

async function createOrg(req, res, next) {
  try {
    const org = await orgService.createOrganization(req.user.id, req.body);
    return sendCreated(res, org);
  } catch (err) {
    next(err);
  }
}

async function getOrg(req, res, next) {
  try {
    const org = await orgService.getOrganization(req.params.id, req.user.id);
    return sendSuccess(res, org);
  } catch (err) {
    next(err);
  }
}

async function updateOrg(req, res, next) {
  try {
    const updated = await orgService.updateOrganization(req.params.id, req.user.id, req.body);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

async function getMembers(req, res, next) {
  try {
    const members = await orgService.getMembers(req.params.id, req.user.id);
    return sendSuccess(res, members);
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const newMember = await orgService.addMember(req.params.id, req.user.id, req.body);
    return sendCreated(res, newMember);
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const result = await orgService.removeMember(req.params.id, req.user.id, req.params.memberId);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

async function getDepartments(req, res, next) {
  try {
    const departments = await orgService.getDepartments(req.params.id, req.user.id);
    return sendSuccess(res, departments);
  } catch (err) {
    next(err);
  }
}

async function createDepartment(req, res, next) {
  try {
    const dept = await orgService.createDepartment(req.params.id, req.user.id, req.body);
    return sendCreated(res, dept);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrg,
  getOrg,
  updateOrg,
  getMembers,
  addMember,
  removeMember,
  getDepartments,
  createDepartment,
};

