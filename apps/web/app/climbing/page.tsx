'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Mountain,
  MapPin,
  Star,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';
import { FilterChip } from '@/components/ui/FilterChip';

// ---- Climbing route types ----
interface ClimbingRoute {
  id: string;
  name: string;
  grade: string;
  gradeSystem: 'yds' | 'french' | 'v_scale' | 'wi';
  type: 'sport' | 'trad' | 'boulder' | 'ice' | 'top_rope' | 'multi_pitch';
  pitches: number;
  lengthMeters: number;
  rating: number;
  reviewCount: number;
  region: string;
  cragName: string;
  lat: number;
  lng: number;
  description: string;
  bestSeason: string[];
  hazards: string[];
  protection: string;
  firstAscent: string;
}

interface ClimbingCrag {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  routeCount: number;
  gradeRange: string;
  types: string[];
  approach: string;
  description: string;
}

// ---- Mock climbing data ----
const MOCK_CRAGS: ClimbingCrag[] = [
  {
    id: 'crag_1',
    name: 'Wall Street',
    region: 'Moab, Utah',
    lat: 38.609,
    lng: -109.588,
    routeCount: 45,
    gradeRange: '5.6 - 5.13a',
    types: ['sport', 'trad'],
    approach: '5 min walk from parking',
    description: 'Iconic sandstone climbing above the Colorado River with stunning desert views.',
  },
  {
    id: 'crag_2',
    name: 'Indian Creek',
    region: 'Moab, Utah',
    lat: 38.062,
    lng: -109.553,
    routeCount: 200,
    gradeRange: '5.7 - 5.13c',
    types: ['trad'],
    approach: '10-30 min depending on wall',
    description: 'World-class crack climbing on perfect Wingate sandstone splitters.',
  },
  {
    id: 'crag_3',
    name: 'Smith Rock',
    region: 'Bend, Oregon',
    lat: 44.369,
    lng: -121.142,
    routeCount: 1800,
    gradeRange: '5.4 - 5.14d',
    types: ['sport', 'trad', 'boulder'],
    approach: '15-45 min hike',
    description: 'Birthplace of American sport climbing with volcanic tuff routes.',
  },
  {
    id: 'crag_4',
    name: 'Eldorado Canyon',
    region: 'Boulder, Colorado',
    lat: 39.931,
    lng: -105.283,
    routeCount: 500,
    gradeRange: '5.2 - 5.14a',
    types: ['trad', 'sport', 'top_rope'],
    approach: '5-30 min',
    description: 'Classic Front Range climbing on Fountain Formation sandstone and conglomerate.',
  },
  {
    id: 'crag_5',
    name: 'Hueco Tanks',
    region: 'El Paso, Texas',
    lat: 31.919,
    lng: -106.041,
    routeCount: 3000,
    gradeRange: 'V0 - V15',
    types: ['boulder'],
    approach: 'Varies by area',
    description: 'World-famous bouldering on syenite porphyry with iconic hueco features.',
  },
];

