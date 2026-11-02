import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Zap,
  Car,
  Flame,
  Container,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Button, Badge, LoadingSkeleton, EmptyState, AlertBanner } from '../components/common/UIComponents';

const CATEGORY_ICONS = {
  electricity: Zap,
  transportation: Car,
  fuel: Flame,
  lpg: Container,
  waste: Trash2,
};

export function InsightsPage() {
  const { activeWorkspace } = useWorkspace();
  const { refreshKey } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchRecs = async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.listRecommendations();
      setRecommendations(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [activeWorkspace, refreshKey]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await api.refreshRecommendations();
      setSuccessMsg(res.data.message || 'Recommendations refreshed');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchRecs();
    } catch (err) {
      setError(err.message || 'Failed to refresh recommendations');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateRecommendationStatus(id, status);
      fetchRecs();
    } catch (err) {
      setError(err.message || 'Failed to update recommendation status');
    }
  };

  return (
    <div class="space-y-8">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">AI Insights & Advisory</h1>
          <p class="text-xs text-charcoal-500 mt-1">
            Data-driven reduction actions derived from actual calculated footprints in{' '}
            <span class="font-semibold text-charcoal-800">{activeWorkspace?.name || 'Personal'}</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={RefreshCw}
          loading={refreshing}
          onClick={handleRefresh}
        >
          Refresh Insights
        </Button>
      </div>

      {error && <AlertBanner type="error" message={error} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      {/* Advisory Banner */}
      <div class="p-4 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-start gap-3">
        <Sparkles class="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Methodology Transparency:</strong> Recommendations are advisory and correlate directly with verified activities recorded in PostgreSQL. In Phase 5, this engine connects to external Gemini models with an automatic offline fallback.
        </p>
      </div>

      {/* Recommendations Cards List */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No Active Insights Available"
          description="Log more emission activities or click 'Refresh Insights' to analyze your footprint."
          actionText="Analyze Footprint"
          onAction={handleRefresh}
        />
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const IconComponent = CATEGORY_ICONS[rec.category_code] || Lightbulb;
            const priorityVariant =
              rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'neutral';

            return (
              <Card
                key={rec.id}
                className={`flex flex-col justify-between ${
                  rec.status !== 'active' ? 'opacity-60 bg-surface-ground/50' : ''
                }`}
              >
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
                        <IconComponent class="w-4 h-4" />
                      </div>
                      <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                          {rec.category_code}
                        </span>
                        <h3 class="text-sm font-bold text-charcoal-900 leading-snug">
                          {rec.title}
                        </h3>
                      </div>
                    </div>
                    <Badge variant={priorityVariant}>{rec.priority} priority</Badge>
                  </div>

                  <div class="mt-3 space-y-2 text-xs">
                    <div class="p-3 rounded-lg bg-surface-ground border border-surface-border">
                      <span class="font-bold text-charcoal-700 block mb-0.5">Rationale:</span>
                      <p class="text-charcoal-600">{rec.explanation}</p>
                    </div>

                    <div class="p-3 rounded-lg bg-forest-50/70 border border-forest-100">
                      <span class="font-bold text-forest-900 block mb-0.5">Recommended Action:</span>
                      <p class="text-forest-800">{rec.action_text}</p>
                    </div>

                    {rec.potential_reduction_co2e_kg && (
                      <div class="text-[11px] text-emerald-700 font-semibold pt-1">
                        &bull; Potential Impact: &minus;{rec.potential_reduction_co2e_kg} kg CO2e
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div class="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                  <span class="text-[11px] text-charcoal-400 capitalize">Status: {rec.status}</span>
                  {rec.status === 'active' ? (
                    <div class="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleUpdateStatus(rec.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="mint"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleUpdateStatus(rec.id, 'completed')}
                      >
                        Mark Done
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(rec.id, 'active')}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

