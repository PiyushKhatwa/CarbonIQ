import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from '../components/common/UIComponents';

const CATEGORY_COLORS = {
  electricity: '#176B4D',
  transportation: '#3B82F6',
  fuel: '#F59E0B',
  lpg: '#EC4899',
  waste: '#8B5CF6',
};

export function DashboardPage() {
  const { activeWorkspace, isOrgWorkspace } = useWorkspace();
  const { refreshKey, triggerRefresh } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topRecommendation, setTopRecommendation] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!activeWorkspace) return;
      try {
        setLoading(true);

        const [sumRes, trendRes, breakRes, actRes, recRes] = await Promise.all([
          api.getSummary().catch(() => ({ data: null })),
          api.getTrends(6).catch(() => ({ data: [] })),
          api.getBreakdown().catch(() => ({ data: [] })),
          api.listActivities({ limit: 5 }).catch(() => ({ data: [] })),
          api.listRecommendations().catch(() => ({ data: [] })),
        ]);

        setSummary(sumRes.data);
        setTrends(trendRes.data || []);
        setBreakdown(breakRes.data || []);
        setRecentActivities(actRes.data || []);
        if (recRes.data && recRes.data.length > 0) {
          setTopRecommendation(recRes.data[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [activeWorkspace, refreshKey]);

  if (loading) {
    return (
      <div class="space-y-6">
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-72" />
      </div>
    );
  }

  const currentTotal = summary?.currentPeriod?.totalCo2eKg || 0;
  const pctChange = summary?.percentageChange || 0;
  const isIncrease = pctChange > 0;

  // Chart data formatting
  const trendChartData = trends.map((t) => ({
    name: t.year_month,
    emissions: parseFloat(t.total_co2e_kg),
    activities: parseInt(t.total_activities, 10),
  }));

  const pieChartData = breakdown.map((b) => ({
    name: b.category_name,
    value: parseFloat(b.total_co2e_kg),
    code: b.category_code,
  }));

  return (
    <div class="space-y-8">
      {/* Top Banner / Workspace Context */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">
            Emissions Executive Overview
          </h1>
          <p class="text-xs text-charcoal-500 mt-1">
            Active Workspace:{' '}
            <span class="font-semibold text-charcoal-800">
              {activeWorkspace?.name || 'Personal'}
            </span>{' '}
            &bull; Deterministic 30-day accounting window
          </p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Footprint */}
        <Card>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase text-charcoal-400 tracking-wider">
              Total Footprint
            </span>
            <div class="w-8 h-8 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center">
              <Zap class="w-4 h-4" />
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-charcoal-900">
              {currentTotal.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span class="text-xs font-semibold text-charcoal-500">kg CO2e</span>
          </div>
          <div class="mt-3 flex items-center gap-1.5 text-xs">
            {pctChange !== 0 ? (
              <>
                {isIncrease ? (
                  <TrendingUp class="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <TrendingDown class="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span
                  class={`font-semibold ${
                    isIncrease ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {isIncrease ? `+${pctChange}%` : `${pctChange}%`}
                </span>
                <span class="text-charcoal-400">vs prior period</span>
              </>
            ) : (
              <span class="text-charcoal-400">Baseline established</span>
            )}
          </div>
        </Card>

        {/* Metric 2: Logged Activities */}
        <Card>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase text-charcoal-400 tracking-wider">
              Recorded Entries
            </span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Activity class="w-4 h-4" />
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-charcoal-900">
              {summary?.currentPeriod?.activityCount || 0}
            </span>
            <span class="text-xs font-semibold text-charcoal-500">activities</span>
          </div>
          <p class="text-xs text-charcoal-400 mt-3 truncate">
            {isOrgWorkspace ? 'Assigned across departments' : 'Personal ledger entries'}
          </p>
        </Card>

        {/* Metric 3: Leading Category */}
        <Card>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase text-charcoal-400 tracking-wider">
              Leading Category
            </span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Target class="w-4 h-4" />
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-bold text-charcoal-900 truncate">
              {breakdown.length > 0 ? breakdown[0].category_name : 'None'}
            </span>
          </div>
          <p class="text-xs text-charcoal-400 mt-3">
            {breakdown.length > 0
              ? `${breakdown[0].percentageOfTotal}% of total emissions`
              : 'Record activity to analyze'}
          </p>
        </Card>

        {/* Metric 4: Reduction Goal Progress */}
        <Card>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase text-charcoal-400 tracking-wider">
              Active Strategy
            </span>
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles class="w-4 h-4" />
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-bold text-charcoal-900 truncate">
              On Track
            </span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-charcoal-500">
            <span>Reduction target</span>
            <Link to="/app/goals" class="text-forest-700 font-semibold hover:underline">
              View Goals &rarr;
            </Link>
          </div>
        </Card>
      </div>

      {/* Top AI Insight Banner Card */}
      {topRecommendation && (
        <div class="p-5 rounded-2xl bg-gradient-to-r from-forest-50 via-white to-forest-50 border border-forest-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <Badge variant="forest">Actionable Reduction Insight</Badge>
                <span class="text-xs font-semibold text-charcoal-400">
                  {topRecommendation.supporting_metric}
                </span>
              </div>
              <h3 class="text-sm font-bold text-charcoal-900 mt-1">
                {topRecommendation.title}
              </h3>
              <p class="text-xs text-charcoal-600 mt-0.5 max-w-2xl">
                {topRecommendation.action_text}
              </p>
            </div>
          </div>
          <Link to="/app/insights" class="flex-shrink-0">
            <Button variant="mint" size="sm" icon={ArrowRight}>
              All Insights
            </Button>
          </Link>
        </div>
      )}

      {/* Interactive Charts Row */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-charcoal-900">Emissions Trajectory</h2>
              <p class="text-xs text-charcoal-500">Monthly aggregate footprint (kg CO2e)</p>
            </div>
            <Badge variant="neutral">Verified SQL View</Badge>
          </div>

          {trendChartData.length === 0 ? (
            <EmptyState
              title="No Monthly Data Yet"
              description="Record your monthly activities to generate time-series trend curves."
            />
          ) : (
            <div class="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#176B4D" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#176B4D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#68756E' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#68756E' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E4EAE5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="emissions"
                    stroke="#176B4D"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forestGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Category Breakdown Donut Chart (1 col) */}
        <Card>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-charcoal-900">Category Share</h2>
              <p class="text-xs text-charcoal-500">Distribution across sources</p>
            </div>
          </div>

          {pieChartData.length === 0 ? (
            <EmptyState
              title="No Category Data"
              description="Add entries to see categorical emission ratios."
            />
          ) : (
            <div class="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.code}`}
                        fill={CATEGORY_COLORS[entry.code] || '#176B4D'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E4EAE5',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div class="flex flex-wrap justify-center gap-2 mt-2">
                {pieChartData.map((entry) => (
                  <div key={entry.code} class="flex items-center gap-1.5 text-[11px] text-charcoal-600">
                    <span
                      class="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.code] || '#176B4D' }}
                    />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activities Feed */}
      <Card>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-charcoal-900">Recent Activities</h2>
            <p class="text-xs text-charcoal-500">Latest recorded events and deterministic calculations</p>
          </div>
          <Link to="/app/activities">
            <Button variant="ghost" size="sm" icon={ArrowRight}>
              View All History
            </Button>
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <EmptyState
            title="No Recent Activity"
            description="Your activity stream is clean. Record an activity to see emissions calculated."
          />
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-surface-border text-charcoal-400 uppercase tracking-wider font-semibold">
                  <th class="py-3 px-3">Date</th>
                  <th class="py-3 px-3">Category</th>
                  <th class="py-3 px-3">Activity Type</th>
                  <th class="py-3 px-3">Quantity</th>
                  <th class="py-3 px-3 text-right">Calculated CO2e</th>
                  <th class="py-3 px-3">Factor Snapshot</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border">
                {recentActivities.map((act) => (
                  <tr key={act.activity_id} class="hover:bg-surface-ground/60 transition-colors">
                    <td class="py-3 px-3 font-medium text-charcoal-800">{act.activity_date}</td>
                    <td class="py-3 px-3">
                      <Badge variant="forest">{act.category_name}</Badge>
                    </td>
                    <td class="py-3 px-3 text-charcoal-900 font-semibold">{act.activity_type_name}</td>
                    <td class="py-3 px-3 text-charcoal-600">
                      {parseFloat(act.quantity)} {act.unit}
                    </td>
                    <td class="py-3 px-3 text-right font-bold text-forest-800">
                      {parseFloat(act.calculated_co2e_kg).toFixed(2)} kg
                    </td>
                    <td class="py-3 px-3 text-charcoal-400 truncate max-w-[150px]">
                      {act.factor_source_snapshot}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

