import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Car,
  Flame,
  Container,
  Trash2,
  Calendar,
  Building2,
  FileText,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Button, Input, Select, AlertBanner } from '../common/UIComponents';

const CATEGORY_ICONS = {
  electricity: Zap,
  transportation: Car,
  fuel: Flame,
  lpg: Container,
  waste: Trash2,
};

export function AddActivityModal({ isOpen, onClose, onSuccess }) {
  const { isOrgWorkspace, activeWorkspace } = useWorkspace();

  const [categories, setCategories] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedCategoryCode, setSelectedCategoryCode] = useState('electricity');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [departmentId, setDepartmentId] = useState('');
  const [notes, setNotes] = useState('');

  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load Categories on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await api.getCategories();
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategoryCode(res.data[0].code);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    if (isOpen) init();
  }, [isOpen]);

  // Load Activity Types for selected category
  useEffect(() => {
    async function loadTypes() {
      if (!selectedCategoryCode) return;
      try {
        const res = await api.getActivityTypes(selectedCategoryCode);
        setActivityTypes(res.data);
        if (res.data.length > 0) {
          setSelectedTypeId(res.data[0].id);
        } else {
          setSelectedTypeId('');
        }
      } catch (err) {
        console.error('Failed to load activity types:', err);
      }
    }
    if (isOpen) loadTypes();
  }, [selectedCategoryCode, isOpen]);

  // Load Departments if in Organization workspace
  useEffect(() => {
    async function loadDepts() {
      if (isOrgWorkspace && activeWorkspace?.id) {
        try {
          const res = await api.getOrgDepartments(activeWorkspace.id);
          setDepartments(res.data);
        } catch (err) {
          console.error('Failed to load departments:', err);
        }
      }
    }
    if (isOpen) loadDepts();
  }, [isOrgWorkspace, activeWorkspace, isOpen]);

  // Current selected activity type object
  const currentType = activityTypes.find((t) => t.id === selectedTypeId);

  // Live calculation preview debounce
  useEffect(() => {
    if (!selectedTypeId || !quantity || parseFloat(quantity) <= 0) {
      setPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingPreview(true);
        const res = await api.previewCalculation({
          activityTypeId: selectedTypeId,
          quantity: parseFloat(quantity),
          unit: currentType?.standard_unit || 'unit',
          activityDate,
        });
        setPreview(res.data);
      } catch (err) {
        console.error('Preview calculation error:', err);
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedTypeId, quantity, activityDate, currentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTypeId || !quantity || parseFloat(quantity) <= 0) {
      setError('Please provide a valid activity quantity greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await api.createActivity({
        activityTypeId: selectedTypeId,
        quantity: parseFloat(quantity),
        unit: currentType.standard_unit,
        activityDate,
        departmentId: isOrgWorkspace && departmentId ? departmentId : null,
        notes: notes || null,
      });

      // Reset form
      setQuantity('');
      setNotes('');
      setPreview(null);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record activity');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-2xl shadow-dropdown border border-surface-border w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div class="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-charcoal-900">Record Emission Activity</h2>
            <p class="text-xs text-charcoal-500">
              Deterministic calculations based on verified factor benchmarks
            </p>
          </div>
          <button
            onClick={onClose}
            class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-surface-ground transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} class="p-6 overflow-y-auto space-y-5">
          {error && <AlertBanner type="error" message={error} />}

          {/* Category Selector Tabs */}
          <div>
            <label class="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
              Emission Category
            </label>
            <div class="grid grid-cols-5 gap-2">
              {categories.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.code] || Zap;
                const isSelected = selectedCategoryCode === cat.code;
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setSelectedCategoryCode(cat.code)}
                    class={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-forest-700 bg-forest-50 text-forest-800 font-semibold shadow-sm'
                        : 'border-surface-border bg-surface-ground hover:bg-white text-charcoal-600'
                    }`}
                  >
                    <IconComponent
                      class={`w-5 h-5 mb-1 ${
                        isSelected ? 'text-forest-700' : 'text-charcoal-400'
                      }`}
                    />
                    <span class="text-[11px] leading-tight truncate w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Type Selection */}
          <div>
            <Select
              label="Activity Type"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
            >
              {activityTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.standard_unit})
                </option>
              ))}
            </Select>
            {currentType?.description && (
              <p class="text-[11px] text-charcoal-500 mt-1 italic">
                {currentType.description}
              </p>
            )}
          </div>

          {/* Quantity & Unit Row */}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Input
                label={`Quantity (${currentType?.standard_unit || 'Unit'})`}
                type="number"
                step="any"
                min="0.001"
                placeholder="e.g. 150"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Activity Date"
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Department Selection (if Org workspace) */}
          {isOrgWorkspace && (
            <div>
              <Select
                label="Department / Facility (Optional)"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">General (Unassigned)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code || 'Dept'})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Notes */}
          <div>
            <Input
              label="Notes / Reference (Optional)"
              placeholder="e.g. Monthly utility invoice, meter #42"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Live Calculation Preview Card */}
          {preview && (
            <div class="p-4 rounded-xl border border-forest-200 bg-forest-50/70 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-forest-700 text-white flex items-center justify-center">
                  <Sparkles class="w-5 h-5" />
                </div>
                <div>
                  <span class="text-xs text-forest-800 font-medium block">
                    Calculated Footprint Preview
                  </span>
                  <span class="text-xs text-charcoal-500">
                    Factor: {preview.factorValue} {preview.factorUnit} ({preview.sourceName})
                  </span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xl font-bold text-forest-800 block">
                  {preview.estimatedCo2eKg.toFixed(2)}
                </span>
                <span class="text-[10px] uppercase font-bold text-forest-700 tracking-wider">
                  kg CO2e
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div class="pt-2 flex items-center justify-end gap-3 border-t border-surface-border">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Activity & Emissions
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

