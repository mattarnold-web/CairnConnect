/**
 * Trail Data Normalizer
 * =====================
 * Unified abstraction for ingesting trail data from multiple sources.
 * Each source adapter transforms its raw data into NormalizedTrail,
 * which is then upserted into Supabase.
 *
 * Supported sources:
 *   - OpenStreetMap (Overpass API)
 *   - Overture Maps Foundation (GeoParquet via DuckDB)
 *   - Waymarked Trails API
 *   - User submissions
 *
 * Future sources (plug-in ready):
 *   - Outdooractive API
 *   - NPS API (US National Park Service)
 *   - LINZ (New Zealand)
 *   - IGN France
 */

// ── Normalized Types ────────────────────────────────────────────────

export interface NormalizedTrail {
  name: string;
  slug: string;
  description: string | null;
  activity_types: string[];
  difficulty: 'green' | 'blue' | 'black' | 'double_black' | 'proline' | null;
  difficulty_label: string | null;
  distance_meters: number | null;
  elevation_gain_meters: number | null;
  elevation_loss_meters: number | null;
  trail_type: 'loop' | 'out_and_back' | 'point_to_point' | 'network' | null;
  surface_type: string[];
  lat: number;
  lng: number;
  route_geojson: object | null;
  city: string;
  state_province: string;
  country: string;
  country_code: string;
  best_seasons: string[];
  source: string;
  external_id: string;
  cover_photo_url: string | null;
  photos: string[];
}

export interface NormalizedBusiness {
  name: string;
  slug: string;
  description: string | null;
  category: string;
  activity_types: string[];
  address: string | null;
  city: string;
  state_province: string;
  country: string;
  country_code: string;
  postal_code: string | null;
  lat: number;
  lng: number;
  phone: string | null;
  website_url: string | null;
  email: string | null;
  hours: object;
  source: string;
  external_id: string;
}

// ── Source Adapter Interface ────────────────────────────────────────

export interface TrailSourceAdapter {
  name: string;
  fetchTrails(city: CityConfig): Promise<NormalizedTrail[]>;
}

export interface BusinessSourceAdapter {
  name: string;
  fetchBusinesses(city: CityConfig): Promise<NormalizedBusiness[]>;
}

export interface CityConfig {
  slug: string;
  name: string;
  state_province: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  radius_km: number;
}

// ── Slug Generator ──────────────────────────────────────────────────

export function generateSlug(name: string, source: string, externalId: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const hash = externalId.slice(-6);
  return `${base}-${source}-${hash}`;
}

// ── Supabase Upserter ───────────────────────────────────────────────

export async function upsertTrails(
  trails: NormalizedTrail[],
  supabaseUrl: string,
  serviceKey: string,
  batchSize = 50,
): Promise<{ inserted: number; errors: number }> {
  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation',
  };

  let inserted = 0, errors = 0;

  for (let i = 0; i < trails.length; i += batchSize) {
    const batch = trails.slice(i, i + batchSize).map((t) => ({
      name: t.name,
      slug: t.slug,
      description: t.description,
      activity_types: t.activity_types,
      difficulty: t.difficulty,
      difficulty_label: t.difficulty_label,
      distance_meters: t.distance_meters,
      elevation_gain_meters: t.elevation_gain_meters,
      elevation_loss_meters: t.elevation_loss_meters,
      trail_type: t.trail_type,
      surface_type: t.surface_type,
      route_geojson: t.route_geojson,
      city: t.city,
      state_province: t.state_province,
      country: t.country,
      country_code: t.country_code,
      best_seasons: t.best_seasons,
      source: t.source,
      external_id: t.external_id,
      cover_photo_url: t.cover_photo_url,
      photos: t.photos,
      is_active: true,
    }));

    const res = await fetch(`${supabaseUrl}/rest/v1/trails?on_conflict=slug`, {
      method: 'POST', headers, body: JSON.stringify(batch),
    });

    if (res.ok) {
      const data = await res.json();
      inserted += Array.isArray(data) ? data.length : batch.length;
    } else {
      // Individual fallback
      for (const trail of batch) {
        const r = await fetch(`${supabaseUrl}/rest/v1/trails?on_conflict=slug`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(trail),
        });
        if (r.ok) inserted++; else errors++;
      }
    }
  }

  return { inserted, errors };
}

