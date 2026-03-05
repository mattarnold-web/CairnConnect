'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import {
  BarChart3,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Search,
  Globe,
  MapPin,
  Share2,
} from 'lucide-react';
import { clsx } from 'clsx';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const TIME_PERIODS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'] as const;

// Deterministic-ish daily view data (seeded-style via simple formula)
const DAILY_VIEWS = Array.from({ length: 30 }, (_, i) => {
  const base = 500;
  const wave = Math.sin(i * 0.45) * 280;
  const bump = ((i * 137 + 47) % 300) - 100;
  return Math.max(200, Math.min(1100, Math.round(base + wave + bump)));
});

const Y_LABELS = [0, 200, 400, 600, 800, 1000, 1200];
const MAX_Y = 1200;

const TRAFFIC_SOURCES = [
  { label: 'Google Maps', pct: 45, color: 'rgb(var(--color-canopy))' },
  { label: 'Cairn Search', pct: 30, color: '#0d9488' },
  { label: 'Direct', pct: 15, color: '#6ee7b7' },
  { label: 'Social', pct: 10, color: '#a7f3d0' },
];

// Build conic-gradient string
const conicGradient = (() => {
  const colors = [
    'rgb(var(--color-canopy))',
    '#0d9488',
    '#6ee7b7',
    '#a7f3d0',
  ];
  const pcts = [45, 30, 15, 10];
  let acc = 0;
  const stops: string[] = [];
  pcts.forEach((p, i) => {
    stops.push(`${colors[i]} ${acc}% ${acc + p}%`);
    acc += p;
  });
  return `conic-gradient(${stops.join(', ')})`;
})();

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];

// Heatmap intensities 0-1 (rows = days, cols = time slots)
const HEATMAP: number[][] = [
  [0.1, 0.2, 0.5, 0.7, 0.8, 0.6, 0.3, 0.1],
  [0.1, 0.3, 0.6, 0.8, 0.9, 0.7, 0.4, 0.2],
  [0.1, 0.2, 0.5, 0.7, 0.8, 0.6, 0.3, 0.1],
  [0.2, 0.3, 0.6, 0.9, 1.0, 0.8, 0.5, 0.2],
  [0.2, 0.4, 0.7, 0.9, 1.0, 0.9, 0.6, 0.3],
  [0.4, 0.6, 0.9, 1.0, 1.0, 0.9, 0.7, 0.4],
  [0.3, 0.5, 0.8, 0.9, 0.9, 0.7, 0.5, 0.2],
];

const KEYWORDS = [
  { term: 'mountain bikes', pct: 92 },
  { term: 'ski rentals', pct: 76 },
  { term: 'guided tours', pct: 64 },
  { term: 'gear shop', pct: 51 },
  { term: 'trail maps', pct: 38 },
];

