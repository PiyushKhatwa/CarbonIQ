import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  PieChart as PieIcon,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from '../components/common/UIComponents';

export function EmissionsAnalyticsPage() {
  const { activeWorkspace, isOrgWorkspace } = useWorkspace();
  const { refreshKey } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function loadAnalytics() {
      if (!activeWorkspace) return;
      try {
        setLoading(true);
        const [trendRes, breakRes, deptRes] = await Promise.all([
          api.getTrends(12),
          api.getBreakdown(),
          isOrgWorkspace ? api.getDepartmentBreakdown().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);

        setTrends(trendRes.data || []);
        setBreakdown(breakRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [activeWorkspace, isOrgWorkspace, refreshKey]);

  // Export CSV handler
  const handleExportCSV = () => {
    if (breakdown.length === 0) return;
    const headers = ['Category Code', 'Category Name', 'Activity Count', 'Total Quantity', 'Unit', 'Total kg CO2e', 'Percentage Share'];
    const rows = breakdown.map((b) => [
      b.category_code,
      b.category_name,
      b.activity_count,
      b.total_quantity,
      b.unit,
      b.total_co2e_kg,
      `${b.percentageOfTotal}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carboniq_emissions_${activeWorkspace?.name || 'workspace'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSkeleton count={3} height="h-64" />;
  }

  const chartData = trends.map((t) => ({
    period: t.year_month,
    emissions: parseFloat(t.total_co2e_kg),
    activities: parseInt(t.total_activities, 10),
  }));

  const grandTotal = breakdown.reduce((sum, b) => sum + parseFloat(b.total_co2e_kg), 0);

  return (
    <div class="space-y-8">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">Emissions Analytics</h1>
          <p class="text-xs text-charcoal-500 mt-1">
            Aggregated analytical reporting based on PostgreSQL verified views
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
          disabled={breakdown.length === 0}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Main Bar Chart: Monthly Footprint */}
      <Card>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-charcoal-900">Monthly Emissions Volume</h2>
            <p class="text-xs text-charcoal-500">Historical emissions in kilograms of CO2 equivalent</p>
          </div>
          <Badge variant="forest">v_monthly_emissions</Badge>
        </div>

        {chartData.length === 0 ? (
          <EmptyState
            title="No Monthly Records"
            description="Log your emission activities to generate monthly time-series analytics."
          />
        ) : (
          <div class="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#68756E' }} />
                <YAxis tick={{ fontSize: 11, fill: '#68756E' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E4EAE5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="emissions" fill="#176B4D" radius={[6, 6, 0, 0]} name="kg CO2e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Two Column Layout: Detailed Category Breakdown & Department Comparison */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Progress List */}
        <Card>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-charcoal-900">Categorical Footprint Share</h2>
              <p class="text-xs text-charcoal-500">Distribution of emissions by taxonomy category</p>
            </div>
            <span class="text-xs font-bold text-forest-800">
              Total: {grandTotal.toFixed(1)} kg
            </span>
          </div>

          {breakdown.length === 0 ? (
            <EmptyState title="No Category Data Available" />
          ) : (
            <div class="space-y-4">
              {breakdown.map((item) => (
                <div key={item.category_id} class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-charcoal-800">{item.category_name}</span>
                    <span class="text-charcoal-600">
                      <strong>{item.totalCo2eKg.toFixed(1)} kg</strong> ({item.percentageOfTotal}%)
                    </span>
                  </div>
                  <div class="w-full h-2.5 rounded-full bg-surface-ground overflow-hidden border border-surface-border">
                    <div
                      class="h-full bg-forest-700 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, item.percentageOfTotal)}%` }}
                    />
                  </div>
                  <div class="flex justify-between text-[11px] text-charcoal-400">
                    <span>{item.activity_count} activities</span>
                    <span>
                      {item.totalQuantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Department Breakdown (if Org Workspace) or Academic Context Card */}
        {isOrgWorkspace ? (
          <Card>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-base font-bold text-charcoal-900">Departmental Distribution</h2>
                <p class="text-xs text-charcoal-500">Organizational facilities and operational units</p>
              </div>
              <Badge variant="neutral">v_department_emissions</Badge>
            </div>

            {departments.length === 0 ? (
              <EmptyState title="No Departmental Data" description="Assign activities to departments to compare." />
            ) : (
              <div class="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.department_id} class="p-3.5 rounded-xl border border-surface-border bg-surface-ground/50 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        <Building2 class="w-4 h-4" />
                      </div>
                      <div>
                        <span class="block text-xs font-bold text-charcoal-900">
                          {dept.department_name}
                        </span>
                        <span class="block text-[11px] text-charcoal-400">
                          {dept.activity_count} recorded activities
                        </span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="block text-sm font-bold text-forest-800">
                        {parseFloat(dept.total_co2e_kg).toFixed(1)} kg
                      </span>
                      <span class="text-[10px] text-charcoal-400">CO2 equivalent</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-base font-bold text-charcoal-900">Accounting Methodology</h2>
                <p class="text-xs text-charcoal-500">Standards and calculation formulas</p>
              </div>
              <Badge variant="forest">Scope 1 & 2</Badge>
            </div>
            <div class="space-y-3 text-xs text-charcoal-600 leading-relaxed">
              <p>
                CarbonIQ applies activity-based emission accounting in kilograms of CO2 equivalent (kg CO2e) according to:
              </p>
              <div class="p-3 rounded-lg bg-surface-ground border border-surface-border font-mono text-[11px] text-forest-900">
                emissions_kg_co2e = quantity &times; factor_value
              </div>
              <p>
                Factors are retrieved from official government sources (Central Electricity Authority User Guide v19, UK DEFRA 2023, and US EPA Hub) and are frozen immutably with every activity write to preserve reproducible audits.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

