import React, { useState } from 'react';
import { User, Database, Shield, Check, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, Button, Input, Select, Badge, AlertBanner } from '../components/common/UIComponents';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [defaultWorkspaceType, setDefaultWorkspaceType] = useState(
    user?.default_workspace_type || 'personal'
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await api.updateMe({
        fullName: fullName.trim(),
        defaultWorkspaceType,
      });
      updateUser(res.data);
      setSuccessMsg('Profile preferences updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div class="space-y-8 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">Settings & Preferences</h1>
        <p class="text-xs text-charcoal-500 mt-1">Manage profile information and system defaults</p>
      </div>

      {error && <AlertBanner type="error" message={error} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      {/* User Profile Form */}
      <Card>
        <div class="flex items-center gap-3 border-b border-surface-border pb-4 mb-5">
          <div class="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
            <User class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-charcoal-900">User Profile</h2>
            <p class="text-xs text-charcoal-500">Account identity and default launch workspace</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} class="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={user?.email || ''}
            disabled
            helperText="Email cannot be changed directly in this release."
          />

          <Select
            label="Default Launch Workspace"
            value={defaultWorkspaceType}
            onChange={(e) => setDefaultWorkspaceType(e.target.value)}
          >
            <option value="personal">Personal Household Workspace</option>
            <option value="organization">Organization Workspace</option>
          </Select>

          <div class="pt-2 flex justify-end">
            <Button variant="primary" size="md" type="submit" loading={saving}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Database & Academic Information Card */}
      <Card>
        <div class="flex items-center gap-3 border-b border-surface-border pb-4 mb-4">
          <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Database class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-charcoal-900">Database & System Health</h2>
            <p class="text-xs text-charcoal-500">ADBMS evaluation parameters and connectivity</p>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between p-3 rounded-lg bg-surface-ground border border-surface-border">
            <span class="font-semibold text-charcoal-700">Connected Database:</span>
            <Badge variant="forest">PostgreSQL 18 &bull; carboniq_db</Badge>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-surface-ground border border-surface-border">
            <span class="font-semibold text-charcoal-700">Relational Normalization:</span>
            <Badge variant="neutral">1NF, 2NF, 3NF Verified</Badge>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-surface-ground border border-surface-border">
            <span class="font-semibold text-charcoal-700">Audit Logging Triggers:</span>
            <span class="text-emerald-700 font-bold flex items-center gap-1">
              <Check class="w-3.5 h-3.5" /> Active (audit_logs table)
            </span>
          </div>
        </div>
      </Card>

      {/* Session Controls */}
      <Card>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-charcoal-900">Sign Out of Session</h3>
            <p class="text-xs text-charcoal-500">Clears JWT token from local browser storage</p>
          </div>
          <Button variant="danger" size="sm" icon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

