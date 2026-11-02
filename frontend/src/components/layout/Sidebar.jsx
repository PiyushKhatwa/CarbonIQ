import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Target,
  Sparkles,
  Building2,
  Settings,
  LogOut,
  Leaf,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { activeWorkspace, isOrgWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/app', icon: LayoutDashboard },
    { name: 'Activities', path: '/app/activities', icon: Activity },
    { name: 'Analytics', path: '/app/emissions', icon: BarChart3 },
    { name: 'Goals', path: '/app/goals', icon: Target },
    { name: 'AI Insights', path: '/app/insights', icon: Sparkles },
    ...(isOrgWorkspace
      ? [{ name: 'Organization', path: '/app/organization', icon: Building2 }]
      : []),
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          class="fixed inset-0 z-40 bg-charcoal-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        class={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-surface-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div class="h-16 flex items-center px-6 border-b border-surface-border gap-3">
          <div class="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm">
            <Leaf class="w-5 h-5" />
          </div>
          <div>
            <span class="text-lg font-bold tracking-tight text-charcoal-900 block leading-tight">
              Carbon<span class="text-forest-700">IQ</span>
            </span>
            <span class="text-[10px] uppercase font-semibold text-charcoal-400 tracking-wider">
              Footprint Tracker
            </span>
          </div>
        </div>

        {/* Current Active Workspace Indicator Pill */}
        <div class="p-4 border-b border-surface-border">
          <div class="bg-surface-ground p-2.5 rounded-lg border border-surface-border flex items-center gap-2.5">
            <div
              class={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${
                isOrgWorkspace
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-forest-100 text-forest-800'
              }`}
            >
              {isOrgWorkspace ? <Building2 class="w-4 h-4" /> : <Layers class="w-4 h-4" />}
            </div>
            <div class="overflow-hidden">
              <span class="block text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold">
                Active Workspace
              </span>
              <span class="block text-xs font-bold text-charcoal-800 truncate">
                {activeWorkspace?.name || 'Personal'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              onClick={onClose}
              class={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-700 font-semibold'
                    : 'text-charcoal-600 hover:bg-surface-ground hover:text-charcoal-900'
                }`
              }
            >
              <item.icon class="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer Profile */}
        <div class="p-4 border-t border-surface-border bg-surface-ground/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div class="overflow-hidden">
                <span class="block text-xs font-semibold text-charcoal-900 truncate">
                  {user?.full_name || 'User'}
                </span>
                <span class="block text-[11px] text-charcoal-500 truncate">
                  {user?.email || ''}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              class="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

