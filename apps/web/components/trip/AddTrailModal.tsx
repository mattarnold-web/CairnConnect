'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { MOCK_TRAILS } from '@/lib/mock-data';
import { useFormat } from '@/lib/use-format';

const DIFFICULTY_COLORS: Record<string, string> = {
  green: '#10B981',
  blue: '#3B82F6',
  black: '#6B7280',
  double_black: '#111827',
  proline: '#7C3AED',
};

const ACTIVITY_LABELS: Record<string, string> = {
  mtb: 'Mountain Biking',
  hiking: 'Hiking',
  trail_running: 'Trail Running',
  climbing: 'Rock Climbing',
  road_cycling: 'Road Cycling',
  camping: 'Camping',
  kayaking: 'Kayaking',
  whitewater: 'Whitewater Rafting',
  standup_paddle: 'Paddleboard',
};

interface AddTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrail: (trailId: string) => void;
  onAddCustom: (title: string, activityType: string) => void;
  selectedActivities: string[];
}

export function AddTrailModal({
  isOpen,
  onClose,
  onAddTrail,
  onAddCustom,
  selectedActivities,
}: AddTrailModalProps) {
  const fmt = useFormat();
  const [activeTab, setActiveTab] = useState<'trails' | 'custom'>('trails');
  const [search, setSearch] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customActivityType, setCustomActivityType] = useState('');

  if (!isOpen) return null;

  // Filter trails by search text and selected activity types
  const filteredTrails = MOCK_TRAILS.filter((trail) => {
    const matchesSearch =
      !search ||
      trail.name.toLowerCase().includes(search.toLowerCase());
    const matchesActivity =
      selectedActivities.length === 0 ||
      trail.activity_types.some((at: string) =>
        selectedActivities.includes(at)
      );
    return matchesSearch && matchesActivity;
  });

  function handleAddTrail(trailId: string) {
    onAddTrail(trailId);
    setSearch('');
    onClose();
  }

  function handleAddCustom() {
    if (!customTitle.trim()) return;
    onAddCustom(customTitle.trim(), customActivityType || selectedActivities[0] || '');
    setCustomTitle('');
    setCustomActivityType('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-display text-lg font-semibold text-gray-900">
            Add to Day
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('trails')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'trails'
                ? 'text-canopy border-b-2 border-canopy'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Trails
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'text-canopy border-b-2 border-canopy'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Custom Activity
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'trails' ? (
            <div className="space-y-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search trails..."
              />

              <div className="space-y-2 mt-3">
                {filteredTrails.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No trails found matching your search
                  </p>
                ) : (
                  filteredTrails.map((trail) => (
                    <div
                      key={trail.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-cairn-elevated transition-colors"
                    >
                      {/* Difficulty dot */}
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            DIFFICULTY_COLORS[trail.difficulty] || '#6B7280',
                        }}
                      />

                      {/* Trail info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {trail.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>{fmt.distance(trail.distance_meters)}</span>
                          <span>&middot;</span>
                          <span>{fmt.elevation(trail.elevation_gain_meters)} gain</span>
                        </div>
                      </div>

                      {/* Add button */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddTrail(trail.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Custom activity name */}
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Sunrise photography, Rest day, Resupply..."
                  className="w-full h-10 bg-white border border-gray-200 rounded-xl px-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-canopy/50 transition-colors"
                />
              </div>

              {/* Activity type selector */}
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">
                  Activity Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedActivities.map((slug) => (
                    <FilterChip
                      key={slug}
                      label={ACTIVITY_LABELS[slug] || slug}
                      active={customActivityType === slug}
                      onClick={() =>
                        setCustomActivityType(
                          customActivityType === slug ? '' : slug
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Add button */}
              <Button
                variant="primary"
                className="w-full mt-2"
                disabled={!customTitle.trim()}
                onClick={handleAddCustom}
              >
                Add Activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
