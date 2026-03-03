'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DayColumn } from '@/components/trip/DayColumn';
import { SmartSuggestionsSidebar } from '@/components/trip/SmartSuggestionsSidebar';
import { AddTrailModal } from '@/components/trip/AddTrailModal';
import type { TripState, TripAction, TripDayItem } from '@/lib/trip-types';

interface ItineraryBuilderProps {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

export function ItineraryBuilder({ state, dispatch }: ItineraryBuilderProps) {
  const [modalDayId, setModalDayId] = useState<string | null>(null);

  const regionName = state.region?.name ?? 'Your';

  function handleAddTrail(trailId: string) {
    if (!modalDayId) return;
    const item: TripDayItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'trail',
      trailId,
      customTitle: null,
      customActivityType: null,
      notes: '',
      timeSlot: null,
    };
    dispatch({ type: 'ADD_ITEM_TO_DAY', dayId: modalDayId, item });
  }

  function handleAddCustom(title: string, activityType: string) {
    if (!modalDayId) return;
    const item: TripDayItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'custom',
      trailId: null,
      customTitle: title,
      customActivityType: activityType || null,
      notes: '',
      timeSlot: null,
    };
    dispatch({ type: 'ADD_ITEM_TO_DAY', dayId: modalDayId, item });
  }

  const hasAnyItems = state.days.some((d) => d.items.length > 0);

  return (
    <div>
      {/* Header row */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-100 mb-4">
          Plan Your {regionName} Trip
        </h2>

        {/* Trip name + date inputs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">
              Trip Name
            </label>
            <input
              type="text"
              value={state.tripName}
              onChange={(e) =>
                dispatch({ type: 'SET_TRIP_NAME', name: e.target.value })
              }
              placeholder={`My ${regionName} Trip`}
              className="w-full h-10 bg-cairn-bg border border-cairn-border rounded-xl px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-canopy/50 transition-colors"
            />
          </div>
          <div className="sm:w-48">
            <label className="block text-xs text-slate-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={state.startDate ?? ''}
              onChange={(e) =>
                dispatch({ type: 'SET_START_DATE', date: e.target.value })
              }
              className="w-full h-10 bg-cairn-bg border border-cairn-border rounded-xl px-3 text-sm text-slate-100 focus:outline-none focus:border-canopy/50 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left: Day columns */}
        <div className="flex-1 min-w-0 space-y-6">
          {state.days.map((day) => (
            <DayColumn
              key={day.id}
              day={day}
              dispatch={dispatch}
              onAddClick={(dayId) => setModalDayId(dayId)}
              totalDays={state.days.length}
            />
          ))}

          {/* Add Day button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => dispatch({ type: 'ADD_DAY' })}
          >
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        </div>

        {/* Right: Smart Suggestions Sidebar */}
        <div className="hidden lg:block w-[380px] shrink-0">
          <div className="sticky top-20">
            <SmartSuggestionsSidebar state={state} />
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-cairn-border">
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'SET_STEP', step: 'activities' })}
        >
          &larr; Back
        </Button>
        <Button
          variant="primary"
          disabled={!hasAnyItems}
          onClick={() => dispatch({ type: 'SET_STEP', step: 'summary' })}
        >
          View Summary &rarr;
        </Button>
      </div>

      {/* Add Trail Modal */}
      <AddTrailModal
        isOpen={modalDayId !== null}
        onClose={() => setModalDayId(null)}
        onAddTrail={handleAddTrail}
        onAddCustom={handleAddCustom}
        selectedActivities={state.selectedActivities}
      />
    </div>
  );
}
