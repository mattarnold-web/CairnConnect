'use client';

import { useState } from 'react';
import {
  Ticket,
  Filter,
  QrCode,
  Share2,
  ChevronRight,
  Users,
  Search,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

// ---------------------------------------------------------------------------
// Mock permit data
// ---------------------------------------------------------------------------

interface Permit {
  id: string;
  name: string;
  date: string;
  timeSlot: string;
  seatsFilled: number;
  seatsTotal: number;
  status: 'open' | 'full';
  groupAvatars: string[];
  overflowCount: number;
}

const PERMITS: Permit[] = [
  {
    id: 'p1',
    name: 'Angels Landing - Zion',
    date: 'March 15, 2028',
    timeSlot: '07:00 AM - 12:00 PM',
    seatsFilled: 4,
    seatsTotal: 6,
    status: 'open',
    groupAvatars: ['AK', 'JT', 'ML', 'SR'],
    overflowCount: 2,
  },
  {
    id: 'p2',
    name: 'Wave - Coyote Buttes',
    date: 'April 2, 2026',
    timeSlot: '06:00 AM - 02:00 PM',
    seatsFilled: 6,
    seatsTotal: 6,
    status: 'full',
    groupAvatars: ['RB', 'KD', 'NP', 'TS', 'LW', 'CM'],
    overflowCount: 0,
  },
  {
    id: 'p3',
    name: 'Half Dome - Yosemite',
    date: 'May 10, 2026',
    timeSlot: '05:00 AM - 06:00 PM',
    seatsFilled: 1,
    seatsTotal: 4,
    status: 'open',
    groupAvatars: ['YO'],
    overflowCount: 0,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PermitsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pt-20">
        {/* ---- Header ---- */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-canopy" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              My Permits
            </h1>
          </div>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
              filterOpen
                ? 'border-canopy bg-canopy/10 text-canopy'
                : 'border-cairn-border bg-cairn-card text-[var(--text-secondary)]',
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* ---- Permit Cards ---- */}
        <div className="space-y-4">
          {PERMITS.map((permit) => {
            const spotsLeft = permit.seatsTotal - permit.seatsFilled;
            const isFull = permit.status === 'full';

            return (
              <div
                key={permit.id}
                className="rounded-2xl border border-cairn-border bg-cairn-card p-5"
              >
                {/* Top row: name + action icons */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 shrink-0 text-canopy" />
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      {permit.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                      <QrCode className="h-5 w-5" />
                    </button>
                    <button className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Date / time */}
                <p className="mb-3 text-sm text-[var(--text-secondary)]">
                  {permit.date}, {permit.timeSlot}
                </p>

                {/* Group avatars + manage link */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Overlapping avatar circles */}
                    <div className="flex -space-x-2">
                      {permit.groupAvatars.slice(0, 4).map((initials, i) => (
                        <div
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cairn-card bg-cairn-elevated text-[10px] font-bold text-[var(--text-secondary)]"
                        >
                          {initials}
                        </div>
                      ))}
                      {permit.overflowCount > 0 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cairn-card bg-cairn-elevated text-[10px] font-semibold text-[var(--text-tertiary)]">
                          +{permit.overflowCount}
                        </div>
                      )}
                    </div>

                    {/* Manage Group link (only for open permits with group) */}
                    {!isFull && permit.groupAvatars.length > 0 && (
                      <button className="ml-3 text-xs font-semibold text-canopy hover:underline">
                        Manage Group
                      </button>
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      isFull
                        ? 'bg-canopy/15 text-canopy'
                        : 'bg-cairn-elevated text-[var(--text-secondary)]',
                    )}
                  >
                    {isFull ? 'FULL' : `${permit.seatsFilled}/${permit.seatsTotal} seats filled`}
                  </span>
                </div>

                {/* Spots available note for permits with open seats */}
                {!isFull && spotsLeft > 1 && (
                  <p className="mb-3 text-xs font-medium text-canopy">
                    {spotsLeft} spots available
                  </p>
                )}

                {/* View Details button */}
                <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-cairn-border py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-cairn-card-hover">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* ---- Find Permit Opportunities CTA ---- */}
        <div className="mt-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-canopy py-3.5 text-base font-semibold text-white transition-colors hover:bg-canopy-dark">
            <Search className="h-5 w-5" />
            Find Permit Opportunities
          </button>
        </div>
      </main>
    </div>
  );
}
