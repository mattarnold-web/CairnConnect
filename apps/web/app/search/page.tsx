'use client';

import { useState } from 'react';
import {
  Search,
  ArrowLeft,
  User,
  Mountain,
  Store,
  Calendar,
  X,
  Bike,
  Footprints,
  Snowflake,
  Waves,
  Car,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

const SEARCH_RESULTS = {
  trails: [
    { name: 'Eagle Creek Trail', icon: Mountain },
    { name: "Angel's Landing", icon: Mountain },
  ],
  businesses: [
    { name: 'Mountain Gear Co.', icon: Store },
    { name: 'Summit Outfitters', icon: Store },
  ],
  users: [
    { name: 'Sarah M.', icon: User },
    { name: 'Mike T.', icon: User },
  ],
  activities: [
    { name: 'Morning Hike 3/15', icon: Calendar },
  ],
};

const DIFFICULTY_OPTIONS = ['Easy', 'Moderate', 'Hard'] as const;

interface ActivityType {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACTIVITY_TYPES: ActivityType[] = [
  { label: 'Hiking', icon: Footprints },
  { label: 'Biking', icon: Bike },
  { label: 'Running', icon: Footprints },
  { label: 'Climbing', icon: Mountain },
  { label: 'Paddleboard', icon: Waves },
  { label: 'Surfing', icon: Waves },
  { label: 'Snow', icon: Snowflake },
  { label: 'Off-road', icon: Car },
];

const INITIAL_RECENT_SEARCHES = [
  'Multnomah Falls',
  'Trail running gear',
  'Weekend hike',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [distance, setDistance] = useState(25);
  const [difficulties, setDifficulties] = useState<Set<string>>(new Set());
  const [activeActivities, setActiveActivities] = useState<Set<string>>(new Set());
  const [openNow, setOpenNow] = useState(false);
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);

  function toggleDifficulty(d: string) {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function toggleActivity(label: string) {
    setActiveActivities((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function removeRecentSearch(search: string) {
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  }

  const showDropdown = query.length > 0;

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => window.history.back()}
            className="h-9 w-9 rounded-xl bg-cairn-card border border-cairn-border flex items-center justify-center text-[var(--text-secondary)] hover:bg-cairn-card-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] flex-1">
            Explore Cairn Connect
          </h1>
          <div className="h-9 w-9 rounded-full bg-cairn-card border border-cairn-border flex items-center justify-center text-[var(--text-secondary)]">
            <User className="h-4 w-4" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trails, businesses, people..."
              className="w-full rounded-xl bg-cairn-card border border-cairn-border pl-12 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-canopy focus:ring-1 focus:ring-canopy transition-colors"
            />
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-cairn-card border border-cairn-border shadow-xl z-30 overflow-hidden">
              {/* Trails */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Trails
                </p>
              </div>
              {SEARCH_RESULTS.trails.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
                >
                  <item.icon className="h-4 w-4 text-canopy" />
                  {item.name}
                </button>
              ))}

              {/* Businesses */}
              <div className="px-4 pt-3 pb-1 border-t border-cairn-border">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Businesses
                </p>
              </div>
              {SEARCH_RESULTS.businesses.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
                >
                  <item.icon className="h-4 w-4 text-canopy" />
                  {item.name}
                </button>
              ))}

              {/* Users */}
              <div className="px-4 pt-3 pb-1 border-t border-cairn-border">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Users
                </p>
              </div>
              {SEARCH_RESULTS.users.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-cairn-elevated border border-cairn-border flex items-center justify-center">
                    <item.icon className="h-3 w-3 text-[var(--text-tertiary)]" />
                  </div>
                  {item.name}
                </button>
              ))}

              {/* Activities */}
              <div className="px-4 pt-3 pb-1 border-t border-cairn-border">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Activities
                </p>
              </div>
              {SEARCH_RESULTS.activities.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-4 py-2.5 pb-3 text-sm text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
                >
                  <item.icon className="h-4 w-4 text-canopy" />
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5 space-y-6">
          {/* Distance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-[var(--text-primary)]">Distance</label>
              <span className="text-sm text-[var(--text-secondary)]">{distance} mi</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-cairn-elevated accent-canopy cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-canopy [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-[var(--text-tertiary)]">0 mi</span>
              <span className="text-xs text-[var(--text-tertiary)]">50 mi</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Difficulty</p>
            <div className="flex flex-col gap-2">
              {DIFFICULTY_OPTIONS.map((d) => (
                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={clsx(
                      'h-5 w-5 rounded border flex items-center justify-center transition-colors',
                      difficulties.has(d)
                        ? 'bg-canopy border-canopy'
                        : 'border-cairn-border bg-cairn-elevated group-hover:border-canopy/50'
                    )}
                  >
                    {difficulties.has(d) && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-[var(--text-secondary)] cursor-pointer"
                    onClick={() => toggleDifficulty(d)}
                  >
                    {d}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={difficulties.has(d)}
                    onChange={() => toggleDifficulty(d)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Activity Type */}
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Activity Type</p>
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITY_TYPES.map((activity) => {
                const Icon = activity.icon;
                const isActive = activeActivities.has(activity.label);
                return (
                  <button
                    key={activity.label}
                    onClick={() => toggleActivity(activity.label)}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-canopy/15 border-canopy/30 text-canopy'
                        : 'bg-cairn-elevated border-cairn-border text-[var(--text-tertiary)] hover:bg-cairn-card-hover hover:text-[var(--text-secondary)]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {activity.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Open Now
            </span>
            <button
              onClick={() => setOpenNow(!openNow)}
              className={clsx(
                'relative h-6 w-11 rounded-full transition-colors',
                openNow ? 'bg-canopy' : 'bg-cairn-elevated border border-cairn-border'
              )}
            >
              <span
                className={clsx(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  openNow ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button className="w-full mt-6 rounded-xl bg-canopy hover:bg-canopy-dark px-6 py-3.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-canopy/20">
          <div className="flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </div>
        </button>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">
              Recent Searches
            </h2>
            <div className="space-y-2">
              {recentSearches.map((search) => (
                <div
                  key={search}
                  className="flex items-center justify-between rounded-xl bg-cairn-card border border-cairn-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="text-sm text-[var(--text-secondary)]">{search}</span>
                  </div>
                  <button
                    onClick={() => removeRecentSearch(search)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
