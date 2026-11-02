const orgRepo = require('./organizations.repository');
const authRepo = require('../auth/auth.repository');

async function createOrganization(userId, data) {
  // Generate slug if not provided
  let slug = data.slug;
  if (!slug) {
    slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    slug += `-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return orgRepo.createOrganizationWithMember({
    name: data.name,
    slug,
    description: data.description || null,
    industry: data.industry || null,
    country: data.country || 'India',
    createdBy: userId,
  });
}

async function getOrganization(orgId, userId) {
  const role = await orgRepo.getMemberRole(orgId, userId);
  if (!role) {
    const error = new Error('Access denied: You are not a member of this organization');
    error.statusCode = 403;
    error.code = 'WORKSPACE_ACCESS_DENIED';
    throw error;
  }

  const org = await orgRepo.findOrgById(orgId);
  if (!org) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    error.code = 'ORG_NOT_FOUND';
    throw error;
  }

  const departments = await orgRepo.getOrganizationDepartments(orgId);
  return {
    ...org,
    currentUserRole: role,
    departments,
  };
}

async function updateOrganization(orgId, userId, updateData) {
  const role = await orgRepo.getMemberRole(orgId, userId);
  if (!role || !['owner', 'admin'].includes(role)) {
    const error = new Error('Only organization owners and admins can modify organization settings');
    error.statusCode = 403;
    error.code = 'ORG_ADMIN_REQUIRED';
    throw error;
  }

  return orgRepo.updateOrganization(orgId, updateData);
}

async function getMembers(orgId, userId) {
  const role = await orgRepo.getMemberRole(orgId, userId);
  if (!role) {
    const error = new Error('Access denied: You are not a member of this organization');
    error.statusCode = 403;
    error.code = 'WORKSPACE_ACCESS_DENIED';
    throw error;
  }

  return orgRepo.getOrganizationMembers(orgId);
}

async function addMember(orgId, requesterId, { email, role }) {
  const requesterRole = await orgRepo.getMemberRole(orgId, requesterId);
  if (!requesterRole || !['owner', 'admin'].includes(requesterRole)) {
    const error = new Error('Only organization owners and admins can invite or add members');
    error.statusCode = 403;
    error.code = 'ORG_ADMIN_REQUIRED';
    throw error;
  }

  const targetUser = await authRepo.findUserByEmail(email);
  if (!targetUser) {
    const error = new Error(`No user found with email address: ${email}`);
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const existingRole = await orgRepo.getMemberRole(orgId, targetUser.id);
  if (existingRole) {
    const error = new Error('This user is already a member of the organization');
    error.statusCode = 409;
    error.code = 'ALREADY_MEMBER';
    throw error;
  }

  return orgRepo.addOrganizationMember(orgId, targetUser.id, role);
}

async function removeMember(orgId, requesterId, memberId) {
  const requesterRole = await orgRepo.getMemberRole(orgId, requesterId);
  if (!requesterRole || !['owner', 'admin'].includes(requesterRole)) {
    const error = new Error('Only organization owners and admins can remove members');
    error.statusCode = 403;
    error.code = 'ORG_ADMIN_REQUIRED';
    throw error;
  }

  const deleted = await orgRepo.removeOrganizationMember(orgId, memberId);
  if (!deleted) {
    const error = new Error('Member not found in organization');
    error.statusCode = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }
  return { success: true };
}

async function getDepartments(orgId, userId) {
  const role = await orgRepo.getMemberRole(orgId, userId);
  if (!role) {
    const error = new Error('Access denied: You are not a member of this organization');
    error.statusCode = 403;
    error.code = 'WORKSPACE_ACCESS_DENIED';
    throw error;
  }

  return orgRepo.getOrganizationDepartments(orgId);
}

async function createDepartment(orgId, userId, data) {
  const role = await orgRepo.getMemberRole(orgId, userId);
  if (!role || !['owner', 'admin'].includes(role)) {
    const error = new Error('Only organization owners and admins can create departments');
    error.statusCode = 403;
    error.code = 'ORG_ADMIN_REQUIRED';
    throw error;
  }

  return orgRepo.createDepartment(orgId, data);
}

module.exports = {
  createOrganization,
  getOrganization,
  updateOrganization,
  getMembers,
  addMember,
  removeMember,
  getDepartments,
  createDepartment,
};
