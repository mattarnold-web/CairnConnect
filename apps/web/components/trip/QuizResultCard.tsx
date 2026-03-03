'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Ruler, Mountain, Clock, CalendarPlus, X, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTripContext } from '@/lib/trip-context';
import { useFormat } from '@/lib/use-format';
import { Toast } from '@/components/ui/Toast';
import type { ScoredTrail } from '@/lib/trail-recommender';
import type { TripDayItem } from '@/lib/trip-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_COLORS: Record<string, string> = {
  green: '#10B981',
  blue: '#3B82F6',
  black: '#6B7280',
  double_black: '#111827',
  proline: '#7C3AED',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  green: 'Beginner',
  blue: 'Intermediate',
  black: 'Advanced',
  double_black: 'Expert',
  proline: 'Pro Line',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchColor(score: number): string {
  if (score > 70) return '#10B981';
  if (score > 40) return '#F4A261';
  return '#6B7280';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface QuizResultCardProps {
  result: ScoredTrail;
}

export function QuizResultCard({ result }: QuizResultCardProps) {
  const { trail, score, matchReasons } = result;
  const { state, dispatch } = useTripContext();
  const fmt = useFormat();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const diffColor = DIFFICULTY_COLORS[trail.difficulty] ?? '#6B7280';
  const circleColor = matchColor(score);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleAddToDay = useCallback(
    (dayId: string, dayNumber: number) => {
      const item: TripDayItem = {
        id: `item-${Date.now()}`,
        type: 'trail',
        trailId: trail.id,
        customTitle: null,
        customActivityType: null,
        notes: '',
        timeSlot: null,
      };

      dispatch({ type: 'ADD_ITEM_TO_DAY', dayId, item });
      setDropdownOpen(false);
      setToastMsg(`${trail.name} added to Day ${dayNumber}`);
      setShowToast(true);
    },
    [trail.id, trail.name, dispatch],
  );

  return (
    <>
      <Card hover={false} className="relative">
        <div className="flex items-start gap-4">
          {/* Match circle */}
          <div
            className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full border-2 font-display font-bold text-sm"
            style={{
              borderColor: circleColor,
              color: circleColor,
            }}
          >
            {score}%
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-semibold text-slate-100 line-clamp-1">
              {trail.name}
            </h3>

            {/* Difficulty badge */}
            <div className="mt-1">
              <Badge variant="difficulty" color={diffColor}>
                {DIFFICULTY_LABELS[trail.difficulty] ?? trail.difficulty}
              </Badge>
            </div>

            {/* Stats */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                {fmt.distance(trail.distance_meters)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                {fmt.elevation(trail.elevation_gain_meters)} gain
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {fmt.duration(trail.estimated_duration_minutes)}
              </span>
            </div>

            {/* Match reasons */}
            {matchReasons.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {matchReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-cairn-elevated/50 px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add to Trip dropdown */}
        <div className="mt-4 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={clsx(
              'w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
              'border-canopy/30 text-canopy hover:bg-canopy/10',
            )}
          >
            <CalendarPlus className="h-4 w-4" />
            Add to Trip
            <ChevronDown
              className={clsx(
                'h-3.5 w-3.5 transition-transform',
                dropdownOpen && 'rotate-180',
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-cairn-border bg-cairn-card shadow-xl shadow-black/30 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-cairn-border">
                <span className="text-xs font-semibold text-slate-300">Select day</span>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {state.days.length > 0 ? (
                <div className="p-1.5">
                  {state.days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => handleAddToDay(day.id, day.dayNumber)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-cairn-elevated hover:text-white transition-colors text-left"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 text-canopy shrink-0" />
                      Day {day.dayNumber}
                      {day.label ? ` \u2014 ${day.label}` : ''}
                      <span className="ml-auto text-xs text-slate-500">
                        {day.items.length} item{day.items.length !== 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-4 text-sm text-slate-500 text-center">
                  No trip days yet. Start a trip first.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Toast
        message={toastMsg}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
