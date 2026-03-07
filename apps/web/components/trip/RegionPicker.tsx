'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { MOCK_REGIONS } from '@/lib/mock-data';
import type { TripAction, TripRegion } from '@/lib/trip-types';

const CONTINENT_ORDER = ['North America', 'Oceania', 'Europe'];

interface RegionPickerProps {
  dispatch: React.Dispatch<TripAction>;
}

export function RegionPicker({ dispatch }: RegionPickerProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof MOCK_REGIONS>();
    for (const region of MOCK_REGIONS) {
      const list = map.get(region.continent) ?? [];
      list.push(region);
      map.set(region.continent, list);
    }
    return CONTINENT_ORDER
      .filter((c) => map.has(c))
      .map((continent) => ({ continent, regions: map.get(continent)! }));
  }, []);

  function handleSelect(region: typeof MOCK_REGIONS[number]) {
    if (!region.hasData) return;

    const tripRegion: TripRegion = {
      slug: region.slug,
      name: region.name,
      state_province: region.state_province,
      country: region.country,
      continent: region.continent,
      description: region.description,
      coverEmoji: region.coverEmoji,
      trailCount: region.trailCount,
      businessCount: region.businessCount,
      hasData: region.hasData,
    };

    dispatch({ type: 'SET_REGION', region: tripRegion });
    dispatch({ type: 'SET_STEP', step: 'activities' });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
        Where are you headed?
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Pick a destination to start planning your trip
      </p>

      <div className="space-y-8">
        {grouped.map(({ continent, regions }) => (
          <section key={continent}>
            <h3 className="font-display text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {continent}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {regions.map((region) => (
                <Card
                  key={region.slug}
                  hover={region.hasData}
                  className={`relative ${
                    region.hasData
                      ? 'border-l-2 border-l-canopy'
                      : 'opacity-50 cursor-default'
                  }`}
                  onClick={() => handleSelect(region)}
                >
                  {!region.hasData && (
                    <span className="absolute top-3 right-3 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      Coming Soon
                    </span>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="text-4xl leading-none shrink-0">
                      {region.coverEmoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-gray-900">
                        {region.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {region.state_province}, {region.country}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {region.description}
                      </p>
                      {region.hasData && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-canopy">
                          <span>{region.trailCount} trails</span>
                          <span>{region.businessCount} businesses</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
