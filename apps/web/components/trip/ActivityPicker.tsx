'use client';

import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { ActivityIcon, LAND_ACTIVITIES, WATER_ACTIVITIES } from '@/components/ui/ActivityIcon';
import { MOCK_REGION_HIGHLIGHTS } from '@/lib/mock-data';
import type { TripAction, TripState } from '@/lib/trip-types';

const ACTIVITY_GROUPS = [
  { label: 'Mountain & Land', items: LAND_ACTIVITIES },
  { label: 'Water', items: WATER_ACTIVITIES },
];

interface ActivityPickerProps {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

export function ActivityPicker({ state, dispatch }: ActivityPickerProps) {
  const regionName = state.region?.name ?? 'this region';

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">
        What do you want to do in {regionName}?
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Select the activities you&apos;re planning
      </p>

      {/* Activity groups */}
      <div className="space-y-6">
        {ACTIVITY_GROUPS.map((group) => (
          <section key={group.label}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((activity) => (
                <FilterChip
                  key={activity.slug}
                  label={activity.label}
                  icon={<ActivityIcon activity={activity.slug} size="xs" />}
                  active={state.selectedActivities.includes(activity.slug)}
                  onClick={() =>
                    dispatch({
                      type: 'TOGGLE_ACTIVITY',
                      activitySlug: activity.slug,
                    })
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Popular in region callout */}
      <div className="mt-8 rounded-xl bg-cairn-elevated/30 border border-cairn-border p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Popular in {regionName}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MOCK_REGION_HIGHLIGHTS.slice(0, 4).map((h) => (
            <div
              key={h.activity_slug}
              className="flex items-center gap-2 text-sm text-slate-400"
            >
              <ActivityIcon activity={h.activity_slug} size="sm" />
              <div className="min-w-0">
                <p className="text-slate-300 text-xs font-medium truncate">
                  {h.activity_label}
                </p>
                <p className="text-xs text-slate-500">
                  {h.trail_count} trails &middot; {h.business_count} businesses
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'SET_STEP', step: 'region' })}
        >
          &larr; Back
        </Button>
        <Button
          variant="primary"
          disabled={state.selectedActivities.length === 0}
          onClick={() => dispatch({ type: 'SET_STEP', step: 'itinerary' })}
        >
          Continue &rarr;
        </Button>
      </div>
    </div>
  );
}
