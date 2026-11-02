import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import api from '../../services/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Button, Input, Select, AlertBanner } from '../common/UIComponents';

export function CreateOrgModal({ isOpen, onClose }) {
  const { refreshWorkspaces, switchWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('India');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.createOrganization({
        name: name.trim(),
        industry: industry || null,
        country: country || 'India',
        description: description || null,
      });

      await refreshWorkspaces();
      switchWorkspace({
        type: 'organization',
        id: res.data.id,
        name: res.data.name,
        memberRole: 'owner',
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-2xl shadow-dropdown border border-surface-border w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-base font-bold text-charcoal-900">New Organization</h2>
              <p class="text-xs text-charcoal-500">Enable multi-user organizational tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-surface-ground transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} class="p-6 space-y-4">
          {error && <AlertBanner type="error" message={error} />}

          <Input
            label="Organization Name"
            placeholder="e.g. Acme Sustainable Energy Pvt Ltd"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div class="grid grid-cols-2 gap-3">
            <Input
              label="Industry / Sector"
              placeholder="e.g. Information Tech"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <Input
            label="Description (Optional)"
            placeholder="Brief scope of organizational tracking"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div class="pt-2 flex items-center justify-end gap-3 border-t border-surface-border">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create Organization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

