import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Target, Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { Card, Button, Badge, Input, LoadingSkeleton, EmptyState, AlertBanner } from '../components/common/UIComponents';

export function GoalsPage() {
  const { activeWorkspace } = useWorkspace();
  const { refreshKey } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // New Goal form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetReductionPct, setTargetReductionPct] = useState(15);
  const [baselineCo2eKg, setBaselineCo2eKg] = useState('');
  const [targetCo2eKg, setTargetCo2eKg] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [creating, setCreating] = useState(false);

  const fetchGoals = async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.listGoals();
      setGoals(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [activeWorkspace, refreshKey]);

  // Handle baseline change to auto-calculate target
  const handleBaselineChange = (val) => {
    setBaselineCo2eKg(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const target = num * (1 - targetReductionPct / 100);
      setTargetCo2eKg(target.toFixed(1));
    }
  };

  const handlePctChange = (pct) => {
    setTargetReductionPct(pct);
    const num = parseFloat(baselineCo2eKg);
    if (!isNaN(num) && num > 0) {
      const target = num * (1 - pct / 100);
      setTargetCo2eKg(target.toFixed(1));
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      await api.createGoal({
        title: title.trim(),
        description: description.trim() || null,
        targetReductionPct: parseFloat(targetReductionPct),
        baselineCo2eKg: parseFloat(baselineCo2eKg),
        targetCo2eKg: parseFloat(targetCo2eKg),
        startDate,
        targetDate,
      });
      setTitle('');
      setDescription('');
      setBaselineCo2eKg('');
      setTargetCo2eKg('');
      setCreateModalOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (goalId, newStatus) => {
    try {
      await api.updateGoalStatus(goalId, newStatus);
      fetchGoals();
    } catch (err) {
      setError(err.message || 'Failed to update goal');
    }
  };

  return (
    <div class="space-y-8">
      {/* Page Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-charcoal-900 tracking-tight">Reduction Goals</h1>
          <p class="text-xs text-charcoal-500 mt-1">
            Establish carbon footprint milestones and monitor progress in{' '}
            <span class="font-semibold text-charcoal-800">{activeWorkspace?.name || 'Personal'}</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Goal
        </Button>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      {/* Goals Grid */}
      {loading ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Active Reduction Goals"
          description="Set a target reduction percentage against your historical baseline to track sustainability milestones."
          actionText="Create First Goal"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
                      <Target class="w-4 h-4" />
                    </div>
                    <div>
                      <h3 class="text-base font-bold text-charcoal-900 leading-tight">
                        {goal.title}
                      </h3>
                      <span class="text-[11px] text-charcoal-400">
                        {goal.start_date} &rarr; {goal.target_date}
                      </span>
                    </div>
                  </div>
                  <Badge variant={goal.status === 'active' ? 'forest' : 'neutral'}>
                    {goal.status}
                  </Badge>
                </div>

                {goal.description && (
                  <p class="text-xs text-charcoal-600 mb-4">{goal.description}</p>
                )}

                {/* Progress Bar & Indicators */}
                <div class="space-y-1.5 mt-4">
                  <div class="flex justify-between text-xs">
                    <span class="text-charcoal-500 font-medium">Reduction Progress</span>
                    <span class="font-bold text-forest-800">{goal.progressPct}%</span>
                  </div>
                  <div class="w-full h-3 rounded-full bg-surface-ground overflow-hidden border border-surface-border">
                    <div
                      class="h-full bg-forest-700 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, goal.progressPct))}%` }}
                    />
                  </div>
                  <div class="flex justify-between text-[11px] text-charcoal-400 pt-1">
                    <span>Baseline: {goal.baselineCo2eKg} kg</span>
                    <span>Target: {goal.targetCo2eKg} kg</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {goal.status === 'active' && (
                <div class="pt-4 mt-4 border-t border-surface-border flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateStatus(goal.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="mint"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleUpdateStatus(goal.id, 'achieved')}
                  >
                    Mark Achieved
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {createModalOpen && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-white rounded-2xl shadow-dropdown border border-surface-border w-full max-w-md overflow-hidden">
            <div class="px-6 py-4 border-b border-surface-border flex items-center justify-between">
              <h2 class="text-base font-bold text-charcoal-900">Set Carbon Reduction Goal</h2>
              <button onClick={() => setCreateModalOpen(false)}>
                <X class="w-5 h-5 text-charcoal-400" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} class="p-6 space-y-4">
              <Input
                label="Goal Title"
                placeholder="e.g. Cut Grid Electricity 15%"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Input
                label="Description / Mitigation Strategy"
                placeholder="e.g. Turn off standby servers, shift heavy wash loads"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div class="grid grid-cols-2 gap-3">
                <Input
                  label="Baseline (kg CO2e)"
                  type="number"
                  step="any"
                  placeholder="e.g. 500"
                  value={baselineCo2eKg}
                  onChange={(e) => handleBaselineChange(e.target.value)}
                  required
                />
                <Input
                  label="Target Reduction %"
                  type="number"
                  value={targetReductionPct}
                  onChange={(e) => handlePctChange(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <Input
                label="Resulting Target Cap (kg CO2e)"
                type="number"
                step="any"
                value={targetCo2eKg}
                onChange={(e) => setTargetCo2eKg(e.target.value)}
                required
              />

              <div class="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="Target Deadline"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>

              <div class="pt-2 flex justify-end gap-3 border-t border-surface-border">
                <Button variant="secondary" onClick={() => setCreateModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={creating}>
                  Activate Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

