'use client';

import { useState } from 'react';
import {
  X,
  AlertTriangle,
  TreePine,
  Droplets,
  Snowflake,
  Construction,
  Navigation,
  Camera,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

const HAZARD_TYPES = [
  { id: 'fallen_tree', label: 'Fallen Tree', icon: TreePine, color: '#F59E0B' },
  { id: 'flooding', label: 'Flooding / Water', icon: Droplets, color: '#3B82F6' },
  { id: 'snow_ice', label: 'Snow / Ice', icon: Snowflake, color: '#06B6D4' },
  { id: 'construction', label: 'Trail Closure', icon: Construction, color: '#EF4444' },
  { id: 'wildlife', label: 'Wildlife Warning', icon: AlertTriangle, color: '#F97316' },
  { id: 'navigation', label: 'Poor Signage', icon: Navigation, color: '#8B5CF6' },
] as const;

const SEVERITY_LEVELS = [
  { id: 'info', label: 'FYI', color: '#3B82F6', description: 'No impact to trail use' },
  { id: 'caution', label: 'Caution', color: '#F59E0B', description: 'Use extra care' },
  { id: 'warning', label: 'Warning', color: '#F97316', description: 'Consider alternate route' },
  { id: 'danger', label: 'Danger', color: '#EF4444', description: 'Do not proceed' },
] as const;

interface HazardReportModalProps {
  trailName: string;
  onClose: () => void;
  onSubmit?: (report: {
    hazardType: string;
    severity: string;
    description: string;
    condition: string;
  }) => void;
}

export function HazardReportModal({ trailName, onClose, onSubmit }: HazardReportModalProps) {
  const [hazardType, setHazardType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'open' | 'caution' | 'closed'>('caution');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!hazardType || !severity) return;
    onSubmit?.({ hazardType, severity, description, condition });
    setSubmitted(true);
    setTimeout(onClose, 1500);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="rounded-2xl border border-cairn-border bg-cairn-card p-8 text-center max-w-sm w-full">
          <div className="h-14 w-14 rounded-full bg-canopy/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-7 w-7 text-canopy" />
          </div>
          <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">
            Report Submitted
          </h3>
          <p className="text-sm text-slate-400">
            Thanks for helping keep the community safe!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl border border-cairn-border bg-cairn-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cairn-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-lg font-semibold text-slate-100">
              Report Trail Condition
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-cairn-elevated transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <p className="text-sm text-slate-400">
            Reporting for <span className="font-medium text-slate-200">{trailName}</span>
          </p>

          {/* Hazard type selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">What did you encounter?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HAZARD_TYPES.map((h) => {
                const Icon = h.icon;
                return (
                  <button
                    key={h.id}
                    onClick={() => setHazardType(h.id)}
                    className={clsx(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors',
                      hazardType === h.id
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                        : 'border-cairn-border bg-cairn-elevated text-slate-400 hover:text-slate-200'
                    )}
                  >
                    <Icon className="h-4 w-4" style={{ color: h.color }} />
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Severity</label>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_LEVELS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeverity(s.id)}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                    severity === s.id
                      ? 'bg-opacity-15 border-opacity-40'
                      : 'border-cairn-border text-slate-400 hover:text-slate-200'
                  )}
                  style={
                    severity === s.id
                      ? {
                          backgroundColor: `${s.color}20`,
                          borderColor: `${s.color}60`,
                          color: s.color,
                        }
                      : undefined
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trail condition update */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Update trail status
            </label>
            <div className="flex gap-2">
              {[
                { value: 'open', label: 'Open', color: '#10B981' },
                { value: 'caution', label: 'Caution', color: '#F59E0B' },
                { value: 'closed', label: 'Closed', color: '#EF4444' },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setCondition(s.value as typeof condition)}
                  className={clsx(
                    'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors',
                    condition === s.value
                      ? 'bg-opacity-15'
                      : 'border-cairn-border text-slate-400'
                  )}
                  style={
                    condition === s.value
                      ? {
                          backgroundColor: `${s.color}20`,
                          borderColor: `${s.color}60`,
                          color: s.color,
                        }
                      : undefined
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you saw, exact location on trail, etc..."
              rows={3}
              className="w-full rounded-xl bg-cairn-elevated border border-cairn-border px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none resize-none"
            />
          </div>

          {/* Photo upload placeholder */}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-cairn-border py-3 text-sm text-slate-400 hover:text-canopy hover:border-canopy/40 transition-colors">
            <Camera className="h-4 w-4" />
            Add Photo (optional)
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!hazardType || !severity}
            className="w-full rounded-xl bg-canopy py-3 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
