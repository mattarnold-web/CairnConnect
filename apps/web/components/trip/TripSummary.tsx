'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SuggestionCard } from '@/components/trip/SuggestionCard';
import { CostBreakdown } from '@/components/trip/CostBreakdown';
import { ShareTripButton } from '@/components/trip/ShareTripButton';
import { PhotoGallery } from '@/components/activity/PhotoGallery';
import { ActivityIcon, getActivityLabel } from '@/components/ui/ActivityIcon';
import { useFormat } from '@/lib/use-format';
import { MOCK_TRAILS } from '@/lib/mock-data';
import {
  generateSuggestions,
  SUGGESTION_CATEGORY_ORDER,
  SUGGESTION_CATEGORY_LABELS,
} from '@/lib/trip-suggestions';
import type { TripState, TripAction } from '@/lib/trip-types';

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


const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateRange(days: TripState['days']): string {
  const dated = days.filter((d) => d.date);
  if (dated.length === 0) return '';
  const first = formatDate(dated[0].date!);
  const last = formatDate(dated[dated.length - 1].date!);
  return first === last ? first : `${first} \u2013 ${last}`;
}

interface TripSummaryProps {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  readOnly?: boolean;
}

export function TripSummary({ state, dispatch, readOnly }: TripSummaryProps) {
  const fmt = useFormat();
  const suggestions = useMemo(() => generateSuggestions(state), [state]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalTrails = 0;
    let totalDistance = 0;
    let totalElevation = 0;
    let totalDuration = 0;

    for (const day of state.days) {
      for (const item of day.items) {
        if (item.type === 'trail' && item.trailId) {
          const trail = MOCK_TRAILS.find((t) => t.id === item.trailId);
          if (trail) {
            totalTrails++;
            totalDistance += trail.distance_meters;
            totalElevation += trail.elevation_gain_meters;
            totalDuration += trail.estimated_duration_minutes ?? 0;
          }
        }
      }
    }

    return {
      totalTrails,
      totalDistance,
      totalElevation,
      totalDuration,
      tripDays: state.days.length,
    };
  }, [state]);

  const regionName = state.region?.name ?? 'Unknown';
  const tripName = state.tripName || `My ${regionName} Trip`;
  const dateRange = formatDateRange(state.days);

  // Group suggestions by category for the Recommended Services section
  const grouped = SUGGESTION_CATEGORY_ORDER.map((category) => ({
    category,
    label: SUGGESTION_CATEGORY_LABELS[category],
    items: suggestions.filter((s) => s.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Trip header card */}
      <div className="rounded-2xl bg-cairn-card border border-cairn-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-100">
              {tripName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-sm text-slate-400">{regionName}</span>
              {dateRange && (
                <>
                  <span className="text-slate-600">&middot;</span>
                  <span className="text-sm text-slate-400">{dateRange}</span>
                </>
              )}
            </div>
          </div>
          {!readOnly && <ShareTripButton state={state} />}
        </div>
        {/* Activity type badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {state.selectedActivities.map((slug) => (
            <Badge key={slug}>
              <span className="inline-flex items-center gap-1.5">
                <ActivityIcon activity={slug} size="xs" />
                {getActivityLabel(slug)}
              </span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card hover={false}>
          <p className="font-display text-2xl text-canopy font-bold">
            {stats.totalTrails}
          </p>
          <p className="text-xs text-slate-500">Total Trails</p>
        </Card>
        <Card hover={false}>
          <p className="font-display text-2xl text-canopy font-bold">
            {fmt.distance(stats.totalDistance)}
          </p>
          <p className="text-xs text-slate-500">Total Distance</p>
        </Card>
        <Card hover={false}>
          <p className="font-display text-2xl text-canopy font-bold">
            {fmt.elevation(stats.totalElevation)}
          </p>
          <p className="text-xs text-slate-500">Total Elevation Gain</p>
        </Card>
        {stats.totalDuration > 0 && (
          <Card hover={false}>
            <p className="font-display text-2xl text-canopy font-bold">
              {fmt.duration(stats.totalDuration)}
            </p>
            <p className="text-xs text-slate-500">Est. Total Time</p>
          </Card>
        )}
        <Card hover={false}>
          <p className="font-display text-2xl text-canopy font-bold">
            {stats.tripDays}
          </p>
          <p className="text-xs text-slate-500">Trip Days</p>
        </Card>
      </div>

      {/* Day-by-day breakdown */}
      <div className="space-y-6">
        <h3 className="font-display text-lg font-semibold text-slate-100">
          Day-by-Day
        </h3>
        {state.days.map((day) => (
          <div
            key={day.id}
            className="rounded-2xl bg-cairn-card border border-cairn-border p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <h4 className="font-display font-semibold text-slate-100">
                Day {day.dayNumber}
                {day.label && (
                  <span className="text-slate-400 font-normal">
                    {' '}
                    &mdash; {day.label}
                  </span>
                )}
              </h4>
              {day.date && (
                <span className="text-xs text-slate-500">
                  {formatDate(day.date)}
                </span>
              )}
            </div>

            {day.items.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No activities planned</p>
            ) : (
              <div className="space-y-3">
                {day.items.map((item) => {
                  if (item.type === 'trail' && item.trailId) {
                    const trail = MOCK_TRAILS.find(
                      (t) => t.id === item.trailId
                    );
                    if (!trail) return null;

                    const diffColor =
                      DIFFICULTY_COLORS[trail.difficulty] || '#6B7280';
                    const diffLabel =
                      DIFFICULTY_LABELS[trail.difficulty] ||
                      trail.difficulty_label ||
                      '';

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-cairn-bg/50"
                      >
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0 mt-1.5"
                          style={{ backgroundColor: diffColor }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100">
                            {trail.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{diffLabel}</span>
                            <span>&middot;</span>
                            <span>
                              {fmt.distance(trail.distance_meters)}
                            </span>
                            {item.timeSlot && (
                              <>
                                <span>&middot;</span>
                                <span className="text-canopy">
                                  {TIME_SLOT_LABELS[item.timeSlot]}
                                </span>
                              </>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-slate-400 mt-1 italic">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (item.type === 'custom') {
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-cairn-bg/50"
                      >
                        <ActivityIcon
                          activity={item.customActivityType || ''}
                          size="sm"
                          className="shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100">
                            {item.customTitle || 'Custom Activity'}
                          </p>
                          {item.timeSlot && (
                            <p className="text-xs text-canopy mt-0.5">
                              {TIME_SLOT_LABELS[item.timeSlot]}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-slate-400 mt-1 italic">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Trip Gallery */}
      <section>
        <h3 className="font-display text-lg font-semibold text-slate-100 mb-3">
          Trip Gallery
        </h3>
        <PhotoGallery filterTripId={state.tripName || undefined} />
      </section>

      {/* Cost Breakdown */}
      <CostBreakdown state={state} />

      {/* Recommended Services */}
      {grouped.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-slate-100">
            Recommended Services
          </h3>
          {grouped.map((group) => (
            <section key={group.category}>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.label}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-6 border-t border-cairn-border">
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: 'SET_STEP', step: 'itinerary' })}
          >
            Edit Trip
          </Button>
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: 'RESET' })}
          >
            Start New Trip
          </Button>
        </div>
      )}
    </div>
  );
}
