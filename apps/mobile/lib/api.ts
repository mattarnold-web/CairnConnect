/**
 * Supabase Data Service Layer
 *
 * Provides typed query functions for all core entities (trails, businesses,
 * activity posts, user activities, reviews). When the database is not yet
 * seeded, functions gracefully fall back to the mock data so the app remains
 * fully functional during development.
 *
 * Toggle `USE_MOCK_FALLBACK` to `false` once your Supabase database is
 * populated.
 */

import { supabase } from './supabase';
import {
  MOCK_TRAILS,
  MOCK_BUSINESSES,
  MOCK_ACTIVITY_POSTS,
  MOCK_REVIEWS,
} from './mock-data';
import type {
  Trail,
  Business,
  ActivityPost,
  UserActivity,
} from '@cairn/shared';
import type { MockReview } from './mock-data';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Set to `false` once your database is seeded with real data. */
const USE_MOCK_FALLBACK = false;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrailQueryOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  activityTypes?: string[];
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface BusinessQueryOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  category?: string;
  activityTypes?: string[];
  search?: string;
  spotlightOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface ActivityPostQueryOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  activityType?: string;
  skillLevel?: string;
  postType?: string;
  limit?: number;
  offset?: number;
}

export interface CreateReviewPayload {
  entityType: 'trail' | 'business';
  entityId: string;
  rating: number;
  title: string;
  body: string;
}

export interface Review {
  id: string;
  author_id?: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  entity_type: 'trail' | 'business';
  entity_id: string;
  photos?: string[];
  created_at: string;
}

// ---------------------------------------------------------------------------
// Untyped Supabase client
// ---------------------------------------------------------------------------
// The database-types.ts file was scaffolded for an earlier version of
// supabase-js and does not include RPC definitions or the newer
// PostgrestVersion / Relationships keys. Rather than fight the generated
// types, we use an `any`-typed client for RPC calls and for tables not
// fully represented in the type file. All return values are explicitly
// typed at the function boundary so callers always get proper types.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ---------------------------------------------------------------------------
// Internal helpers — mock data filtering
// ---------------------------------------------------------------------------

function filterMockTrails(options: TrailQueryOptions): Trail[] {
  let trails = MOCK_TRAILS as unknown as Trail[];

  if (options.search) {
    const q = options.search.toLowerCase();
    trails = trails.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.city && t.city.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)),
    );
  }

  if (options.activityTypes && options.activityTypes.length > 0) {
    trails = trails.filter((t) =>
      t.activity_types.some((a) => options.activityTypes!.includes(a)),
    );
  }

  if (options.difficulty) {
    trails = trails.filter((t) => t.difficulty === options.difficulty);
  }

  const offset = options.offset ?? 0;
  const limit = options.limit ?? 50;
  return trails.slice(offset, offset + limit);
}

function filterMockBusinesses(options: BusinessQueryOptions): Business[] {
  let businesses = MOCK_BUSINESSES as unknown as Business[];

  if (options.search) {
    const q = options.search.toLowerCase();
    businesses = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)),
    );
  }

  if (options.category) {
    businesses = businesses.filter((b) => b.category === options.category);
  }

  if (options.activityTypes && options.activityTypes.length > 0) {
    businesses = businesses.filter((b) =>
      b.activity_types.some((a) => options.activityTypes!.includes(a)),
    );
  }

  if (options.spotlightOnly) {
    businesses = businesses.filter((b) => b.is_spotlight);
  }

  const offset = options.offset ?? 0;
  const limit = options.limit ?? 50;
  return businesses.slice(offset, offset + limit);
}

function filterMockActivityPosts(
  options: ActivityPostQueryOptions,
): ActivityPost[] {
  let posts = MOCK_ACTIVITY_POSTS as unknown as ActivityPost[];

  if (options.activityType) {
    posts = posts.filter((p) => p.activity_type === options.activityType);
  }

  if (options.skillLevel) {
    posts = posts.filter((p) => p.skill_level === options.skillLevel);
  }

  if (options.postType) {
    posts = posts.filter((p) => p.post_type === options.postType);
  }

  // Sort: open_permit first, then by date ascending
  posts = [...posts].sort((a, b) => {
    if (a.post_type === 'open_permit' && b.post_type !== 'open_permit')
      return -1;
    if (b.post_type === 'open_permit' && a.post_type !== 'open_permit')
      return 1;
    return (
      new Date(a.activity_date).getTime() -
      new Date(b.activity_date).getTime()
    );
  });

  const offset = options.offset ?? 0;
  const limit = options.limit ?? 20;
  return posts.slice(offset, offset + limit);
}

