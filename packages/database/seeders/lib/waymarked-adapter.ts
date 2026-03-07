/**
 * Waymarked Trails Source Adapter
 * ================================
 * Fetches curated hiking/cycling routes from the Waymarked Trails API.
 * These are official, signed, long-distance trails (GR routes, national trails, etc.)
 *
 * API docs: https://hiking.waymarkedtrails.org/api/v1
 */

import type { TrailSourceAdapter, NormalizedTrail, CityConfig } from './trail-normalizer';
import { generateSlug } from './trail-normalizer';

const HIKING_API = 'https://hiking.waymarkedtrails.org/api/v1';
const CYCLING_API = 'https://cycling.waymarkedtrails.org/api/v1';
const MTB_API = 'https://mtb.waymarkedtrails.org/api/v1';

const DELAY_MS = 1500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mapDifficulty(osmSac: string | undefined): NormalizedTrail['difficulty'] {
  if (!osmSac) return null;
  switch (osmSac) {
    case 'hiking': case 'T1': return 'green';
    case 'mountain_hiking': case 'T2': return 'blue';
    case 'demanding_mountain_hiking': case 'T3': return 'black';
    case 'alpine_hiking': case 'T4': return 'double_black';
    case 'demanding_alpine_hiking': case 'T5': case 'T6': return 'proline';
    default: return null;
  }
}

async function fetchRoutes(apiBase: string, bbox: string, limit = 50): Promise<any[]> {
  try {
    const res = await fetch(`${apiBase}/list/search?bbox=${bbox}&limit=${limit}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? data ?? [];
  } catch {
    return [];
  }
}

function bboxFromCity(city: CityConfig): string {
  const delta = city.radius_km / 111; // rough degrees
  return `${city.lng - delta},${city.lat - delta},${city.lng + delta},${city.lat + delta}`;
}

export const waymarkedAdapter: TrailSourceAdapter = {
  name: 'waymarked',

  async fetchTrails(city: CityConfig): Promise<NormalizedTrail[]> {
    const bbox = bboxFromCity(city);
    const trails: NormalizedTrail[] = [];
    const seen = new Set<string>();

    // Fetch from all three APIs (hiking, cycling, MTB)
    const sources = [
      { api: HIKING_API, types: ['hiking', 'trail_running'] },
      { api: CYCLING_API, types: ['road_cycling', 'gravel_biking'] },
      { api: MTB_API, types: ['mtb'] },
    ];

    for (const { api, types } of sources) {
      const routes = await fetchRoutes(api, bbox);

      for (const route of routes) {
        const eid = `wmt-${route.id ?? route.osm_id}`;
        if (seen.has(eid)) continue;
        seen.add(eid);

        const name = route.name ?? route.ref ?? `Route ${route.id}`;
        if (!name || name.length < 2) continue;

        trails.push({
          name,
          slug: generateSlug(name, 'wmt', String(route.id ?? route.osm_id)),
          description: route.description ?? null,
          activity_types: types,
          difficulty: mapDifficulty(route.sac_scale),
          difficulty_label: route.sac_scale ?? null,
          distance_meters: route.length ? route.length * 1000 : null,
          elevation_gain_meters: route.ascent ?? null,
          elevation_loss_meters: route.descent ?? null,
          trail_type: route.roundtrip ? 'loop' : 'point_to_point',
          surface_type: [],
          lat: route.lat ?? city.lat,
          lng: route.lon ?? city.lng,
          route_geojson: null,
          city: city.name,
          state_province: city.state_province,
          country: city.country,
          country_code: city.country_code,
          best_seasons: [],
          source: 'waymarked',
          external_id: eid,
          cover_photo_url: null,
          photos: [],
        });
      }

      await sleep(DELAY_MS);
    }

    return trails;
  },
};

