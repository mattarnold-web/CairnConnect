'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ItineraryTrailCard } from '@/components/trip/ItineraryTrailCard';
import { ItineraryActivityCard } from '@/components/trip/ItineraryActivityCard';
import { MOCK_TRAILS } from '@/lib/mock-data';
import type { TripDay, TripAction, TripDayItem } from '@/lib/trip-types';

interface DayColumnProps {
  day: TripDay;
  dispatch: React.Dispatch<TripAction>;
  onAddClick: (dayId: string) => void;
  totalDays: number;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DayColumn({ day, dispatch, onAddClick, totalDays }: DayColumnProps) {
  function lookupTrail(trailId: string) {
    return MOCK_TRAILS.find((t) => t.id === trailId);
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-900">
            Day {day.dayNumber}
          </h3>
          {day.date && (
            <p className="text-xs text-gray-400">{formatDate(day.date)}</p>
          )}
        </div>

        {/* Remove day button (only if more than 1 day) */}
        {totalDays > 1 && (
          <button
            onClick={() => dispatch({ type: 'REMOVE_DAY', dayId: day.id })}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Remove Day
          </button>
        )}
      </div>

      {/* Day label input */}
      <input
        type="text"
        value={day.label}
        onChange={(e) =>
          dispatch({
            type: 'UPDATE_DAY_LABEL',
            dayId: day.id,
            label: e.target.value,
          })
        }
        placeholder="e.g. MTB Day, Rest Day..."
        className="w-full h-8 bg-white border border-gray-200 rounded-lg px-3 text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-canopy/50 transition-colors mb-3"
      />

      {/* Items list */}
      {day.items.length > 0 ? (
        <div className="space-y-2">
          {day.items.map((item, index) => {
            if (item.type === 'trail' && item.trailId) {
              const trail = lookupTrail(item.trailId);
              if (!trail) return null;

              return (
                <ItineraryTrailCard
                  key={item.id}
                  item={item}
                  trail={{
                    name: trail.name,
                    difficulty: trail.difficulty,
                    difficulty_label: trail.difficulty_label,
                    distance_meters: trail.distance_meters,
                    elevation_gain_meters: trail.elevation_gain_meters,
                    estimated_duration_minutes: trail.estimated_duration_minutes,
                    trail_type: trail.trail_type,
                  }}
                  index={index}
                  total={day.items.length}
                  onRemove={() =>
                    dispatch({
                      type: 'REMOVE_ITEM_FROM_DAY',
                      dayId: day.id,
                      itemId: item.id,
                    })
                  }
                  onMoveUp={() =>
                    dispatch({
                      type: 'REORDER_ITEM',
                      dayId: day.id,
                      fromIndex: index,
                      toIndex: index - 1,
                    })
                  }
                  onMoveDown={() =>
                    dispatch({
                      type: 'REORDER_ITEM',
                      dayId: day.id,
                      fromIndex: index,
                      toIndex: index + 1,
                    })
                  }
                  onUpdateTimeSlot={(slot: TripDayItem['timeSlot']) =>
                    dispatch({
                      type: 'UPDATE_ITEM_TIME_SLOT',
                      dayId: day.id,
                      itemId: item.id,
                      timeSlot: slot,
                    })
                  }
                  onUpdateNotes={(notes: string) =>
                    dispatch({
                      type: 'UPDATE_ITEM_NOTES',
                      dayId: day.id,
                      itemId: item.id,
                      notes,
                    })
                  }
                />
              );
            }

            if (item.type === 'custom') {
              return (
                <ItineraryActivityCard
                  key={item.id}
                  item={item}
                  index={index}
                  total={day.items.length}
                  onRemove={() =>
                    dispatch({
                      type: 'REMOVE_ITEM_FROM_DAY',
                      dayId: day.id,
                      itemId: item.id,
                    })
                  }
                  onMoveUp={() =>
                    dispatch({
                      type: 'REORDER_ITEM',
                      dayId: day.id,
                      fromIndex: index,
                      toIndex: index - 1,
                    })
                  }
                  onMoveDown={() =>
                    dispatch({
                      type: 'REORDER_ITEM',
                      dayId: day.id,
                      fromIndex: index,
                      toIndex: index + 1,
                    })
                  }
                  onUpdateTimeSlot={(slot: TripDayItem['timeSlot']) =>
                    dispatch({
                      type: 'UPDATE_ITEM_TIME_SLOT',
                      dayId: day.id,
                      itemId: item.id,
                      timeSlot: slot,
                    })
                  }
                  onUpdateNotes={(notes: string) =>
                    dispatch({
                      type: 'UPDATE_ITEM_NOTES',
                      dayId: day.id,
                      itemId: item.id,
                      notes,
                    })
                  }
                />
              );
            }

            return null;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <Plus className="h-6 w-6 text-gray-300 mb-2" />
          <p className="text-xs text-gray-400">
            Drag trails here or click Add
          </p>
        </div>
      )}

      {/* Add Activity button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-3"
        onClick={() => onAddClick(day.id)}
      >
        <Plus className="h-4 w-4" />
        Add Activity
      </Button>
    </div>
  );
}