function getMockTrailReviews(trailId: string): Review[] {
  return (MOCK_REVIEWS as MockReview[])
    .filter((r) => r.entity_type === 'trail' && r.entity_id === trailId)
    .map(mockReviewToReview);
}

function getMockBusinessReviews(businessId: string): Review[] {
  return (MOCK_REVIEWS as MockReview[])
    .filter(
      (r) => r.entity_type === 'business' && r.entity_id === businessId,
    )
    .map(mockReviewToReview);
}

function mockReviewToReview(r: MockReview): Review {
  return {
    id: r.id,
    author_name: r.author_name,
    author_avatar: r.author_avatar,
    rating: r.rating,
    title: r.title,
    body: r.body,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    created_at: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Trails
// ---------------------------------------------------------------------------

export async function fetchTrails(
  options: TrailQueryOptions = {},
): Promise<Trail[]> {
  try {
    let query = sb
      .from('trails')
      .select('*')
      .eq('is_active', true);

    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options.activityTypes && options.activityTypes.length > 0) {
      query = query.overlaps('activity_types', options.activityTypes);
    }

    if (options.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }

    query = query
      .order('rating', { ascending: false })
      .range(
        options.offset ?? 0,
        (options.offset ?? 0) + (options.limit ?? 50) - 1,
      );

    const { data, error } = await query;

    if (error || !data?.length) {
      if (USE_MOCK_FALLBACK) return filterMockTrails(options);
      if (error) throw error;
      return [];
    }

    return data as Trail[];
  } catch (e) {
    if (USE_MOCK_FALLBACK) return filterMockTrails(options);
    throw e;
  }
}

export async function fetchTrailBySlug(
  slug: string,
): Promise<Trail | null> {
  try {
    const { data, error } = await sb
      .from('trails')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      if (USE_MOCK_FALLBACK) {
        const trail = (MOCK_TRAILS as unknown as Trail[]).find(
          (t) => t.slug === slug,
        );
        return trail ?? null;
      }
      if (error) throw error;
      return null;
    }

    return data as Trail;
  } catch (e) {
    if (USE_MOCK_FALLBACK) {
      const trail = (MOCK_TRAILS as unknown as Trail[]).find(
        (t) => t.slug === slug,
      );
      return trail ?? null;
    }
    throw e;
  }
}

export async function fetchTrailReviews(
  trailId: string,
): Promise<Review[]> {
  try {
    const { data, error } = await sb
      .from('reviews')
      .select(
        `
        id,
        author_id,
        rating,
        title,
        body,
        photos,
        entity_type,
        entity_id,
        created_at,
        users!inner ( display_name, avatar_url )
      `,
      )
      .eq('entity_type', 'trail')
      .eq('entity_id', trailId)
      .order('created_at', { ascending: false });

    if (error || !data?.length) {
      if (USE_MOCK_FALLBACK) return getMockTrailReviews(trailId);
      if (error) throw error;
      return [];
    }

    return (data as Record<string, unknown>[]).map((row) => {
      const user = row.users as Record<string, unknown> | null;
      return {
        id: row.id as string,
        author_id: row.author_id as string,
        author_name: (user?.display_name as string) ?? 'Anonymous',
        author_avatar: (user?.avatar_url as string) ?? null,
        rating: row.rating as number,
        title: (row.title as string) ?? null,
        body: (row.body as string) ?? null,
        entity_type: row.entity_type as 'trail' | 'business',
        entity_id: row.entity_id as string,
        photos: (row.photos as string[]) ?? [],
        created_at: row.created_at as string,
      };
    });
  } catch (e) {
    if (USE_MOCK_FALLBACK) return getMockTrailReviews(trailId);
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Businesses
// ---------------------------------------------------------------------------

export async function fetchBusinesses(
  options: BusinessQueryOptions = {},
): Promise<Business[]> {
  try {
    // Use RPC for location-based queries when lat/lng is provided
    if (options.lat != null && options.lng != null) {
      const { data, error } = await sb.rpc('businesses_near_point', {
        lat: options.lat,
        lng: options.lng,
        radius_m: options.radius ?? 15000,
      });

      if (error || !data?.length) {
        if (USE_MOCK_FALLBACK) return filterMockBusinesses(options);
        if (error) throw error;
        return [];
      }

      let businesses = data as Business[];

      // Apply additional filters that the RPC doesn't handle
      if (options.category) {
        businesses = businesses.filter(
          (b) => b.category === options.category,
        );
      }
      if (options.activityTypes && options.activityTypes.length > 0) {
        businesses = businesses.filter((b) =>
          b.activity_types.some((a) => options.activityTypes!.includes(a)),
        );
      }
      if (options.spotlightOnly) {
        businesses = businesses.filter((b) => b.is_spotlight);
      }
      if (options.search) {
        const q = options.search.toLowerCase();
        businesses = businesses.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            (b.city && b.city.toLowerCase().includes(q)),
        );
      }

      const offset = options.offset ?? 0;
      const limit = options.limit ?? 50;
      return businesses.slice(offset, offset + limit);
    }

    // Non-location query via standard select
    let query = sb
      .from('businesses')
      .select('*')
      .eq('is_active', true);

    if (options.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.activityTypes && options.activityTypes.length > 0) {
      query = query.overlaps('activity_types', options.activityTypes);
    }

    if (options.spotlightOnly) {
      query = query.eq('is_spotlight', true);
    }

    query = query
      .order('is_spotlight', { ascending: false })
      .order('rating', { ascending: false })
      .range(
        options.offset ?? 0,
        (options.offset ?? 0) + (options.limit ?? 50) - 1,
      );

    const { data, error } = await query;

    if (error || !data?.length) {
      if (USE_MOCK_FALLBACK) return filterMockBusinesses(options);
      if (error) throw error;
      return [];
    }

    return data as Business[];
  } catch (e) {
    if (USE_MOCK_FALLBACK) return filterMockBusinesses(options);
    throw e;
  }
}

export async function fetchBusinessBySlug(
  slug: string,
): Promise<Business | null> {
  try {
    const { data, error } = await sb
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      if (USE_MOCK_FALLBACK) {
        const biz = (MOCK_BUSINESSES as unknown as Business[]).find(
          (b) => b.slug === slug,
        );
        return biz ?? null;
      }
      if (error) throw error;
      return null;
    }

    return data as Business;
  } catch (e) {
    if (USE_MOCK_FALLBACK) {
      const biz = (MOCK_BUSINESSES as unknown as Business[]).find(
        (b) => b.slug === slug,
      );
      return biz ?? null;
    }
    throw e;
  }
}

