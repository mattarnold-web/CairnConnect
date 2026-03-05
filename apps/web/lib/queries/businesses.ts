import type { DbBusiness } from '@/lib/database-types';
import { isSupabaseConfigured, getServerClient } from './helpers';
import { MOCK_BUSINESSES } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// getBusinessBySlug
// ---------------------------------------------------------------------------

export async function getBusinessBySlug(slug: string): Promise<DbBusiness | null> {
  if (!isSupabaseConfigured()) {
    const b = MOCK_BUSINESSES.find((b) => b.slug === slug);
    return (b as unknown as DbBusiness) ?? null;
  }

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// getBusinesses — paginated list with optional filters
// ---------------------------------------------------------------------------

export interface GetBusinessesOptions {
  search?: string;
  activityType?: string;
  category?: string;
  spotlightOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function getBusinesses(opts: GetBusinessesOptions = {}): Promise<DbBusiness[]> {
  const { search, activityType, category, spotlightOnly, limit = 50, offset = 0 } = opts;

  if (!isSupabaseConfigured()) {
    let results = [...MOCK_BUSINESSES] as unknown as DbBusiness[];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q),
      );
    }
    if (activityType) {
      results = results.filter((b) => b.activity_types.includes(activityType));
    }
    if (category) {
      results = results.filter((b) => b.category === category);
    }
    if (spotlightOnly) {
      results = results.filter((b) => b.is_spotlight);
    }
    return results.slice(offset, offset + limit);
  }

  const supabase = getServerClient();
  let query = supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('is_spotlight', { ascending: false })
    .order('rating', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (activityType) {
    query = query.contains('activity_types', [activityType]);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (spotlightOnly) {
    query = query.eq('is_spotlight', true);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

// ---------------------------------------------------------------------------
// getBusinessesNearTrail — uses DB RPC function
// ---------------------------------------------------------------------------

export async function getBusinessesNearTrail(
  trailId: string,
  radiusM: number = 25000,
): Promise<(DbBusiness & { dist_m?: number })[]> {
  if (!isSupabaseConfigured()) {
    // Mock fallback — return first 3 businesses
    return (MOCK_BUSINESSES.slice(0, 3) as unknown as DbBusiness[]);
  }

  const supabase = getServerClient();
  const { data, error } = await (supabase.rpc as any)('businesses_near_trail', {
    p_trail_id: trailId,
    p_radius_m: radiusM,
  });

  if (error || !data) return [];
  return data as (DbBusiness & { dist_m: number })[];
}

// ---------------------------------------------------------------------------
// getBusinessesNearPoint — geographic proximity
// ---------------------------------------------------------------------------

export async function getBusinessesNearPoint(
  lat: number,
  lng: number,
  radiusM: number = 25000,
): Promise<DbBusiness[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_BUSINESSES as unknown as DbBusiness[];
  }

  const supabase = getServerClient();
  const { data, error } = await (supabase.rpc as any)('businesses_near_point', {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radiusM,
  });

  if (error || !data) return [];
  return data as DbBusiness[];
}
