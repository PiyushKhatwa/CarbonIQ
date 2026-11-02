import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select, AlertBanner } from '../components/common/UIComponents';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceType, setWorkspaceType] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    try {
      setLoading(true);
      setError(null);
      await register(fullName, email, password, workspaceType);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-surface-ground flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" class="inline-flex items-center gap-2.5 mb-4">
          <div class="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm">
            <Leaf class="w-5 h-5" />
          </div>
          <span class="text-2xl font-bold tracking-tight text-charcoal-900">
            Carbon<span class="text-forest-700">IQ</span>
          </span>
        </Link>
        <h2 class="text-xl font-bold text-charcoal-900">Create CarbonIQ Account</h2>
        <p class="text-xs text-charcoal-500 mt-1">
          Begin tracking with deterministic activity-based carbon accounting
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-surface-border shadow-card space-y-6">
          {error && <AlertBanner type="error" message={error} />}

          <form onSubmit={handleSubmit} class="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Elena Rostova"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="elena@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Select
              label="Primary Tracking Purpose"
              value={workspaceType}
              onChange={(e) => setWorkspaceType(e.target.value)}
            >
              <option value="personal">Personal Household / Commute Tracking</option>
              <option value="organization">Company / Organizational Emissions</option>
            </Select>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
              icon={UserPlus}
            >
              Create Account
            </Button>
          </form>

          <div class="text-center text-xs text-charcoal-500 pt-2 border-t border-surface-border">
            Already have an account?{' '}
            <Link to="/login" class="text-forest-700 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

