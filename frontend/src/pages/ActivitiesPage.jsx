import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  Filter,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Button, Badge, Select, LoadingSkeleton, EmptyState, AlertBanner } from '../components/common/UIComponents';

export function ActivitiesPage() {
  const { activeWorkspace, isOrgWorkspace } = useWorkspace();
  const { refreshKey, triggerRefresh } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, totalItems: 0 });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // Load categories for filter
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await api.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCats();
  }, []);

  // Fetch activities
  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 15,
      };
      if (selectedCategory) params.categoryCode = selectedCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.listActivities(params);
      setActivities(res.data);
      if (res.meta?.pagination) {
        setPagination(res.meta.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [activeWorkspace, selectedCategory, startDate, endDate, refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity record and its associated emission calculation?')) {
      return;
    }

    try {
      setDeletingId(id);
      await api.deleteActivity(id);
      triggerRefresh();
      fetchActivities(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete activity');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div class="space-y-6">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">Activity Ledger</h1>
          <p class="text-xs text-charcoal-500 mt-1">
            Complete verifiable audit log of emission-generating activities in{' '}
            <span class="font-semibold text-charcoal-800">{activeWorkspace?.name || 'Personal'}</span>
          </p>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label class="block text-xs font-semibold text-charcoal-600 mb-1">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              class="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-charcoal-600 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              class="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-charcoal-600 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              class="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                setSelectedCategory('');
                setStartDate('');
                setEndDate('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Activities Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div class="p-6">
            <LoadingSkeleton count={5} height="h-12" />
          </div>
        ) : activities.length === 0 ? (
          <div class="p-8">
            <EmptyState
              title="No Activities Found"
              description="No emission activities match your selected filters. Record an activity to see it here."
            />
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-surface-border bg-surface-ground/70 text-charcoal-400 uppercase tracking-wider font-semibold">
                  <th class="py-3.5 px-4">Date</th>
                  <th class="py-3.5 px-4">Category</th>
                  <th class="py-3.5 px-4">Activity Description</th>
                  {isOrgWorkspace && <th class="py-3.5 px-4">Department</th>}
                  <th class="py-3.5 px-4">Quantity</th>
                  <th class="py-3.5 px-4 text-right">Calculated CO2e</th>
                  <th class="py-3.5 px-4">Factor Provenance</th>
                  <th class="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border">
                {activities.map((act) => (
                  <tr key={act.activity_id} class="hover:bg-surface-ground/60 transition-colors">
                    <td class="py-3.5 px-4 font-medium text-charcoal-800 whitespace-nowrap">
                      {act.activity_date}
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="forest">{act.category_name}</Badge>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-charcoal-900">
                      <div>{act.activity_type_name}</div>
                      {act.notes && (
                        <div class="text-[11px] font-normal text-charcoal-400 mt-0.5 truncate max-w-xs">
                          {act.notes}
                        </div>
                      )}
                    </td>
                    {isOrgWorkspace && (
                      <td class="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                        {act.department_name ? (
                          <span class="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-medium">
                            {act.department_name}
                          </span>
                        ) : (
                          <span class="text-charcoal-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td class="py-3.5 px-4 text-charcoal-700 font-medium whitespace-nowrap">
                      {parseFloat(act.quantity)} {act.unit}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <span class="font-bold text-forest-800 text-sm">
                        {parseFloat(act.calculated_co2e_kg).toFixed(2)}
                      </span>
                      <span class="text-[10px] uppercase font-bold text-charcoal-400 ml-1">
                        kg
                      </span>
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <div class="text-charcoal-700 font-medium">
                        {act.emission_factor_snapshot} kg/{act.unit}
                      </div>
                      <div class="text-[10px] text-charcoal-400 truncate max-w-[160px]">
                        {act.factor_source_snapshot}
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(act.activity_id)}
                        disabled={deletingId === act.activity_id}
                        class="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div class="px-4 py-3 border-t border-surface-border bg-surface-ground/40 flex items-center justify-between text-xs text-charcoal-600">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} entries)
            </span>
            <div class="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => fetchActivities(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => fetchActivities(pagination.page + 1)}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

