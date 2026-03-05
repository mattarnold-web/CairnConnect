'use client';

import { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Medal,
  Sunrise,
  Shield,
  Lock,
  Flame,
  Mountain,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

// ---------------------------------------------------------------------------
// Mock leaderboard data
// ---------------------------------------------------------------------------

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  distance: number;
  trend: 'up' | 'down' | 'neutral';
  isYou?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex T.', avatar: 'AT', distance: 95, trend: 'up' },
  { rank: 2, name: 'Jordan K.', avatar: 'JK', distance: 90, trend: 'down' },
  { rank: 3, name: 'Casey M.', avatar: 'CM', distance: 85, trend: 'neutral' },
  { rank: 4, name: 'You', avatar: 'YO', distance: 67, trend: 'up', isYou: true },
  { rank: 5, name: 'Riley S.', avatar: 'RS', distance: 65, trend: 'down' },
];

// ---------------------------------------------------------------------------
// Mock badge data
// ---------------------------------------------------------------------------

interface Badge {
  id: string;
  label: string;
  icon: React.ElementType;
  earned: boolean;
}

const BADGES: Badge[] = [
  { id: 'b1', label: '100 Mile Club', icon: Medal, earned: true },
  { id: 'b2', label: 'Early Bird', icon: Sunrise, earned: true },
  { id: 'b3', label: 'Trail Steward', icon: Shield, earned: false },
  { id: 'b4', label: 'Summit Seeker', icon: Mountain, earned: false },
  { id: 'b5', label: 'Streak Master', icon: Flame, earned: false },
];

// ---------------------------------------------------------------------------
// Helper: trend icon
// ---------------------------------------------------------------------------

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-400" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-[var(--text-tertiary)]" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChallengesPage() {
  const [joined, setJoined] = useState(false);

  const progress = 67;
  const goal = 100;
  const pct = Math.round((progress / goal) * 100);

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pt-20">
        {/* ---- Page heading ---- */}
        <div className="mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-canopy" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Monthly Challenges
          </h1>
        </div>

        {/* ---- Current Challenge Card ---- */}
        <section className="mb-6 rounded-2xl border border-cairn-border bg-cairn-card p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-canopy">
            Current Challenge
          </p>
          <h2 className="mb-1 text-lg font-bold text-[var(--text-primary)]">
            March Madness: Log 100 Miles
          </h2>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            12 days remaining
          </p>

          {/* Progress bar */}
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              {progress}/{goal} miles
            </span>
            <span className="font-semibold text-canopy">{pct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-cairn-elevated">
            <div
              className="h-full rounded-full bg-canopy transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </section>

        {/* ---- Leaderboard ---- */}
        <section className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-[var(--text-primary)]">
            Leaderboard
          </h3>

          <div className="space-y-2">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border px-4 py-3',
                  entry.isYou
                    ? 'border-canopy/40 bg-canopy/10'
                    : 'border-cairn-border bg-cairn-card',
                )}
              >
                {/* Rank */}
                <span className="w-6 text-center text-sm font-bold text-[var(--text-tertiary)]">
                  {entry.rank}
                </span>

                {/* Avatar */}
                <div
                  className={clsx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    entry.isYou
                      ? 'bg-canopy text-white'
                      : 'bg-cairn-elevated text-[var(--text-secondary)]',
                  )}
                >
                  {entry.avatar}
                </div>

                {/* Name */}
                <span
                  className={clsx(
                    'flex-1 text-sm font-medium',
                    entry.isYou
                      ? 'text-canopy'
                      : 'text-[var(--text-primary)]',
                  )}
                >
                  {entry.name}
                </span>

                {/* Distance */}
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {entry.distance} mi
                </span>

                {/* Trend */}
                <TrendIcon trend={entry.trend} />
              </div>
            ))}
          </div>
        </section>

        {/* ---- Achievement Badges ---- */}
        <section className="mb-8">
          <h3 className="mb-3 text-base font-semibold text-[var(--text-primary)]">
            Achievement Badges
          </h3>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <div
                    className={clsx(
                      'flex h-16 w-16 items-center justify-center rounded-full border',
                      badge.earned
                        ? 'border-spotlight-gold/40 bg-spotlight-gold/10'
                        : 'border-cairn-border bg-cairn-elevated',
                    )}
                  >
                    {badge.earned ? (
                      <Icon className="h-7 w-7 text-spotlight-gold" />
                    ) : (
                      <Lock className="h-5 w-5 text-[var(--text-tertiary)]" />
                    )}
                  </div>
                  <span
                    className={clsx(
                      'max-w-[5rem] text-center text-[11px] leading-tight',
                      badge.earned
                        ? 'font-medium text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)]',
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- Join Challenge CTA ---- */}
        <button
          onClick={() => setJoined(!joined)}
          className={clsx(
            'w-full rounded-xl py-3.5 text-center text-base font-semibold transition-colors',
            joined
              ? 'bg-cairn-elevated text-[var(--text-secondary)]'
              : 'bg-canopy text-white hover:bg-canopy-dark',
          )}
        >
          {joined ? 'Joined ✓' : 'Join Challenge'}
        </button>
      </main>
    </div>
  );
}