export async function fetchBusinessReviews(
  businessId: string,
): Promise<Review[]> {
  try {
    const { data, error } = await sb
      .from('reviews')
      .select(
        `
        id,
        author_id,
        rating,
        title,
        body,
        photos,
        entity_type,
        entity_id,
        created_at,
        users!inner ( display_name, avatar_url )
      `,
      )
      .eq('entity_type', 'business')
      .eq('entity_id', businessId)
      .order('created_at', { ascending: false });

    if (error || !data?.length) {
      if (USE_MOCK_FALLBACK) return getMockBusinessReviews(businessId);
      if (error) throw error;
      return [];
    }

    return (data as Record<string, unknown>[]).map((row) => {
      const user = row.users as Record<string, unknown> | null;
      return {
        id: row.id as string,
        author_id: row.author_id as string,
        author_name: (user?.display_name as string) ?? 'Anonymous',
        author_avatar: (user?.avatar_url as string) ?? null,
        rating: row.rating as number,
        title: (row.title as string) ?? null,
        body: (row.body as string) ?? null,
        entity_type: row.entity_type as 'trail' | 'business',
        entity_id: row.entity_id as string,
        photos: (row.photos as string[]) ?? [],
        created_at: row.created_at as string,
      };
    });
  } catch (e) {
    if (USE_MOCK_FALLBACK) return getMockBusinessReviews(businessId);
    throw e;
  }
}

/**
 * Fetch businesses related to a trail (nearby + shared activity types).
 * Uses the `businesses_near_trail` RPC when available, otherwise falls back
 * to a client-side activity_types overlap against mock data.
 */
