import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AddActivityModal } from '../activities/AddActivityModal';
import { CreateOrgModal } from '../organizations/CreateOrgModal';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActivitySuccess = () => {
    // Trigger global refresh across pages
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div class="min-h-screen bg-surface-ground flex">
      {/* Responsive Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Body */}
      <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onOpenAddActivity={() => setAddActivityOpen(true)}
          onOpenCreateOrg={() => setCreateOrgOpen(true)}
        />

        <main class="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshKey, triggerRefresh: handleActivitySuccess }} />
        </main>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        onSuccess={handleActivitySuccess}
      />

      {/* Create Organization Modal */}
      <CreateOrgModal
        isOpen={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
      />
    </div>
  );
}

