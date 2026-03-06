/**
 * OSM Trail Seeder
 * ================
 * Queries the Overpass API for hiking paths, MTB routes, and cycling routes
 * around each anchor city, then upserts them into the CairnConnect `trails`
 * table via the Supabase client.
 *
 * Usage:
 *   npx tsx packages/database/seeders/seed-trails-osm.ts
 *
 * Environment variables (required):
 *   SUPABASE_URL       — Your Supabase project URL
 *   SUPABASE_SERVICE_KEY — Service-role key (bypasses RLS for inserts)
 *
 * Rate limiting:
 *   The Overpass API is rate-limited. This script waits 2 000 ms between
 *   requests and retries with exponential back-off on 429 / 5xx.
 */

import { createClient } from '@supabase/supabase-js';
import { ANCHOR_CITIES, type AnchorCity } from '@cairn/shared/constants/anchorCities';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const REQUEST_DELAY_MS = 2_000;
const MAX_RETRIES = 3;
const BATCH_SIZE = 50;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface TrailInsert {
  name: string;
  slug: string;
  description: string | null;
  activity_types: string[];
  difficulty: string | null;
  difficulty_label: string | null;
  distance_meters: number | null;
  elevation_gain_meters: number | null;
  trail_type: string | null;
  surface_type: string[];
  start_point: string | null; // WKT for PostGIS
  route_geojson: object | null;
  city: string;
  state_province: string;
  country: string;
  country_code: string;
  source: string;
  external_id: string;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Overpass Queries
// ---------------------------------------------------------------------------

/** Build an Overpass QL query for trails around a city center. */
function buildOverpassQuery(city: AnchorCity): string {
  const radiusM = city.radius_km * 1000;
  return `
[out:json][timeout:60];
(
  // Hiking paths
  way["highway"="path"]["sac_scale"](around:${radiusM},${city.lat},${city.lng});
  way["highway"="footway"]["name"](around:${radiusM},${city.lat},${city.lng});
  relation["route"="hiking"]["name"](around:${radiusM},${city.lat},${city.lng});

  // MTB trails
  way["highway"="path"]["mtb:scale"](around:${radiusM},${city.lat},${city.lng});
  way["highway"="track"]["mtb:scale"](around:${radiusM},${city.lat},${city.lng});
  relation["route"="mtb"]["name"](around:${radiusM},${city.lat},${city.lng});

  // Cycling routes
  relation["route"="bicycle"]["name"](around:${radiusM},${city.lat},${city.lng});
  way["highway"="cycleway"]["name"](around:${radiusM},${city.lat},${city.lng});
);
out center geom tags;
`.trim();
}

// ---------------------------------------------------------------------------
// Overpass API Client
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryOverpass(query: string, retries = 0): Promise<OverpassResponse> {
  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (response.status === 429 || response.status >= 500) {
      if (retries < MAX_RETRIES) {
        const backoff = REQUEST_DELAY_MS * Math.pow(2, retries);
        console.warn(`  Overpass returned ${response.status}, retrying in ${backoff}ms...`);
        await sleep(backoff);
        return queryOverpass(query, retries + 1);
      }
      throw new Error(`Overpass API returned ${response.status} after ${MAX_RETRIES} retries`);
    }

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as OverpassResponse;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const backoff = REQUEST_DELAY_MS * Math.pow(2, retries);
      console.warn(`  Network error, retrying in ${backoff}ms...`, (error as Error).message);
      await sleep(backoff);
      return queryOverpass(query, retries + 1);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// OSM -> Trail Mapping
// ---------------------------------------------------------------------------

/** Generate a URL-safe slug from a trail name + OSM id. */
function generateSlug(name: string, osmId: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-osm-${osmId}`;
}

/** Map OSM sac_scale to CairnConnect difficulty. */
function mapSacScaleToDifficulty(sacScale: string | undefined): { difficulty: string | null; label: string | null } {
  if (!sacScale) return { difficulty: null, label: null };

  const mapping: Record<string, { difficulty: string; label: string }> = {
    hiking: { difficulty: 'green', label: 'Easy' },
    mountain_hiking: { difficulty: 'blue', label: 'Moderate' },
    demanding_mountain_hiking: { difficulty: 'black', label: 'Difficult' },
    alpine_hiking: { difficulty: 'black', label: 'Very Difficult' },
    demanding_alpine_hiking: { difficulty: 'double_black', label: 'Expert' },
    difficult_alpine_hiking: { difficulty: 'double_black', label: 'Expert' },
  };

  return mapping[sacScale] ?? { difficulty: null, label: null };
}

/** Map OSM mtb:scale to CairnConnect difficulty. */
function mapMtbScaleToDifficulty(mtbScale: string | undefined): { difficulty: string | null; label: string | null } {
  if (!mtbScale) return { difficulty: null, label: null };

  const scale = parseInt(mtbScale, 10);
  if (isNaN(scale)) return { difficulty: null, label: null };

  if (scale <= 1) return { difficulty: 'green', label: 'Easy' };
  if (scale === 2) return { difficulty: 'blue', label: 'Moderate' };
  if (scale === 3) return { difficulty: 'black', label: 'Difficult' };
  if (scale >= 4) return { difficulty: 'double_black', label: 'Expert' };

  return { difficulty: null, label: null };
}

/** Determine the activity_types array from OSM tags. */
function inferActivityTypes(tags: Record<string, string>): string[] {
  const types: Set<string> = new Set();

  const route = tags.route ?? '';
  const highway = tags.highway ?? '';
  const sacScale = tags['sac_scale'];
  const mtbScale = tags['mtb:scale'];

  // Hiking
  if (
    route === 'hiking' ||
    route === 'foot' ||
    sacScale ||
    highway === 'footway' ||
    (highway === 'path' && !mtbScale)
  ) {
    types.add('hiking');
  }

  // Trail running (hiking trails are usually also runnable)
  if (sacScale === 'hiking' || sacScale === 'mountain_hiking') {
    types.add('trail_running');
  }

  // Mountain biking
  if (route === 'mtb' || mtbScale || tags['bicycle'] === 'designated') {
    types.add('mtb');
  }

  // Road cycling
  if (route === 'bicycle' || highway === 'cycleway') {
    types.add('road_cycling');
  }

  // If nothing was inferred, default to hiking
  if (types.size === 0) {
    types.add('hiking');
  }

  return Array.from(types);
}

/** Determine trail_type from OSM tags (loop / out_and_back / point_to_point). */
function inferTrailType(tags: Record<string, string>): string | null {
  const roundtrip = tags.roundtrip;
  if (roundtrip === 'yes') return 'loop';
  if (roundtrip === 'no') return 'point_to_point';

  const network = tags.network;
  if (network === 'lwn' || network === 'rwn') return 'out_and_back';

  return null;
}

/** Extract surface types from OSM tags. */
function inferSurfaceTypes(tags: Record<string, string>): string[] {
  const surface = tags.surface;
  if (!surface) return [];
  return [surface];
}

/** Parse a length tag like "12.5 km" or "5000" (meters) into meters. */
function parseDistanceMeters(tags: Record<string, string>): number | null {
  const raw = tags.distance ?? tags.length ?? null;
  if (!raw) return null;

  const cleaned = raw.replace(/,/g, '.').trim();
  const kmMatch = cleaned.match(/^([\d.]+)\s*km$/i);
  if (kmMatch) return parseFloat(kmMatch[1]) * 1000;

  const miMatch = cleaned.match(/^([\d.]+)\s*mi$/i);
  if (miMatch) return parseFloat(miMatch[1]) * 1609.344;

  const numMatch = cleaned.match(/^([\d.]+)$/);
  if (numMatch) return parseFloat(numMatch[1]);

  return null;
}

/** Parse elevation gain from tags. */
function parseElevationGain(tags: Record<string, string>): number | null {
  const raw = tags['ascent'] ?? tags['ele:gain'] ?? null;
  if (!raw) return null;
  const num = parseFloat(raw.replace(/[^\d.]/g, ''));
  return isNaN(num) ? null : num;
}

/** Build a GeoJSON LineString from the geometry array (way elements). */
function buildRouteGeoJson(
  geometry: Array<{ lat: number; lon: number }> | undefined,
): object | null {
  if (!geometry || geometry.length < 2) return null;

  return {
    type: 'LineString',
    coordinates: geometry.map((pt) => [pt.lon, pt.lat]),
  };
}

/** Get the start point as a PostGIS-compatible WKT string. */
function getStartPointWKT(element: OverpassElement): string | null {
  if (element.lat != null && element.lon != null) {
    return `SRID=4326;POINT(${element.lon} ${element.lat})`;
  }
  if (element.center) {
    return `SRID=4326;POINT(${element.center.lon} ${element.center.lat})`;
  }
  if (element.geometry && element.geometry.length > 0) {
    const first = element.geometry[0];
    return `SRID=4326;POINT(${first.lon} ${first.lat})`;
  }
  return null;
}

/** Convert an Overpass element into a trail insert row. */
function elementToTrail(element: OverpassElement, city: AnchorCity): TrailInsert | null {
  const tags = element.tags ?? {};
  const name = tags.name ?? tags['name:en'] ?? null;

  // Skip unnamed trails
  if (!name) return null;

  const externalId = `osm-${element.type}-${element.id}`;
  const { difficulty, label } = tags['sac_scale']
    ? mapSacScaleToDifficulty(tags['sac_scale'])
    : mapMtbScaleToDifficulty(tags['mtb:scale']);

  return {
    name,
    slug: generateSlug(name, element.id),
    description: tags.description ?? tags.note ?? null,
    activity_types: inferActivityTypes(tags),
    difficulty,
    difficulty_label: label,
    distance_meters: parseDistanceMeters(tags),
    elevation_gain_meters: parseElevationGain(tags),
    trail_type: inferTrailType(tags),
    surface_type: inferSurfaceTypes(tags),
    start_point: getStartPointWKT(element),
    route_geojson: buildRouteGeoJson(element.geometry),
    city: city.name,
    state_province: city.state_province,
    country: city.country,
    country_code: city.country_code,
    source: 'osm',
    external_id: externalId,
    is_active: true,
  };
}

// ---------------------------------------------------------------------------
// Database Insertion
// ---------------------------------------------------------------------------

async function upsertTrails(trails: TrailInsert[]): Promise<{ inserted: number; errors: number }> {
  let inserted = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < trails.length; i += BATCH_SIZE) {
    const batch = trails.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('trails')
      .upsert(batch, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      console.error(`  Batch upsert error:`, error.message);
      // Fall back to individual inserts for this batch
      for (const trail of batch) {
        const { error: singleError } = await supabase
          .from('trails')
          .upsert(trail, {
            onConflict: 'slug',
            ignoreDuplicates: true,
          });

        if (singleError) {
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length ?? batch.length;
    }
  }

  return { inserted, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seedCity(city: AnchorCity): Promise<void> {
  console.log(`\n--- ${city.name}, ${city.state_province} (${city.country_code}) ---`);
  console.log(`  Querying Overpass within ${city.radius_km} km of (${city.lat}, ${city.lng})...`);

  const query = buildOverpassQuery(city);
  const response = await queryOverpass(query);

  console.log(`  Received ${response.elements.length} OSM elements`);

  // Deduplicate by external_id
  const seen = new Set<string>();
  const trails: TrailInsert[] = [];

  for (const element of response.elements) {
    const trail = elementToTrail(element, city);
    if (!trail) continue;
    if (seen.has(trail.external_id)) continue;
    seen.add(trail.external_id);
    trails.push(trail);
  }

  console.log(`  Mapped ${trails.length} named trails (${response.elements.length - trails.length} skipped)`);

  if (trails.length === 0) {
    console.log('  No trails to insert, skipping.');
    return;
  }

  const { inserted, errors } = await upsertTrails(trails);
  console.log(`  Upserted: ${inserted} | Errors: ${errors}`);
}

async function main(): Promise<void> {
  console.log('=== CairnConnect OSM Trail Seeder ===');
  console.log(`Anchor cities: ${ANCHOR_CITIES.length}`);
  console.log(`Overpass endpoint: ${OVERPASS_URL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < ANCHOR_CITIES.length; i++) {
    const city = ANCHOR_CITIES[i];

    try {
      await seedCity(city);
    } catch (error) {
      console.error(`  FAILED to seed ${city.name}:`, (error as Error).message);
      totalErrors++;
    }

    // Rate limit: wait between cities (except after the last one)
    if (i < ANCHOR_CITIES.length - 1) {
      console.log(`  Waiting ${REQUEST_DELAY_MS}ms before next city...`);
      await sleep(REQUEST_DELAY_MS);
    }
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total errors: ${totalErrors}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