export async function fetchNearbyBusinessesForTrail(
  trailId: string,
  trailActivityTypes: string[],
  radiusM = 15000,
): Promise<Business[]> {
  try {
    const { data, error } = await sb.rpc('businesses_near_trail', {
      p_trail_id: trailId,
      p_radius_m: radiusM,
    });

    if (error || !data?.length) {
      if (USE_MOCK_FALLBACK) {
        return (MOCK_BUSINESSES as unknown as Business[])
          .filter((b) =>
            b.activity_types.some((a) => trailActivityTypes.includes(a)),
          )
          .slice(0, 3);
      }
      if (error) throw error;
      return [];
    }

    // The RPC returns a reduced set of columns -- refetch full rows by slug
    const slugs = (data as Array<{ slug: string }>).map((row) => row.slug);
    const { data: fullRows } = await sb
      .from('businesses')
      .select('*')
      .in('slug', slugs);

    if (fullRows?.length) {
      return fullRows as Business[];
    }

    // Fallback: coerce partial data
    return data as Business[];
  } catch (e) {
    if (USE_MOCK_FALLBACK) {
      return (MOCK_BUSINESSES as unknown as Business[])
        .filter((b) =>
          b.activity_types.some((a) => trailActivityTypes.includes(a)),
        )
        .slice(0, 3);
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Activity Board
// ---------------------------------------------------------------------------

export async function fetchActivityPosts(
  options: ActivityPostQueryOptions = {},
): Promise<ActivityPost[]> {
  try {
    // Use the RPC when we have location data
    if (options.lat != null && options.lng != null) {
      const { data, error } = await sb.rpc('get_activity_posts_near', {
        p_lat: options.lat,
        p_lng: options.lng,
        p_radius_km: (options.radius ?? 50000) / 1000,
        p_activity_type: options.activityType ?? null,
        p_skill_level: options.skillLevel ?? null,
        p_post_type: options.postType ?? null,
        p_limit: options.limit ?? 20,
        p_offset: options.offset ?? 0,
      });

      if (error || !data?.length) {
        if (USE_MOCK_FALLBACK) return filterMockActivityPosts(options);
        if (error) throw error;
        return [];
      }

      return data as ActivityPost[];
    }

    // Standard query without location
    let query = sb
      .from('activity_posts')
      .select('*')
      .eq('status', 'active')
      .eq('is_public', true)
      .gte('activity_date', new Date().toISOString());

    if (options.activityType) {
      query = query.eq('activity_type', options.activityType);
    }

    if (options.skillLevel) {
      query = query.eq('skill_level', options.skillLevel);
    }

    if (options.postType) {
      query = query.eq('post_type', options.postType);
    }

    query = query
      .order('activity_date', { ascending: true })
      .range(
        options.offset ?? 0,
        (options.offset ?? 0) + (options.limit ?? 20) - 1,
      );

    const { data, error } = await query;

    if (error || !data?.length) {
      if (USE_MOCK_FALLBACK) return filterMockActivityPosts(options);
      if (error) throw error;
      return [];
    }

    return data as ActivityPost[];
  } catch (e) {
    if (USE_MOCK_FALLBACK) return filterMockActivityPosts(options);
    throw e;
  }
}

export async function fetchActivityPostById(
  id: string,
): Promise<ActivityPost | null> {
  try {
    const { data, error } = await sb
      .from('activity_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      if (USE_MOCK_FALLBACK) {
        const post = (
          MOCK_ACTIVITY_POSTS as unknown as ActivityPost[]
        ).find((p) => p.id === id);
        return post ?? null;
      }
      if (error) throw error;
      return null;
    }

    return data as ActivityPost;
  } catch (e) {
    if (USE_MOCK_FALLBACK) {
      const post = (MOCK_ACTIVITY_POSTS as unknown as ActivityPost[]).find(
        (p) => p.id === id,
      );
      return post ?? null;
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// User Activities
// ---------------------------------------------------------------------------

export async function fetchUserActivities(
  userId: string,
): Promise<UserActivity[]> {
  try {
    const { data, error } = await sb
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error || !data?.length) {
      if (error && !USE_MOCK_FALLBACK) throw error;
      return [];
    }

    return data as UserActivity[];
  } catch (e) {
    if (USE_MOCK_FALLBACK) return [];
    throw e;
  }
}

export async function saveActivity(
  activity: Partial<UserActivity>,
): Promise<UserActivity> {
  const { data, error } = await sb
    .from('user_activities')
    .upsert(activity)
    .select()
    .single();

  if (error) throw error;
  return data as UserActivity;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function createReview(
  payload: CreateReviewPayload,
): Promise<Review> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be signed in to leave a review.');

  const { data, error } = await sb
    .from('reviews')
    .insert({
      author_id: user.id,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      rating: payload.rating,
      title: payload.title,
      body: payload.body,
    })
    .select()
    .single();

  if (error) throw error;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    author_id: user.id,
    author_name:
      (user.user_metadata?.display_name as string) ??
      user.email ??
      'Anonymous',
    author_avatar: (user.user_metadata?.avatar_url as string) ?? null,
    rating: row.rating as number,
    title: (row.title as string) ?? null,
    body: (row.body as string) ?? null,
    entity_type: row.entity_type as 'trail' | 'business',
    entity_id: row.entity_id as string,
    photos: (row.photos as string[]) ?? [],
    created_at: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchAll(
  query: string,
  _lat?: number,
  _lng?: number,
): Promise<{ trails: Trail[]; businesses: Business[] }> {
  try {
    const [trails, businesses] = await Promise.all([
      fetchTrails({ search: query, limit: 10 }),
      fetchBusinesses({ search: query, limit: 10 }),
    ]);

    return { trails, businesses };
  } catch (e) {
    if (USE_MOCK_FALLBACK) {
      return {
        trails: filterMockTrails({ search: query, limit: 10 }),
        businesses: filterMockBusinesses({ search: query, limit: 10 }),
      };
    }
    throw e;
  }
}
