'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Map, Mountain, Search, ChevronRight, Layers, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

import { Navbar } from '@/components/layout/Navbar';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { ActivityIcon, ACTIVITIES } from '@/components/ui/ActivityIcon';
import { BusinessCard } from '@/components/business/BusinessCard';
import { TrailCard } from '@/components/trail/TrailCard';
import { DynamicMap, type MapMarker, type TileLayerStyle } from '@/components/map';
import type { DbBusiness, DbTrail } from '@/lib/database-types';
import type { RegionHighlight } from '@/lib/mock-data';

const FILTER_ACTIVITIES: { slug: string | null; label: string }[] = [
  { slug: null, label: 'All' },
  ...ACTIVITIES.map((a) => ({ slug: a.slug, label: a.label })),
];

const MAP_PINS = [
  { top: '18%', left: '22%', emoji: '\u{1F6B2}', label: 'Poison Spider', spotlight: false },
  { top: '35%', left: '58%', emoji: '\u{1F9ED}', label: 'Rim Tours', spotlight: true },
  { top: '52%', left: '30%', emoji: '\u2615', label: 'Moab Diner', spotlight: false },
  { top: '25%', left: '75%', emoji: '\u{1F97E}', label: 'Delicate Arch', spotlight: false },
  { top: '65%', left: '50%', emoji: '\u{1F6B5}', label: 'Slickrock', spotlight: false },
  { top: '42%', left: '15%', emoji: '\u{1F3D5}\u{FE0F}', label: 'BLM Camp', spotlight: false },
];

interface ExploreClientProps {
  businesses: DbBusiness[];
  trails: DbTrail[];
  regionHighlights: RegionHighlight[];
}

export function ExploreClient({ businesses, trails, regionHighlights }: ExploreClientProps) {
  const [activeTab, setActiveTab] = useState<'businesses' | 'trails'>('businesses');
  const [searchText, setSearchText] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'topo' | 'satellite'>('standard');

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (searchText && !b.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (selectedActivity && !b.activity_types.includes(selectedActivity)) return false;
      return true;
    });
  }, [businesses, searchText, selectedActivity]);

  const filteredTrails = useMemo(() => {
    return trails.filter((t) => {
      if (searchText && !t.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (selectedActivity && !t.activity_types.includes(selectedActivity)) return false;
      return true;
    });
  }, [trails, searchText, selectedActivity]);

  // Build map markers from filtered trails + businesses
  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = [];
    filteredTrails.forEach((t) => {
      if (t.lat && t.lng) {
        markers.push({
          id: t.id,
          lat: t.lat,
          lng: t.lng,
          label: t.name,
          sublabel: t.difficulty,
          type: 'trail',
          href: `/trail/${t.slug}`,
        });
      }
    });
    filteredBusinesses.forEach((b) => {
      const biz = b as any;
      if (biz.lat && biz.lng) {
        markers.push({
          id: b.id,
          lat: biz.lat,
          lng: biz.lng,
          label: b.name,
          sublabel: b.category,
          type: 'business',
          href: `/business/${b.slug}`,
        });
      }
    });
    return markers;
  }, [filteredTrails, filteredBusinesses]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: scrollable content */}
          <div className="flex-1 min-w-0 pb-24">
            <div className="py-4">
              <SearchBar
                placeholder="Search businesses, trails, activities..."
                value={searchText}
                onChange={setSearchText}
              />
            </div>

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

            <div className="flex items-center gap-2 py-4">
              <button
                onClick={() => setActiveTab('businesses')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  activeTab === 'businesses'
                    ? 'bg-canopy/15 text-canopy'
                    : 'text-gray-500 hover:text-gray-800'
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
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Mountain className="h-4 w-4" />
                Trails ({filteredTrails.length})
              </button>
            </div>

            {activeTab === 'businesses' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business as any} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No businesses match your filters.</p>
                    <button
                      onClick={() => { setSearchText(''); setSelectedActivity(null); }}
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
                    <TrailCard key={trail.id} trail={trail as any} />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No trails match your filters.</p>
                    <button
                      onClick={() => { setSearchText(''); setSelectedActivity(null); }}
                      className="mt-2 text-canopy text-sm hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column: Interactive Map */}
          <div className="hidden lg:block w-[500px] shrink-0">
            <div className="sticky top-20">
              <div className="relative">
                {/* Map style controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                  {(['standard', 'topo', 'satellite'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setMapStyle(style)}
                      className={clsx(
                        'h-8 w-8 rounded-lg border flex items-center justify-center transition-colors',
                        mapStyle === style
                          ? style === 'topo' ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                            : style === 'satellite' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-canopy/20 border-canopy/40 text-canopy'
                          : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-500 hover:text-gray-800'
                      )}
                      title={`${style.charAt(0).toUpperCase() + style.slice(1)} Map`}
                    >
                      {style === 'topo' ? <Layers className="h-4 w-4" /> : style === 'satellite' ? <MapPin className="h-4 w-4" /> : <Map className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
                <DynamicMap
                  markers={mapMarkers}
                  tileStyle={mapStyle as TileLayerStyle}
                  height="calc(100vh - 7rem)"
                  fitBounds={mapMarkers.length > 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile map toggle */}
      <div className="lg:hidden fixed bottom-16 left-1/2 -translate-x-1/2 z-40">
        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-full bg-canopy px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-canopy/30"
        >
          <Map className="h-4 w-4" />
          View Map
        </Link>
      </div>
    </div>
  );
}
