'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, CalendarPlus, X } from 'lucide-react';
import { useTripContext } from '@/lib/trip-context';
import { Toast } from '@/components/ui/Toast';
import type { TripDayItem } from '@/lib/trip-types';

interface AddToTripButtonProps {
  trailId?: string;
  trailName?: string;
  customTitle?: string;
  activityType?: string;
}

export function AddToTripButton({
  trailId,
  trailName,
  customTitle,
  activityType,
}: AddToTripButtonProps) {
  const { state, dispatch } = useTripContext();
  const [open, setOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasTrip = state.region !== null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleAddToDay = useCallback(
    (dayId: string, dayNumber: number) => {
      const item: TripDayItem = {
        id: `item-${Date.now()}`,
        type: trailId ? 'trail' : 'custom',
        trailId: trailId || null,
        customTitle: customTitle || null,
        customActivityType: activityType || null,
        notes: '',
        timeSlot: null,
      };

      dispatch({ type: 'ADD_ITEM_TO_DAY', dayId, item });
      setOpen(false);

      const label = trailName || customTitle || 'Activity';
      setToastMsg(`${label} added to Day ${dayNumber}`);
      setShowToast(true);
    },
    [trailId, trailName, customTitle, activityType, dispatch],
  );

  return (
    <>
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50" ref={popoverRef}>
        {/* Popover */}
        {open && (
          <div className="absolute bottom-16 right-0 w-64 rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-800">Add to Trip</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {hasTrip ? (
              <div className="p-2">
                {state.days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleAddToDay(day.id, day.dayNumber)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-white transition-colors text-left"
                  >
                    <CalendarPlus className="h-4 w-4 text-canopy shrink-0" />
                    <span>
                      Day {day.dayNumber}
                      {day.label ? ` — ${day.label}` : ''}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {day.items.length} item{day.items.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  No active trip yet.
                </p>
                <Link
                  href="/trip"
                  className="inline-flex items-center gap-2 rounded-xl bg-canopy px-4 py-2 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Start a Trip
                </Link>
              </div>
            )}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full bg-canopy px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-canopy/30 hover:bg-canopy-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add to Trip
        </button>
      </div>

      <Toast
        message={toastMsg}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
