import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/common/UIComponents';

export function LandingPage() {
  return (
    <div class="min-h-screen bg-surface-ground text-charcoal-900 flex flex-col">
      {/* Navigation Header */}
      <header class="h-20 border-b border-surface-border bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm">
            <Leaf class="w-5 h-5" />
          </div>
          <span class="text-xl font-bold tracking-tight">
            Carbon<span class="text-forest-700">IQ</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <Link to="/login">
            <Button variant="secondary" size="md">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="md" icon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main class="flex-1">
        <section class="max-w-6xl mx-auto px-6 py-20 lg:py-28 text-center">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles class="w-3.5 h-3.5" />
            <span>AI-Assisted &bull; Deterministic &bull; ADBMS Verified</span>
          </div>

          <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.15] max-w-4xl mx-auto mb-6">
            Track, Analyze & Cut Carbon Footprint with{' '}
            <span class="text-forest-700 underline decoration-forest-200 underline-offset-8">
              Verified Precision
            </span>
          </h1>

          <p class="text-base md:text-xl text-charcoal-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            CarbonIQ empowers individuals and organizations to measure greenhouse-gas emissions
            using official CEA, UK DEFRA, and US EPA emission factors with ACID-guaranteed database
            integrity.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/register" class="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Launch Workspace
              </Button>
            </Link>
            <Link to="/login" class="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Demo Account
              </Button>
            </Link>
          </div>

          {/* Value Highlights Pill Grid */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto text-left">
            <div class="p-5 rounded-2xl bg-white border border-surface-border shadow-soft">
              <Database class="w-6 h-6 text-forest-700 mb-3" />
              <h4 class="font-bold text-sm text-charcoal-900">PostgreSQL ACID Engine</h4>
              <p class="text-xs text-charcoal-500 mt-1">
                Zero data drift; atomic transactions freeze historical factor snapshots.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-surface-border shadow-soft">
              <ShieldCheck class="w-6 h-6 text-emerald-600 mb-3" />
              <h4 class="font-bold text-sm text-charcoal-900">Documented Provenance</h4>
              <p class="text-xs text-charcoal-500 mt-1">
                Central Electricity Authority, DEFRA & EPA traceable conversion factors.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-surface-border shadow-soft">
              <Layers class="w-6 h-6 text-purple-600 mb-3" />
              <h4 class="font-bold text-sm text-charcoal-900">Dual-Workspace Scoping</h4>
              <p class="text-xs text-charcoal-500 mt-1">
                Strict multi-tenant isolation between personal and enterprise footprints.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-surface-border shadow-soft">
              <Sparkles class="w-6 h-6 text-amber-600 mb-3" />
              <h4 class="font-bold text-sm text-charcoal-900">Explainable AI Insights</h4>
              <p class="text-xs text-charcoal-500 mt-1">
                Contextual reduction plans with 100% offline rule-based fallback.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer class="border-t border-surface-border bg-white py-8 px-6 text-center text-xs text-charcoal-400">
        <p>CarbonIQ &mdash; Advanced Database Management Systems (ADBMS) Capstone Project &bull; Local-First Architecture</p>
      </footer>
    </div>
  );
}

