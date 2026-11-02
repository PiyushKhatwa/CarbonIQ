import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, AlertBanner } from '../components/common/UIComponents';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
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
        <h2 class="text-xl font-bold text-charcoal-900">Welcome Back</h2>
        <p class="text-xs text-charcoal-500 mt-1">Sign in to manage and analyze carbon emissions</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-surface-border shadow-card space-y-6">
          {error && <AlertBanner type="error" message={error} />}

          <form onSubmit={handleSubmit} class="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Fill Demo Pills */}
          <div class="pt-4 border-t border-surface-border">
            <div class="flex items-center gap-1.5 text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2.5">
              <Sparkles class="w-3.5 h-3.5 text-forest-700" />
              <span>Quick Fill Seed Accounts</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('demo.individual@carboniq.local')}
                class="p-2 text-left rounded-lg border border-surface-border bg-surface-ground hover:bg-forest-50 hover:border-forest-200 text-xs transition-colors"
              >
                <span class="font-bold block text-charcoal-800">Piyush (Individual)</span>
                <span class="text-[10px] text-charcoal-400 block truncate">demo.individual</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('demo.admin@carboniq.local')}
                class="p-2 text-left rounded-lg border border-surface-border bg-surface-ground hover:bg-purple-50 hover:border-purple-200 text-xs transition-colors"
              >
                <span class="font-bold block text-charcoal-800">Aarav (Org Owner)</span>
                <span class="text-[10px] text-charcoal-400 block truncate">demo.admin</span>
              </button>
            </div>
          </div>

          <div class="text-center text-xs text-charcoal-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" class="text-forest-700 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