const FUNNEL_STEPS = [
  { label: 'Profile Views', value: '1,284', raw: 1284, pctLabel: '', trend: '+12%', up: true },
  { label: 'Clicks to Website', value: '456', raw: 456, pctLabel: '35%', trend: '+8%', up: true },
  { label: 'Inquiries / Calls', value: '70', raw: 70, pctLabel: '15%', trend: '-3%', up: false },
  { label: 'Bookings', value: '16', raw: 16, pctLabel: '23%', trend: '+18%', up: true },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<string>('Last 30 Days');
  const [periodOpen, setPeriodOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-20 pb-24">
        {/* ---- Header ---- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Performance Analytics
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Track how your business listing is performing
            </p>
          </div>

          {/* Time period dropdown */}
          <div className="relative">
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
            >
              {period}
              <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
            </button>
            {periodOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPeriodOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-cairn-border bg-cairn-card shadow-xl z-50 py-1">
                  {TIME_PERIODS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPeriod(p);
                        setPeriodOpen(false);
                      }}
                      className={clsx(
                        'w-full text-left px-4 py-2 text-sm transition-colors',
                        p === period
                          ? 'text-canopy bg-canopy/10'
                          : 'text-[var(--text-secondary)] hover:bg-cairn-card-hover'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ---- Daily Profile Views Trend Chart ---- */}
        <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-canopy" />
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Daily Profile Views
            </h2>
          </div>

          <div className="flex">
            {/* Y-axis labels */}
            <div className="flex flex-col-reverse justify-between pr-3 text-[10px] text-[var(--text-tertiary)] h-56 shrink-0">
              {Y_LABELS.map((v) => (
                <span key={v} className="leading-none">{v.toLocaleString()}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end gap-[3px] h-56 border-l border-b border-cairn-border pl-1">
              {DAILY_VIEWS.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-canopy rounded-t-sm hover:bg-canopy-dark transition-colors cursor-default"
                  style={{ height: `${(v / MAX_Y) * 100}%` }}
                  title={`Day ${i + 1}: ${v} views`}
                />
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex pl-10 mt-2">
            <div className="flex-1 flex justify-between text-[10px] text-[var(--text-tertiary)]">
              {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Two-Column Grid ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Sources */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">
              Traffic Sources
            </h2>

            <div className="flex items-center gap-6">
              {/* Pie chart */}
              <div
                className="h-36 w-36 rounded-full shrink-0"
                style={{ background: conicGradient }}
              >
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-cairn-card" />
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 flex-1">
                {TRAFFIC_SOURCES.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-sm text-[var(--text-secondary)]">{s.label}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Times Heatmap */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">
              Popular Times
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-10" />
                    {TIME_SLOTS.map((t) => (
                      <th
                        key={t}
                        className="text-[10px] text-[var(--text-tertiary)] font-normal pb-2 px-0.5 text-center"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, di) => (
                    <tr key={day}>
                      <td className="text-[11px] text-[var(--text-tertiary)] pr-2 py-0.5 text-right">
                        {day}
                      </td>
                      {TIME_SLOTS.map((_, ti) => (
                        <td key={ti} className="p-0.5">
                          <div
                            className="w-full aspect-square rounded-sm"
                            style={{
                              backgroundColor: `rgb(var(--color-canopy) / ${HEATMAP[di][ti]})`,
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Intensity legend */}
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[10px] text-[var(--text-tertiary)]">Less</span>
              {[0.15, 0.3, 0.5, 0.7, 0.9].map((o) => (
                <div
                  key={o}
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: `rgb(var(--color-canopy) / ${o})` }}
                />
              ))}
              <span className="text-[10px] text-[var(--text-tertiary)]">More</span>
            </div>
          </div>
        </div>

        {/* ---- Second Two-Column Grid ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Search Keywords */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Search className="h-5 w-5 text-canopy" />
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                Top Search Keywords
              </h2>
            </div>

            <div className="space-y-4">
              {KEYWORDS.map((kw) => (
                <div key={kw.term}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[var(--text-secondary)]">{kw.term}</span>
                    <span className="text-xs font-medium text-[var(--text-tertiary)]">{kw.pct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-cairn-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-canopy transition-all"
                      style={{ width: `${kw.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">
              Conversion Funnel
            </h2>

            <div className="space-y-3">
              {FUNNEL_STEPS.map((step, i) => {
                // Width shrinks per step: 100%, 75%, 50%, 35%
                const widths = ['100%', '75%', '50%', '35%'];
                return (
                  <div key={step.label} className="flex flex-col items-center">
                    <div
                      className="relative rounded-lg bg-canopy/20 border border-canopy/30 py-3 px-4 transition-all"
                      style={{ width: widths[i] }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-[var(--text-tertiary)]">{step.label}</div>
                          <div className="font-display text-lg font-bold text-[var(--text-primary)]">
                            {step.value}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {step.pctLabel && (
                            <span className="text-xs font-medium text-canopy bg-canopy/10 px-2 py-0.5 rounded-full">
                              {step.pctLabel}
                            </span>
                          )}
                          <span
                            className={clsx(
                              'flex items-center gap-0.5 text-xs font-medium',
                              step.up ? 'text-emerald-400' : 'text-red-400'
                            )}
                          >
                            {step.up ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {step.trend}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {i < FUNNEL_STEPS.length - 1 && (
                      <div className="h-3 w-px bg-cairn-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