const MOCK_ROUTES: ClimbingRoute[] = [
  {
    id: 'route_1', name: 'The King', grade: '5.12a', gradeSystem: 'yds', type: 'sport',
    pitches: 1, lengthMeters: 25, rating: 4.8, reviewCount: 234, region: 'Moab, Utah',
    cragName: 'Wall Street', lat: 38.609, lng: -109.588,
    description: 'Powerful moves on pockets and crimps up slightly overhanging sandstone.',
    bestSeason: ['spring', 'fall'], hazards: ['Loose rock at top'],
    protection: 'Bolts', firstAscent: 'Jeff Pedersen, 1991',
  },
  {
    id: 'route_2', name: 'Supercrack', grade: '5.10b', gradeSystem: 'yds', type: 'trad',
    pitches: 1, lengthMeters: 30, rating: 4.9, reviewCount: 567, region: 'Moab, Utah',
    cragName: 'Indian Creek', lat: 38.062, lng: -109.553,
    description: 'The quintessential Indian Creek splitter crack. Perfect hands the entire way.',
    bestSeason: ['spring', 'fall'], hazards: [],
    protection: '#2 and #3 Camalots', firstAscent: 'Earl Wiggins, 1976',
  },
  {
    id: 'route_3', name: 'Scarface', grade: '5.14a', gradeSystem: 'yds', type: 'sport',
    pitches: 1, lengthMeters: 16, rating: 4.7, reviewCount: 189, region: 'Bend, Oregon',
    cragName: 'Smith Rock', lat: 44.369, lng: -121.142,
    description: 'A steep and technical face climb on volcanic tuff. Continuous difficulty.',
    bestSeason: ['spring', 'fall', 'winter'], hazards: [],
    protection: 'Bolts', firstAscent: 'Alan Watts, 1983',
  },
  {
    id: 'route_4', name: 'The Bastille Crack', grade: '5.7', gradeSystem: 'yds', type: 'trad',
    pitches: 5, lengthMeters: 180, rating: 4.6, reviewCount: 890, region: 'Boulder, Colorado',
    cragName: 'Eldorado Canyon', lat: 39.931, lng: -105.283,
    description: 'Classic multi-pitch that ascends the prominent crack system on the Bastille.',
    bestSeason: ['spring', 'summer', 'fall'], hazards: ['Afternoon thunderstorms in summer'],
    protection: 'Standard rack', firstAscent: 'Ray Northcutt, 1957',
  },
  {
    id: 'route_5', name: 'Midnight Lightning', grade: 'V8', gradeSystem: 'v_scale', type: 'boulder',
    pitches: 1, lengthMeters: 5, rating: 4.9, reviewCount: 1200, region: 'Yosemite, California',
    cragName: 'Camp 4 Boulders', lat: 37.741, lng: -119.604,
    description: 'The most iconic boulder problem in the world. Lightning bolt chalk mark on Columbia Boulder.',
    bestSeason: ['spring', 'fall'], hazards: ['High off the deck'],
    protection: 'Crash pads', firstAscent: 'Ron Kauk, 1978',
  },
  {
    id: 'route_6', name: 'Full Power', grade: 'V13', gradeSystem: 'v_scale', type: 'boulder',
    pitches: 1, lengthMeters: 4, rating: 4.8, reviewCount: 156, region: 'El Paso, Texas',
    cragName: 'Hueco Tanks', lat: 31.919, lng: -106.041,
    description: 'Powerful roof problem on the North Mountain. Iconic huecos.',
    bestSeason: ['fall', 'winter', 'spring'], hazards: [],
    protection: 'Crash pads', firstAscent: 'Fred Nicole, 1998',
  },
];

const ROUTE_TYPE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Sport', value: 'sport' },
  { label: 'Trad', value: 'trad' },
  { label: 'Boulder', value: 'boulder' },
  { label: 'Multi-pitch', value: 'multi_pitch' },
  { label: 'Ice', value: 'ice' },
];

const GRADE_FILTERS = [
  { label: 'All', value: null },
  { label: '5.6-5.9', value: 'beginner' },
  { label: '5.10-5.11', value: 'intermediate' },
  { label: '5.12-5.13', value: 'advanced' },
  { label: '5.14+', value: 'elite' },
  { label: 'V0-V4', value: 'v_easy' },
  { label: 'V5-V10', value: 'v_hard' },
  { label: 'V11+', value: 'v_elite' },
];

function gradeMatchesFilter(grade: string, filter: string): boolean {
  if (filter === 'beginner') return /^5\.[6-9]/.test(grade);
  if (filter === 'intermediate') return /^5\.1[01]/.test(grade);
  if (filter === 'advanced') return /^5\.1[23]/.test(grade);
  if (filter === 'elite') return /^5\.14/.test(grade);
  if (filter === 'v_easy') return /^V[0-4]$/.test(grade);
  if (filter === 'v_hard') return /^V([5-9]|10)$/.test(grade);
  if (filter === 'v_elite') return /^V1[1-9]/.test(grade) || /^V2/.test(grade);
  return true;
}

function getRouteTypeColor(type: string): string {
  const colors: Record<string, string> = {
    sport: '#3B82F6',
    trad: '#F59E0B',
    boulder: '#8B5CF6',
    ice: '#06B6D4',
    top_rope: '#10B981',
    multi_pitch: '#EF4444',
  };
  return colors[type] || '#6B7280';
}

