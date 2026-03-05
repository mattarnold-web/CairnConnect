'use client';

import { useState } from 'react';
import {
  Mountain,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bike,
  TreePine,
  SlidersHorizontal,
  DollarSign,
  Users,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

/* ---------- filter chips ---------- */

const FILTERS = [
  { label: 'Activity Type', icon: SlidersHorizontal },
  { label: 'Price Range', icon: DollarSign },
  { label: 'Date', icon: Calendar },
  { label: 'Group Size', icon: Users },
];

/* ---------- mini calendar helpers ---------- */

function getWeekDates(): { day: number; date: Date; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      day: d.getDate(),
      date: d,
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const weekDates = getWeekDates();

/* ---------- experience cards data ---------- */

interface Experience {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  price: string;
  priceNote?: string;
  cancelPolicy: string;
  cta: string;
  ctaVariant: 'green' | 'outline';
  hasCalendar?: boolean;
  icon: typeof Mountain;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'rock-climbing',
    title: 'Guided Rock Climbing - Half Day',
    provider: 'Summit Seekers Guides',
    rating: 4.8,
    reviews: 120,
    price: '$120 per person',
    cancelPolicy: 'Free cancellation until 48h prior',
    cta: 'Book Now',
    ctaVariant: 'green',
    icon: Mountain,
  },
  {
    id: 'bike-rental',
    title: 'Bike Rental - Full Day',
    provider: 'Cairn Cycles',
    rating: 4.8,
    reviews: 85,
    price: '$45 per day',
    cancelPolicy: 'Flexible cancellation',
    cta: 'Book Now',
    ctaVariant: 'green',
    hasCalendar: true,
    icon: Bike,
  },
  {
    id: 'backcountry-permit',
    title: 'Backcountry Permit - Angels Landing',
    provider: 'National Park Service',
    rating: 4.8,
    reviews: 310,
    price: 'Lottery System - Entry Fee $6, Permit $30',
    cancelPolicy: '',
    cta: 'Enter Lottery',
    ctaVariant: 'green',
    icon: TreePine,
  },
];

/* ---------- page ---------- */

export default function BookPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  function toggleFilter(label: string) {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  }

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Book Your Adventure
          </h1>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 -mx-1 px-1">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = activeFilters.includes(f.label);
            return (
              <button
                key={f.label}
                onClick={() => toggleFilter(f.label)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  active
                    ? 'border-canopy bg-canopy/10 text-canopy'
                    : 'border-cairn-border bg-cairn-card text-[var(--text-secondary)] hover:bg-cairn-card-hover'
                )}
              >
                <Icon className="w-4 h-4" />
                {f.label}
                {active && <X className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Featured Experiences */}
        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">
          Featured Experiences
        </h2>

        <div className="flex gap-5 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
          {EXPERIENCES.map((exp) => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.id}
                className="flex-shrink-0 w-80 snap-start rounded-xl border border-cairn-border bg-cairn-card overflow-hidden"
              >
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-cairn-card-hover to-cairn-elevated flex items-center justify-center">
                  <Icon className="w-12 h-12 text-[var(--text-tertiary)]" />
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)] leading-tight">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {exp.provider}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-spotlight-gold fill-spotlight-gold" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {exp.rating}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)]">
                      ({exp.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {exp.price}
                  </p>

                  {/* Mini calendar for bike rental */}
                  {exp.hasCalendar && (
                    <div className="rounded-lg border border-cairn-border bg-cairn-elevated p-3">
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {DAY_LABELS.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] text-[var(--text-tertiary)] font-medium"
                          >
                            {d}
                          </span>
                        ))}
                        {weekDates.map((wd) => (
                          <button
                            key={wd.day}
                            onClick={() => setSelectedDate(wd.day)}
                            className={clsx(
                              'w-8 h-8 rounded-full text-xs font-medium transition-colors mx-auto flex items-center justify-center',
                              selectedDate === wd.day
                                ? 'bg-canopy text-white'
                                : wd.isToday
                                  ? 'bg-canopy/20 text-canopy'
                                  : 'text-[var(--text-secondary)] hover:bg-cairn-card-hover'
                            )}
                          >
                            {wd.day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancel policy */}
                  {exp.cancelPolicy && (
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {exp.cancelPolicy}
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    className={clsx(
                      'w-full rounded-xl py-2.5 text-sm font-semibold transition-colors',
                      exp.ctaVariant === 'green'
                        ? 'bg-canopy text-white hover:bg-canopy-dark'
                        : 'border border-canopy text-canopy hover:bg-canopy/10'
                    )}
                  >
                    {exp.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          8-12% commission for businesses on all bookings.
        </p>
      </main>
    </div>
  );
}
