import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  Plus,
  Building2,
  User,
  Check,
  PlusCircle,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Button } from '../common/UIComponents';

export function TopBar({ onMenuClick, onOpenAddActivity, onOpenCreateOrg }) {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header class="h-16 bg-white border-b border-surface-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          class="p-2 text-charcoal-600 hover:text-charcoal-900 hover:bg-surface-ground rounded-lg lg:hidden"
        >
          <Menu class="w-5 h-5" />
        </button>

        {/* Workspace Switcher Dropdown */}
        <div class="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-surface-border bg-surface-ground hover:bg-white transition-colors text-left text-xs font-semibold text-charcoal-800"
          >
            {activeWorkspace?.type === 'organization' ? (
              <Building2 class="w-4 h-4 text-purple-700" />
            ) : (
              <User class="w-4 h-4 text-forest-700" />
            )}
            <span class="max-w-[140px] md:max-w-[200px] truncate">
              {activeWorkspace?.name || 'Workspace'}
            </span>
            <ChevronDown class="w-3.5 h-3.5 text-charcoal-400" />
          </button>

          {dropdownOpen && (
            <div class="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-surface-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                Personal Workspace
              </div>
              {workspaces.personal && (
                <button
                  onClick={() => {
                    switchWorkspace(workspaces.personal);
                    setDropdownOpen(false);
                  }}
                  class="w-full px-3 py-2 text-xs flex items-center justify-between text-left text-charcoal-800 hover:bg-forest-50 transition-colors"
                >
                  <div class="flex items-center gap-2 truncate">
                    <User class="w-3.5 h-3.5 text-forest-700" />
                    <span class="truncate">{workspaces.personal.name}</span>
                  </div>
                  {activeWorkspace?.type === 'personal' && (
                    <Check class="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                  )}
                </button>
              )}

              <div class="border-t border-surface-border my-1.5" />

              <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 flex items-center justify-between">
                <span>Organizations</span>
                <span class="text-[9px] bg-charcoal-100 px-1.5 py-0.2 rounded font-mono">
                  {workspaces.organizations.length}
                </span>
              </div>

              {workspaces.organizations.length === 0 ? (
                <div class="px-3 py-2 text-xs text-charcoal-400 italic">No organizations joined</div>
              ) : (
                workspaces.organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchWorkspace(org);
                      setDropdownOpen(false);
                    }}
                    class="w-full px-3 py-2 text-xs flex items-center justify-between text-left text-charcoal-800 hover:bg-forest-50 transition-colors"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <Building2 class="w-3.5 h-3.5 text-purple-700" />
                      <span class="truncate">{org.name}</span>
                    </div>
                    {activeWorkspace?.id === org.id && (
                      <Check class="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}

              <div class="border-t border-surface-border my-1.5" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenCreateOrg();
                }}
                class="w-full px-3 py-2 text-xs flex items-center gap-2 text-forest-700 hover:bg-forest-50 font-semibold transition-colors"
              >
                <PlusCircle class="w-3.5 h-3.5" />
                <span>Create Organization...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Add Activity Button */}
      <div class="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenAddActivity}
          className="shadow-sm font-semibold"
        >
          Add Activity
        </Button>
      </div>
    </header>
  );
}

