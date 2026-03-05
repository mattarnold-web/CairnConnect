'use client';

import {
  Sun,
  AlertTriangle,
  ExternalLink,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

// ---------------------------------------------------------------------------
// Permit calendar helpers
// ---------------------------------------------------------------------------

/** Generate a simple 1-31 day grid with some days marked available. */
const AVAILABLE_DAYS = new Set([3, 5, 8, 12, 14, 17, 19, 22, 26, 29]);

// ---------------------------------------------------------------------------
// Trail data
// ---------------------------------------------------------------------------

interface TrailCard {
  id: string;
  name: string;
  status: 'open' | 'permit' | 'closed';
  statusLabel: string;
  lastUpdated?: string;
  reporter?: string;
  weather?: { temp: string; condition: string };
  permitNote?: string;
  closureMessage?: string;
  externalLink?: { label: string; href: string };
}

const TRAILS: TrailCard[] = [
  {
    id: 'eagle-creek',
    name: 'Eagle Creek Trail',
    status: 'open',
    statusLabel: 'OPEN',
    lastUpdated: '2 hours ago',
    reporter: 'Sarah M.',
    weather: { temp: '72\u00B0F', condition: 'Sunny' },
  },
  {
    id: 'angels-landing',
    name: 'Angels Landing',
    status: 'permit',
    statusLabel: 'PERMIT REQUIRED',
    lastUpdated: '1 day ago',
    reporter: 'NPS Rangers',
    permitNote: 'Limited entry lottery system',
    externalLink: { label: 'Recreation.gov', href: 'https://www.recreation.gov' },
  },
  {
    id: 'coyote-buttes',
    name: 'Coyote Buttes',
    status: 'closed',
    statusLabel: 'CLOSED',
    closureMessage: 'Fire danger \u2014 check back 3/20',
  },
];

// ---------------------------------------------------------------------------
// Status badge color map
// ---------------------------------------------------------------------------

function statusClasses(status: TrailCard['status']) {
  switch (status) {
    case 'open':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'permit':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'closed':
      return 'bg-red-500/10 text-red-400';
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrailStatusPage() {
  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pt-20">
        <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">
          Trail Status
        </h1>

        {/* ---- Trail cards ---- */}
        <div className="space-y-4">
          {TRAILS.map((trail) => (
            <div
              key={trail.id}
              className="rounded-xl border border-cairn-border bg-cairn-card p-5"
            >
              {/* Header row: name + badge */}
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {trail.name}
                </h2>
                <span
                  className={clsx(
                    'rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide',
                    statusClasses(trail.status)
                  )}
                >
                  {trail.statusLabel}
                </span>
              </div>

              {/* Last updated */}
              {trail.lastUpdated && (
                <p className="mb-3 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                  <Clock className="h-3.5 w-3.5" />
                  Last updated: {trail.lastUpdated}
                  {trail.reporter && <span>by {trail.reporter}</span>}
                </p>
              )}

              {/* Open trail: weather widget */}
              {trail.status === 'open' && trail.weather && (
                <div className="flex items-center gap-3 rounded-lg bg-cairn-elevated px-4 py-3">
                  <Sun className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {trail.weather.temp}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {trail.weather.condition}
                    </p>
                  </div>
                </div>
              )}

              {/* Permit-required trail */}
              {trail.status === 'permit' && (
                <>
                  {trail.permitNote && (
                    <p className="mb-3 text-sm text-[var(--text-secondary)]">
                      {trail.permitNote}
                    </p>
                  )}

                  {/* Permit availability calendar */}
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                      Permit Availability
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const available = AVAILABLE_DAYS.has(day);
                        return (
                          <div
                            key={day}
                            className={clsx(
                              'flex h-8 w-full items-center justify-center rounded text-xs font-medium',
                              available
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-cairn-elevated text-[var(--text-tertiary)]'
                            )}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* External link */}
                  {trail.externalLink && (
                    <a
                      href={trail.externalLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-canopy hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {trail.externalLink.label}
                    </a>
                  )}
                </>
              )}

              {/* Closed trail */}
              {trail.status === 'closed' && trail.closureMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                  <p className="text-sm font-medium text-red-400">
                    {trail.closureMessage}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---- Report Conditions button ---- */}
        <button
          className={clsx(
            'mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-canopy py-3',
            'text-sm font-semibold text-canopy transition-colors hover:bg-canopy/10'
          )}
        >
          <Plus className="h-4 w-4" />
          Report Conditions
        </button>
      </main>
    </div>
  );
}
