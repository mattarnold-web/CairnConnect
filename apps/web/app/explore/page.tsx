'use client';

import { useState, useMemo } from 'react';
import { Map, Mountain, Search, ChevronRight, Layers } from 'lucide-react';
import { clsx } from 'clsx';

import { Navbar } from '@/components/layout/Navbar';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { ActivityIcon, ACTIVITIES } from '@/components/ui/ActivityIcon';
import { BusinessCard } from '@/components/business/BusinessCard';
import { TrailCard } from '@/components/trail/TrailCard';
import {
  MOCK_BUSINESSES,
  MOCK_TRAILS,
  MOCK_REGION_HIGHLIGHTS,
} from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Filter activity configs
// ---------------------------------------------------------------------------

const FILTER_ACTIVITIES: { slug: string | null; label: string }[] = [
  { slug: null, label: 'All' },
  ...ACTIVITIES.map((a) => ({ slug: a.slug, label: a.label })),
];

// ---------------------------------------------------------------------------
// Fake map pins for the placeholder map
// ---------------------------------------------------------------------------

const MAP_PINS = [
  { top: '18%', left: '22%', emoji: '\u{1F6B2}', label: 'Poison Spider', spotlight: false },
  { top: '35%', left: '58%', emoji: '\u{1F9ED}', label: 'Rim Tours', spotlight: true },
  { top: '52%', left: '30%', emoji: '\u2615', label: 'Moab Diner', spotlight: false },
  { top: '25%', left: '75%', emoji: '\u{1F97E}', label: 'Delicate Arch', spotlight: false },
  { top: '65%', left: '50%', emoji: '\u{1F6B5}', label: 'Slickrock', spotlight: false },
  { top: '42%', left: '15%', emoji: '\u{1F3D5}\u{FE0F}', label: 'BLM Camp', spotlight: false },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'businesses' | 'trails'>('businesses');
  const [searchText, setSearchText] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // -- Filtered data --------------------------------------------------------

  const filteredBusinesses = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      if (searchText && !b.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (selectedActivity && !b.activity_types.includes(selectedActivity)) {
        return false;
      }
      return true;
    });
  }, [searchText, selectedActivity]);

  const filteredTrails = useMemo(() => {
    return MOCK_TRAILS.filter((t) => {
      if (searchText && !t.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (selectedActivity && !t.activity_types.includes(selectedActivity)) {
        return false;
      }
      return true;
    });
  }, [searchText, selectedActivity]);

  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <div className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* ---------------------------------------------------------------- */}
          {/* Left column: scrollable content                                   */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex-1 min-w-0 pb-24">
            {/* Search bar */}
            <div className="py-4">
              <SearchBar
                placeholder="Search businesses, trails, activities..."
                value={searchText}
                onChange={setSearchText}
              />
            </div>

            {/* Filter chips row */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
              {FILTER_ACTIVITIES.map((act) => (
                <FilterChip
                  key={act.label}
                  label={act.label}
                  icon={act.slug ? <ActivityIcon activity={act.slug} size="xs" /> : undefined}
                  active={selectedActivity === act.slug}
                  onClick={() => setSelectedActivity(act.slug)}
                />
              ))}
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-2 py-4">
              <button
                onClick={() => setActiveTab('businesses')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  activeTab === 'businesses'
                    ? 'bg-canopy/15 text-canopy'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Layers className="h-4 w-4" />
                Businesses ({filteredBusinesses.length})
              </button>
              <button
                onClick={() => setActiveTab('trails')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  activeTab === 'trails'
                    ? 'bg-canopy/15 text-canopy'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Mountain className="h-4 w-4" />
                Trails ({filteredTrails.length})
              </button>
            </div>

            {/* Content area */}
            {activeTab === 'businesses' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      No businesses match your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchText('');
                        setSelectedActivity(null);
                      }}
                      className="mt-2 text-canopy text-sm hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredTrails.length > 0 ? (
                  filteredTrails.map((trail) => (
                    <TrailCard key={trail.id} trail={trail} />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      No trails match your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchText('');
                        setSelectedActivity(null);
                      }}
                      className="mt-2 text-canopy text-sm hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right column: fake map (hidden on mobile, visible on lg+)        */}
          {/* ---------------------------------------------------------------- */}
          <div className="hidden lg:block w-[500px] shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-cairn-border bg-cairn-card overflow-hidden shadow-2xl shadow-black/20">
                {/* Map area */}
                <div className="relative h-[calc(100vh-7rem)] bg-gradient-to-br from-cairn-elevated via-[#0d2240] to-cairn-bg">
                  {/* Grid lines for map feel */}
                  <div className="absolute inset-0 opacity-10">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`h${i}`}
                        className="absolute left-0 right-0 border-t border-slate-500"
                        style={{ top: `${i * 5}%` }}
                      />
                    ))}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`v${i}`}
                        className="absolute top-0 bottom-0 border-l border-slate-500"
                        style={{ left: `${i * 5}%` }}
                      />
                    ))}
                  </div>

                  {/* Map controls overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button className="h-8 w-8 rounded-lg glass border border-cairn-border flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                      <Map className="h-4 w-4" />
                    </button>
                    <button className="h-8 w-8 rounded-lg glass border border-cairn-border flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                      <Layers className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Fake pins */}
                  {MAP_PINS.map((pin) => (
                    <div
                      key={pin.label}
                      className="absolute flex flex-col items-center"
                      style={{ top: pin.top, left: pin.left }}
                    >
                      <div
                        className={clsx(
                          'flex items-center justify-center rounded-full text-white text-sm shadow-lg',
                          pin.spotlight
                            ? 'h-10 w-10 bg-spotlight-gold/80 border-2 border-spotlight-gold spotlight-pulse'
                            : 'h-8 w-8 bg-canopy/80'
                        )}
                      >
                        {pin.emoji}
                      </div>
                      <div
                        className={clsx(
                          'mt-1 rounded-md bg-cairn-bg/80 px-1.5 py-0.5 text-[9px] backdrop-blur-sm',
                          pin.spotlight ? 'text-spotlight-gold' : 'text-slate-300'
                        )}
                      >
                        {pin.spotlight && '\u2605 '}
                        {pin.label}
                      </div>
                    </div>
                  ))}

                  {/* Region highlights card at bottom */}
                  <div className="absolute bottom-4 left-4 right-4 glass rounded-xl border border-cairn-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-sm font-semibold text-slate-200">
                        What&apos;s Hot in Moab
                      </h3>
                      <button className="text-xs text-canopy flex items-center gap-1 hover:underline">
                        See all <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                      {MOCK_REGION_HIGHLIGHTS.map((highlight) => (
                        <div
                          key={highlight.activity_slug}
                          className="flex items-center gap-2 rounded-lg bg-cairn-card/50 border border-cairn-border/50 px-3 py-2 shrink-0"
                        >
                          <ActivityIcon activity={highlight.activity_slug} size="sm" />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">
                              {highlight.activity_label}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {highlight.trail_count} trails &middot;{' '}
                              {highlight.business_count} shops
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
