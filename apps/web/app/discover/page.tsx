'use client';

import {
  Mountain,
  Bell,
  Footprints,
  Bike,
  Waves,
  Wind,
  Compass,
  Globe,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

// ---------------------------------------------------------------------------
// Top 5 Activities mock data
// ---------------------------------------------------------------------------

const ACTIVITIES = [
  { name: 'Levada Walking', count: '127 trails', icon: Footprints },
  { name: 'Mountain Biking', count: '45 trails', icon: Bike },
  { name: 'Canyoning', count: '23 spots', icon: Compass },
  { name: 'Surfing', count: '18 beaches', icon: Waves },
  { name: 'Paragliding', count: '12 launch sites', icon: Wind },
];

// ---------------------------------------------------------------------------
// Quick Facts
// ---------------------------------------------------------------------------

const QUICK_FACTS = [
  { label: 'Best Season', value: 'Year-round', icon: Calendar },
  { label: 'Language', value: 'Portuguese / English', icon: Globe },
  { label: 'Currency', value: 'EUR', icon: DollarSign },
  { label: 'Local Guides', value: '34 businesses', icon: Users },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pt-20">
        {/* ---- Hero Section ---- */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          {/* Gradient placeholder for cover photo */}
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900">
            <Mountain className="h-16 w-16 text-teal-400/40" />
          </div>

          {/* Overlay text */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Discover Madeira, Portugal
            </h1>
          </div>

          {/* Notification bell */}
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-[var(--text-primary)]" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              5
            </span>
          </button>
        </div>

        {/* ---- Top 5 Activities ---- */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Top 5 Activities
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {ACTIVITIES.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.name}
                  className="flex items-center gap-3 rounded-xl bg-cairn-card p-4 border border-cairn-border transition-colors hover:bg-cairn-card-hover"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-canopy/20">
                    <Icon className="h-5 w-5 text-canopy" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] text-sm leading-tight">
                      {activity.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {activity.count}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className={clsx(
              'mt-4 w-full rounded-xl bg-canopy py-3 text-sm font-semibold text-white',
              'transition-colors hover:bg-canopy-dark'
            )}
          >
            Explore Region
          </button>
        </section>

        {/* ---- Quick Facts ---- */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Quick Facts
          </h2>

          <div className="rounded-xl border border-cairn-border bg-cairn-card p-4">
            <div className="grid grid-cols-2 gap-4">
              {QUICK_FACTS.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cairn-elevated">
                      <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {fact.label}
                      </p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {fact.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