export default function ClimbingPage() {
  const [view, setView] = useState<'routes' | 'crags' | 'topo'>('routes');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<ClimbingRoute | null>(null);

  const filteredRoutes = useMemo(() => {
    return MOCK_ROUTES.filter((r) => {
      if (selectedType && r.type !== selectedType) return false;
      if (selectedGrade && !gradeMatchesFilter(r.grade, selectedGrade)) return false;
      return true;
    });
  }, [selectedType, selectedGrade]);

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex items-center gap-3 mb-2">
          <Mountain className="h-7 w-7 text-violet-400" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
            Climbing Routes
          </h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Explore routes, crags, and topo maps for climbing areas worldwide
        </p>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: 'routes', label: 'Routes', icon: ArrowUpDown },
            { key: 'crags', label: 'Crags', icon: MapPin },
            { key: 'topo', label: 'Topo Map', icon: Layers },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key as typeof view)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                view === key ? 'bg-violet-500/15 text-violet-400' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Routes View */}
        {view === 'routes' && (
          <>
            {/* Filters */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Type</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ROUTE_TYPE_FILTERS.map((f) => (
                  <FilterChip
                    key={f.label}
                    label={f.label}
                    active={selectedType === f.value}
                    onClick={() => setSelectedType(f.value)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Grade</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADE_FILTERS.map((f) => (
                  <FilterChip
                    key={f.label}
                    label={f.label}
                    active={selectedGrade === f.value}
                    onClick={() => setSelectedGrade(f.value)}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''}
            </p>

            {/* Route list */}
            <div className="space-y-3">
              {filteredRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                  className="w-full text-left rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: `${getRouteTypeColor(route.type)}20`,
                            color: getRouteTypeColor(route.type),
                          }}
                        >
                          {route.grade}
                        </span>
                        <h3 className="font-display text-base font-semibold text-gray-900">
                          {route.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-700">{route.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="capitalize">{route.type.replace(/_/g, ' ')}</span>
                      <span>{route.cragName}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {route.region}
                      </span>
                      {route.pitches > 1 && <span>{route.pitches} pitches</span>}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedRoute?.id === route.id && (
                    <div className="border-t border-gray-200 p-4 space-y-3">
                      <p className="text-sm text-gray-500">{route.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400 block">Protection</span>
                          <span className="text-gray-800">{route.protection}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Length</span>
                          <span className="text-gray-800">{route.lengthMeters}m</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">First Ascent</span>
                          <span className="text-gray-800">{route.firstAscent}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Reviews</span>
                          <span className="text-gray-800">{route.reviewCount}</span>
                        </div>
                      </div>
                      {route.bestSeason.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {route.bestSeason.map((s) => (
                            <span key={s} className="rounded-full bg-canopy/10 border border-canopy/20 px-2.5 py-0.5 text-[10px] text-canopy capitalize">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {route.hazards.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {route.hazards.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Crags View */}
        {view === 'crags' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_CRAGS.map((crag) => (
              <div
                key={crag.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">
                  {crag.name}
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <MapPin className="h-3 w-3" />
                  {crag.region}
                </p>
                <p className="text-sm text-gray-500 mb-4">{crag.description}</p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-gray-400 block">Routes</span>
                    <span className="text-gray-800 font-medium">{crag.routeCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Grades</span>
                    <span className="text-gray-800 font-medium">{crag.gradeRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Approach</span>
                    <span className="text-gray-800 font-medium">{crag.approach}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Types</span>
                    <span className="text-gray-800 font-medium capitalize">
                      {crag.types.join(', ')}
                    </span>
                  </div>
                </div>
                <Link
                  href="/climbing"
                  className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  View routes <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Topo Map View */}
        {view === 'topo' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Topo map visualization */}
            <div className="flex-1">
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="relative h-[500px] bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                  {/* Topographic contour lines */}
                  <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full opacity-30">
                    {/* Contour lines */}
                    <path d="M0 450 Q200 420 400 440 Q600 460 800 430" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.6" />
                    <path d="M0 400 Q150 360 350 380 Q550 400 750 370 L800 375" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" />
                    <path d="M0 350 Q200 300 400 320 Q600 340 800 300" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" />
                    <path d="M50 300 Q200 250 380 270 Q560 290 750 250" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.35" />
                    <path d="M100 250 Q250 200 400 220 Q550 240 700 200" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
                    <path d="M150 200 Q300 150 450 170 Q600 190 700 155" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.25" />
                    <path d="M200 160 Q350 110 500 130 Q620 148 680 120" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.2" />
                    {/* Ridge line */}
                    <path d="M200 140 Q350 80 500 100 Q600 115 650 90" fill="none" stroke="#F4A261" strokeWidth="2" opacity="0.5" strokeDasharray="6 3" />
                    {/* Cliff face */}
                    <rect x="280" y="170" width="200" height="120" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 2" rx="4" />
                    <text x="380" y="235" textAnchor="middle" fill="#EF4444" fontSize="11" opacity="0.7">CLIFF FACE</text>
                    {/* Elevation markers */}
                    <text x="30" y="455" fill="#8B5CF6" fontSize="9" opacity="0.5">6,200 ft</text>
                    <text x="30" y="355" fill="#8B5CF6" fontSize="9" opacity="0.5">6,800 ft</text>
                    <text x="30" y="255" fill="#8B5CF6" fontSize="9" opacity="0.5">7,400 ft</text>
                    <text x="30" y="165" fill="#8B5CF6" fontSize="9" opacity="0.5">8,000 ft</text>
                  </svg>

                  {/* Route markers */}
                  {MOCK_ROUTES.slice(0, 4).map((route, i) => {
                    const positions = [
                      { top: '40%', left: '38%' },
                      { top: '35%', left: '52%' },
                      { top: '45%', left: '45%' },
                      { top: '38%', left: '60%' },
                    ];
                    const pos = positions[i];
                    return (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                        className="absolute flex flex-col items-center group"
                        style={pos}
                      >
                        <div
                          className={clsx(
                            'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shadow-lg transition-transform group-hover:scale-125',
                            selectedRoute?.id === route.id ? 'scale-125' : ''
                          )}
                          style={{
                            backgroundColor: `${getRouteTypeColor(route.type)}CC`,
                            borderColor: getRouteTypeColor(route.type),
                          }}
                        >
                          {i + 1}
                        </div>
                        <div className="mt-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] text-gray-700 backdrop-blur-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {route.name} ({route.grade})
                        </div>
                      </button>
                    );
                  })}

                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 p-3 text-[10px] space-y-1.5">
                    <p className="font-semibold text-gray-700 mb-1">Legend</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                      <span className="text-gray-500">Sport</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                      <span className="text-gray-500">Trad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#8B5CF6]" />
                      <span className="text-gray-500">Boulder</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2 border-t border-dashed border-[#F4A261]" />
                      <span>Ridge</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2 border-t border-[#8B5CF6] opacity-40" />
                      <span>Contour</span>
                    </div>
                  </div>

                  {/* Map controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="h-8 w-8 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 text-lg font-bold">
                      +
                    </button>
                    <button className="h-8 w-8 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 text-lg font-bold">
                      -
                    </button>
                  </div>

                  <div className="absolute top-4 left-4 text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 px-3 py-2">
                    <span className="font-display font-semibold text-violet-400">Topo View</span>
                    <span className="text-gray-400 ml-2">Wall Street Area</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route detail sidebar */}
            <div className="lg:w-80 shrink-0 space-y-3">
              <h3 className="font-display text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Routes in View
              </h3>
              {MOCK_ROUTES.slice(0, 4).map((route, i) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                  className={clsx(
                    'w-full text-left rounded-xl border p-3 transition-colors',
                    selectedRoute?.id === route.id
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: getRouteTypeColor(route.type) }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{route.name}</span>
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: getRouteTypeColor(route.type) }}
                    >
                      {route.grade}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 capitalize">
                    {route.type.replace(/_/g, ' ')} &middot; {route.lengthMeters}m
                    {route.pitches > 1 ? ` &middot; ${route.pitches}P` : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
