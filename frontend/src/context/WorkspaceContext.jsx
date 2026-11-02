import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState({ personal: null, organizations: [] });
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch workspaces when user logs in or changes
  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces({ personal: null, organizations: [] });
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getWorkspaces();
      const wsData = res.data;
      setWorkspaces(wsData);

      // Check if there is a saved workspace in storage
      const saved = JSON.parse(localStorage.getItem('carboniq_workspace') || 'null');
      let target = null;

      if (saved) {
        if (saved.type === 'personal') {
          target = wsData.personal;
        } else if (saved.type === 'organization') {
          target = wsData.organizations.find((o) => o.id === saved.id) || null;
        }
      }

      // Default fallback
      if (!target) {
        if (user.default_workspace_type === 'organization' && wsData.organizations.length > 0) {
          target = wsData.organizations[0];
        } else {
          target = wsData.personal;
        }
      }

      setActiveWorkspace(target);
      api.setWorkspace(target);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    api.setWorkspace(workspace);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        switchWorkspace,
        refreshWorkspaces: fetchWorkspaces,
        isOrgWorkspace: activeWorkspace?.type === 'organization',
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
}

