'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Clock, Mountain, Ruler, ArrowUpDown } from 'lucide-react';
import { TripDayItem } from '@/lib/trip-types';
import { useFormat } from '@/lib/use-format';

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

const TIME_SLOTS: { value: TripDayItem['timeSlot']; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

interface ItineraryTrailCardProps {
  item: TripDayItem;
  trail: {
    name: string;
    difficulty?: string;
    difficulty_label?: string;
    distance_meters?: number;
    elevation_gain_meters?: number;
    estimated_duration_minutes?: number | null;
    trail_type?: string;
  };
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateTimeSlot: (slot: TripDayItem['timeSlot']) => void;
  onUpdateNotes: (notes: string) => void;
}

export function ItineraryTrailCard({
  item,
  trail,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateTimeSlot,
  onUpdateNotes,
}: ItineraryTrailCardProps) {
  const fmt = useFormat();
  const [showNotes, setShowNotes] = useState(!!item.notes);

  const diffColor = trail.difficulty
    ? DIFFICULTY_COLORS[trail.difficulty] || '#6B7280'
    : '#6B7280';
  const diffLabel = trail.difficulty
    ? DIFFICULTY_LABELS[trail.difficulty] || trail.difficulty_label || trail.difficulty
    : '';

  return (
    <div className="bg-cairn-card rounded-xl border border-cairn-border p-3">
      {/* Top row: difficulty, name, reorder, trash */}
      <div className="flex items-center gap-2">
        {/* Difficulty badge */}
        {trail.difficulty && (
          <span className="flex items-center gap-1.5 shrink-0">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: diffColor }}
            />
            <span className="text-xs text-slate-400">{diffLabel}</span>
          </span>
        )}

        {/* Trail name */}
        <span className="font-medium text-slate-100 text-sm truncate flex-1">
          {trail.name}
        </span>

        {/* Reorder arrows */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded hover:bg-cairn-elevated text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-cairn-elevated text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Trash button */}
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors shrink-0"
          aria-label="Remove trail"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
        {trail.distance_meters != null && (
          <span className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            {fmt.distance(trail.distance_meters)}
          </span>
        )}
        {trail.elevation_gain_meters != null && (
          <span className="flex items-center gap-1">
            <Mountain className="h-3 w-3" />
            {fmt.elevation(trail.elevation_gain_meters)} gain
          </span>
        )}
        {trail.estimated_duration_minutes != null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {fmt.duration(trail.estimated_duration_minutes)}
          </span>
        )}
        {trail.trail_type && (
          <span className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            {trail.trail_type.replace(/_/g, ' ')}
          </span>
        )}
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
                : 'bg-cairn-elevated/50 text-slate-500 border border-transparent hover:text-slate-300'
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
          className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          + Add notes
        </button>
      ) : (
        <textarea
          value={item.notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="mt-2 w-full bg-cairn-bg border border-cairn-border rounded-lg text-xs text-slate-300 placeholder:text-slate-600 p-2 resize-none focus:outline-none focus:border-canopy/50 transition-colors"
        />
      )}
    </div>
  );
}
