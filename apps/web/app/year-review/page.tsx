'use client';

import { useState } from 'react';
import {
  Mountain,
  Sunrise,
  Users,
  Shield,
  Award,
  Share2,
  Download,
  Bike,
  Footprints,
  MoreHorizontal,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

/* ---------- mock data ---------- */

const STATS = [
  { value: '142', label: 'Activities completed' },
  { value: '587', label: 'Miles logged' },
  { value: '89,340 ft', label: 'Elevation gained' },
  { value: '18', label: 'New trails explored' },
];

const ACTIVITY_BREAKDOWN = [
  { label: 'Hiking', pct: 60, color: '#22c55e' },
  { label: 'Mountain Biking', pct: 25, color: '#3b82f6' },
  { label: 'Trail Running', pct: 10, color: '#f59e0b' },
  { label: 'Other', pct: 5, color: '#6b7280' },
];

const MONTHLY_DATA = [
  { month: 'Jan', value: 8 },
  { month: 'Feb', value: 6 },
  { month: 'Mar', value: 14 },
  { month: 'Apr', value: 18 },
  { month: 'May', value: 22 },
  { month: 'Jun', value: 20 },
  { month: 'Jul', value: 16 },
  { month: 'Aug', value: 12 },
  { month: 'Sep', value: 10 },
  { month: 'Oct', value: 8 },
  { month: 'Nov', value: 5 },
  { month: 'Dec', value: 3 },
];

const ACHIEVEMENTS = [
  { label: '100 Mile Club', Icon: Award, earned: true, gold: true },
  { label: 'Peak Bagger', Icon: Mountain, earned: true, gold: false },
  { label: 'Early Bird', Icon: Sunrise, earned: true, gold: false },
  { label: 'Social Butterfly', Icon: Users, earned: false, gold: false },
  { label: 'Trail Steward', Icon: Shield, earned: false, gold: false },
];

/* ---------- helpers ---------- */

function buildConicGradient(segments: { pct: number; color: string }[]) {
  let acc = 0;
  const stops: string[] = [];
  for (const s of segments) {
    stops.push(`${s.color} ${acc}% ${acc + s.pct}%`);
    acc += s.pct;
  }
  return `conic-gradient(${stops.join(', ')})`;
}

const currentMonthIndex = new Date().getMonth(); // 0-based
const maxMonthly = Math.max(...MONTHLY_DATA.map((d) => d.value));

/* ---------- page ---------- */

export default function YearReviewPage() {
  const [shared, setShared] = useState(false);

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Your Year in Review
          </h1>
          <span className="inline-flex items-center rounded-full bg-canopy/20 px-2.5 py-0.5 text-xs font-semibold text-canopy">
            Pro
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-cairn-border bg-cairn-card p-5"
            >
              <p className="font-display text-3xl font-bold text-[var(--text-primary)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Activity Type Breakdown */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-6">
            Activity Type Breakdown
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Donut chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: buildConicGradient(ACTIVITY_BREAKDOWN),
                }}
              />
              {/* center cutout */}
              <div className="absolute inset-6 rounded-full bg-cairn-card flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-[var(--text-primary)]">
                    142
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">Total</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3">
              {ACTIVITY_BREAKDOWN.map((seg) => (
                <div key={seg.label} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {seg.label}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {seg.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Activity Bar Chart */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-6">
            Monthly Activity
          </h2>

          <div className="flex items-end gap-2 h-40">
            {MONTHLY_DATA.map((d, i) => {
              const heightPct = maxMonthly > 0 ? (d.value / maxMonthly) * 100 : 0;
              const isCurrent = i === currentMonthIndex;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--text-tertiary)] mb-1">
                    {d.value}
                  </span>
                  <div
                    className={clsx(
                      'w-full rounded-t-md transition-colors',
                      isCurrent ? 'bg-canopy' : 'bg-canopy/40'
                    )}
                    style={{ height: `${heightPct}%`, minHeight: d.value > 0 ? 4 : 0 }}
                  />
                  <span
                    className={clsx(
                      'text-xs mt-1',
                      isCurrent
                        ? 'text-canopy font-semibold'
                        : 'text-[var(--text-tertiary)]'
                    )}
                  >
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Row */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-6">
            Achievements
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-2 -mx-2 px-2">
            {ACHIEVEMENTS.map((a) => {
              const Icon = a.Icon;
              return (
                <div
                  key={a.label}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div
                    className={clsx(
                      'w-16 h-16 rounded-full flex items-center justify-center border-2',
                      a.earned && a.gold
                        ? 'border-spotlight-gold bg-spotlight-gold/10 text-spotlight-gold'
                        : a.earned
                          ? 'border-canopy bg-canopy/10 text-canopy'
                          : 'border-cairn-border bg-cairn-card text-[var(--text-tertiary)]'
                    )}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span
                    className={clsx(
                      'text-xs text-center max-w-[5rem]',
                      a.earned
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)]'
                    )}
                  >
                    {a.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShared(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-canopy px-8 py-3 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {shared ? 'Shared!' : 'Share Your Year'}
          </button>

          <button className="inline-flex items-center gap-1 text-sm font-medium text-canopy hover:underline">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </main>
    </div>
  );
}
