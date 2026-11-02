const workspacesRepo = require('./workspaces.repository');

async function getAvailableWorkspaces(user) {
  const orgs = await workspacesRepo.getUserOrganizations(user.id);

  return {
    personal: {
      type: 'personal',
      id: user.id,
      name: `${user.full_name}'s Personal Workspace`,
      isDefault: user.default_workspace_type === 'personal',
    },
    organizations: orgs.map((org) => ({
      type: 'organization',
      id: org.id,
      name: org.name,
      slug: org.slug,
      industry: org.industry,
      country: org.country,
      memberRole: org.member_role,
      joinedAt: org.joined_at,
      totalMembers: parseInt(org.total_members, 10),
      totalDepartments: parseInt(org.total_departments, 10),
      isDefault: user.default_workspace_type === 'organization',
    })),
  };
}

module.exports = {
  getAvailableWorkspaces,
};

