import type { DbTrail } from '@/lib/database-types';
import { isSupabaseConfigured, getServerClient } from './helpers';
import { MOCK_TRAILS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// getTrailBySlug
// ---------------------------------------------------------------------------

export async function getTrailBySlug(slug: string): Promise<DbTrail | null> {
  if (!isSupabaseConfigured()) {
    const t = MOCK_TRAILS.find((t) => t.slug === slug);
    return (t as unknown as DbTrail) ?? null;
  }

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from('trails')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// getTrails — paginated list with optional filters
// ---------------------------------------------------------------------------

export interface GetTrailsOptions {
  search?: string;
  activityType?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export async function getTrails(opts: GetTrailsOptions = {}): Promise<DbTrail[]> {
  const { search, activityType, difficulty, limit = 50, offset = 0 } = opts;

  if (!isSupabaseConfigured()) {
    let results = [...MOCK_TRAILS] as unknown as DbTrail[];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q),
      );
    }
    if (activityType) {
      results = results.filter((t) => t.activity_types.includes(activityType));
    }
    if (difficulty) {
      results = results.filter((t) => t.difficulty === difficulty);
    }
    return results.slice(offset, offset + limit);
  }

  const supabase = getServerClient();
  let query = supabase
    .from('trails')
    .select('*')
    .order('rating', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (activityType) {
    query = query.contains('activity_types', [activityType]);
  }
  if (difficulty) {
    query = query.eq('difficulty', difficulty as DbTrail['difficulty']);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

// ---------------------------------------------------------------------------
// getTrailsNear — geographic proximity (requires PostGIS RPC)
// ---------------------------------------------------------------------------

export async function getTrailsNear(
  lat: number,
  lng: number,
  radiusKm: number = 50,
  limit: number = 20,
): Promise<DbTrail[]> {
  if (!isSupabaseConfigured()) {
    // Mock fallback — return all trails (they're all in Moab)
    return (MOCK_TRAILS as unknown as DbTrail[]).slice(0, limit);
  }

  const supabase = getServerClient();
  // Use raw SQL via RPC if a trails_near_point function exists,
  // otherwise fall back to a bounding-box filter
  const { data, error } = await supabase
    .from('trails')
    .select('*')
    .gte('lat', lat - radiusKm / 111)
    .lte('lat', lat + radiusKm / 111)
    .gte('lng', lng - radiusKm / (111 * Math.cos((lat * Math.PI) / 180)))
    .lte('lng', lng + radiusKm / (111 * Math.cos((lat * Math.PI) / 180)))
    .order('rating', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}
