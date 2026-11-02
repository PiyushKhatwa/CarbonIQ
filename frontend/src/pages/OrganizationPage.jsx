import React, { useState, useEffect } from 'react';
import { Building2, Users, Layers, Plus, Mail, Shield, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Button, Badge, Input, Select, LoadingSkeleton, AlertBanner, EmptyState } from '../components/common/UIComponents';

export function OrganizationPage() {
  const { isOrgWorkspace, activeWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Forms
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);

  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [addingDept, setAddingDept] = useState(false);

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadOrgData = async () => {
    if (!isOrgWorkspace || !activeWorkspace?.id) return;
    try {
      setLoading(true);
      setError(null);
      const [orgRes, memRes, deptRes] = await Promise.all([
        api.getOrganization(activeWorkspace.id),
        api.getOrgMembers(activeWorkspace.id),
        api.getOrgDepartments(activeWorkspace.id),
      ]);
      setOrg(orgRes.data);
      setMembers(memRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, [isOrgWorkspace, activeWorkspace]);

  if (!isOrgWorkspace) {
    return (
      <EmptyState
        icon={Building2}
        title="Personal Workspace Active"
        description="To access organizational members, departments, and facility breakdown, switch to an organization workspace using the top navigation dropdown."
      />
    );
  }

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail) return;
    try {
      setAddingMember(true);
      setError(null);
      await api.addOrgMember(activeWorkspace.id, addMemberEmail.trim(), addMemberRole);
      setSuccessMsg(`Member ${addMemberEmail} added successfully`);
      setAddMemberEmail('');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadOrgData();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptName) return;
    try {
      setAddingDept(true);
      setError(null);
      await api.createOrgDepartment(activeWorkspace.id, {
        name: deptName.trim(),
        code: deptCode.trim() || null,
      });
      setSuccessMsg(`Department '${deptName}' created successfully`);
      setDeptName('');
      setDeptCode('');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadOrgData();
    } catch (err) {
      setError(err.message || 'Failed to create department');
    } finally {
      setAddingDept(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-44" />;
  }

  const canManage = ['owner', 'admin'].includes(org?.currentUserRole);

  return (
    <div class="space-y-8">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">{org?.name}</h1>
            <Badge variant="purple" className="capitalize">
              Your Role: {org?.currentUserRole}
            </Badge>
          </div>
          <p class="text-xs text-charcoal-500 mt-1">
            Sector: {org?.industry || 'General'} &bull; Country: {org?.country} &bull; Identifier:{' '}
            <span class="font-mono text-charcoal-700">{org?.slug}</span>
          </p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      {/* Two Column Layout: Members & Departments */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Management Card */}
        <Card className="space-y-5">
          <div class="flex items-center justify-between border-b border-surface-border pb-3">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-purple-700" />
              <h3 class="font-bold text-sm text-charcoal-900">Team Members ({members.length})</h3>
            </div>
          </div>

          {/* Add Member Form (Admins only) */}
          {canManage && (
            <form onSubmit={handleAddMember} class="flex gap-2">
              <div class="flex-1">
                <Input
                  placeholder="user@domain.com"
                  type="email"
                  value={addMemberEmail}
                  onChange={(e) => setAddMemberEmail(e.target.value)}
                  required
                />
              </div>
              <div class="w-32">
                <select
                  value={addMemberRole}
                  onChange={(e) => setAddMemberRole(e.target.value)}
                  class="w-full text-xs px-2.5 py-2 rounded-lg border border-surface-border bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <Button variant="primary" size="md" type="submit" loading={addingMember}>
                Add
              </Button>
            </form>
          )}

          {/* Member List */}
          <div class="divide-y divide-surface-border">
            {members.map((m) => (
              <div key={m.membership_id} class="py-3 flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-charcoal-900 block">{m.full_name}</span>
                  <span class="text-charcoal-500 text-[11px]">{m.email}</span>
                </div>
                <Badge variant={m.role === 'owner' ? 'forest' : 'neutral'} className="capitalize">
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Departments Management Card */}
        <Card className="space-y-5">
          <div class="flex items-center justify-between border-b border-surface-border pb-3">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-forest-700" />
              <h3 class="font-bold text-sm text-charcoal-900">
                Departments & Facilities ({departments.length})
              </h3>
            </div>
          </div>

          {/* Add Department Form (Admins only) */}
          {canManage && (
            <form onSubmit={handleCreateDepartment} class="grid grid-cols-5 gap-2">
              <div class="col-span-3">
                <Input
                  placeholder="Department Name (e.g. Server Farm)"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                />
              </div>
              <div class="col-span-2 flex gap-2">
                <Input
                  placeholder="Code (ENG)"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                />
                <Button variant="primary" size="md" type="submit" loading={addingDept}>
                  Add
                </Button>
              </div>
            </form>
          )}

          {/* Department List */}
          {departments.length === 0 ? (
            <p class="text-xs text-charcoal-400 italic py-4">No departments created yet.</p>
          ) : (
            <div class="divide-y divide-surface-border">
              {departments.map((dept) => (
                <div key={dept.id} class="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-charcoal-900 block">{dept.name}</span>
                    {dept.description && (
                      <span class="text-charcoal-500 text-[11px] block">{dept.description}</span>
                    )}
                  </div>
                  {dept.code && <Badge variant="neutral">{dept.code}</Badge>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

