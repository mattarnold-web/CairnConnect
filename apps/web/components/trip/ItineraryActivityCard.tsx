'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { TripDayItem } from '@/lib/trip-types';

const TIME_SLOTS: { value: TripDayItem['timeSlot']; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

interface ItineraryActivityCardProps {
  item: TripDayItem;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateTimeSlot: (slot: TripDayItem['timeSlot']) => void;
  onUpdateNotes: (notes: string) => void;
}

export function ItineraryActivityCard({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateTimeSlot,
  onUpdateNotes,
}: ItineraryActivityCardProps) {
  const [showNotes, setShowNotes] = useState(!!item.notes);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      {/* Top row: icon, title, reorder, trash */}
      <div className="flex items-center gap-2">
        <ActivityIcon activity={item.customActivityType || ''} size="sm" className="shrink-0" />

        <span className="font-medium text-gray-900 text-sm truncate flex-1">
          {item.customTitle || 'Custom Activity'}
        </span>

        {/* Reorder arrows */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Trash button */}
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors shrink-0"
          aria-label="Remove activity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Time slot selector */}
      <div className="flex items-center gap-1.5 mt-3">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot.value}
            onClick={() =>
              onUpdateTimeSlot(item.timeSlot === slot.value ? null : slot.value)
            }
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              item.timeSlot === slot.value
                ? 'bg-canopy/20 text-canopy border border-canopy/30'
                : 'bg-gray-100 text-gray-400 border border-transparent hover:text-gray-700'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Notes */}
      {!showNotes ? (
        <button
          onClick={() => setShowNotes(true)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add notes
        </button>
      ) : (
        <textarea
          value={item.notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="mt-2 w-full bg-white border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-300 p-2 resize-none focus:outline-none focus:border-canopy/50 transition-colors"
        />
      )}
    </div>
  );
}
