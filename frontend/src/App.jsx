import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { EmissionsAnalyticsPage } from './pages/EmissionsAnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { InsightsPage } from './pages/InsightsPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoadingSkeleton } from './components/common/UIComponents';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen bg-surface-ground flex items-center justify-center p-6">
        <div class="w-full max-w-md p-8 bg-white rounded-2xl border border-surface-border shadow-soft space-y-4">
          <div class="w-10 h-10 rounded-full bg-forest-100 animate-pulse mx-auto" />
          <LoadingSkeleton count={3} height="h-6" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="emissions" element={<EmissionsAnalyticsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

