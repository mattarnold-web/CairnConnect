'use client';

import { useState, useTransition } from 'react';
import {
  Trash2,
  Download,
  Mountain,
  MapPin,
  TrendingUp,
  TrendingDown,
  Timer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { useActivityContext } from '@/lib/activity-context';
import { useFormat } from '@/lib/use-format';
import { downloadGpx } from '@/lib/gpx-export';
import { deleteRecordedActivity } from '@/lib/actions/activities';
import type { RecordedActivity } from '@/lib/activity-types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ProfilePage() {
  const { state, dispatch } = useActivityContext();
  const fmt = useFormat();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stravaModalOpen, setStravaModalOpen] = useState(false);

  const completed = state.activities
    .filter((a) => a.status === 'completed')
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  function handleDelete(id: string) {
    // Remove from local context immediately (optimistic)
    dispatch({ type: 'DELETE_ACTIVITY', id });
    // Also delete from server if persisted
    deleteRecordedActivity(id).catch(() => {
      // Silently fail — local context is already updated
    });
  }

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-100">
            Activity History
          </h1>
          <button
            onClick={() => setStravaModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#FC4C02]/10 border border-[#FC4C02]/30 px-4 py-2 text-sm font-medium text-[#FC4C02] hover:bg-[#FC4C02]/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Connect to Strava
          </button>
        </div>

        {/* Strava info modal */}
        {stravaModalOpen && (
          <div className="mb-6 rounded-2xl bg-cairn-card border border-cairn-border p-5">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#FC4C02] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-sm font-semibold text-slate-100 mb-2">
                  Strava Integration
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                  Full Strava sync requires a backend server (coming soon).
                  In the meantime, you can export any activity as a GPX file
                  and upload it directly to Strava.
                </p>
                <ol className="text-sm text-slate-400 space-y-1.5 mb-3 list-decimal list-inside">
                  <li>Click "Export GPX" on any activity below</li>
                  <li>Go to strava.com and click the + button</li>
                  <li>Choose "Upload activity" and select the GPX file</li>
                </ol>
                <button
                  onClick={() => setStravaModalOpen(false)}
                  className="text-xs font-medium text-canopy hover:text-canopy-dark transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {completed.length === 0 ? (
          <div className="text-center py-16">
            <Mountain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold text-slate-300 mb-2">
              No activities yet
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Record your first activity to see it here.
            </p>
            <a
              href="/record"
              className="inline-flex items-center gap-2 rounded-xl bg-canopy px-5 py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
            >
              Start Recording
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                expanded={expandedId === activity.id}
                onToggle={() =>
                  setExpandedId(expandedId === activity.id ? null : activity.id)
                }
                onDelete={() => handleDelete(activity.id)}
                onExport={() => downloadGpx(activity)}
                fmt={fmt}
              />
            ))}
          </div>
        )}

        {/* Summary stats */}
        {completed.length > 0 && (
          <div className="mt-8 rounded-2xl bg-cairn-card border border-cairn-border p-5">
            <h3 className="font-display text-sm font-semibold text-slate-100 mb-4">
              All-Time Stats
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="font-display text-xl font-bold text-canopy">
                  {completed.length}
                </p>
                <p className="text-xs text-slate-500">Activities</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-canopy">
                  {fmt.distance(
                    completed.reduce((sum, a) => sum + a.distanceMeters, 0),
                  )}
                </p>
                <p className="text-xs text-slate-500">Total Distance</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-canopy">
                  {fmt.elevation(
                    completed.reduce((sum, a) => sum + a.elevationGainMeters, 0),
                  )}
                </p>
                <p className="text-xs text-slate-500">Total Elevation</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-canopy">
                  {formatElapsed(
                    completed.reduce((sum, a) => sum + a.durationSeconds, 0),
                  )}
                </p>
                <p className="text-xs text-slate-500">Total Time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  expanded,
  onToggle,
  onDelete,
  onExport,
  fmt,
}: {
  activity: RecordedActivity;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onExport: () => void;
  fmt: ReturnType<typeof useFormat>;
}) {
  return (
    <div className="rounded-2xl bg-cairn-card border border-cairn-border overflow-hidden">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-cairn-card-hover transition-colors"
      >
        <ActivityIcon activity={activity.activityType} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-100 truncate">
            {activity.title}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span>{formatDate(activity.startedAt)}</span>
            <span>{fmt.distance(activity.distanceMeters)}</span>
            <span>{formatElapsed(activity.durationSeconds)}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-cairn-border p-4 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-canopy" />
              <div>
                <p className="text-slate-100 font-medium">
                  {fmt.distance(activity.distanceMeters)}
                </p>
                <p className="text-xs text-slate-500">Distance</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-canopy" />
              <div>
                <p className="text-slate-100 font-medium">
                  {formatElapsed(activity.durationSeconds)}
                </p>
                <p className="text-xs text-slate-500">Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-canopy" />
              <div>
                <p className="text-slate-100 font-medium">
                  {fmt.elevation(activity.elevationGainMeters)}
                </p>
                <p className="text-xs text-slate-500">Elev Gain</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-canopy" />
              <div>
                <p className="text-slate-100 font-medium">
                  {fmt.elevation(activity.elevationLossMeters)}
                </p>
                <p className="text-xs text-slate-500">Elev Loss</p>
              </div>
            </div>
          </div>

          {/* GPS track info */}
          {activity.gpsTrack.length > 0 && (
            <p className="text-xs text-slate-500">
              {activity.gpsTrack.length} GPS points recorded
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onExport}
              disabled={activity.gpsTrack.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-xs font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Export GPX
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
