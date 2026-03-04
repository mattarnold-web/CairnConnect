import type { DbActivityPost } from '@/lib/database-types';
import { isSupabaseConfigured, getServerClient } from './helpers';
import { MOCK_ACTIVITY_POSTS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Extended type with author info (returned by RPC and mock data)
// ---------------------------------------------------------------------------

export interface ActivityPostWithAuthor extends DbActivityPost {
  author_display_name?: string | null;
  author_avatar_url?: string | null;
  dist_km?: number;
  // Mock data extras
  user_display_name?: string;
  user_avatar?: string;
}

// ---------------------------------------------------------------------------
// getActivityPosts — filtered list
// ---------------------------------------------------------------------------

export interface GetActivityPostsOptions {
  postType?: string;
  activityType?: string;
  skillLevel?: string;
  limit?: number;
  offset?: number;
}

export async function getActivityPosts(
  opts: GetActivityPostsOptions = {},
): Promise<ActivityPostWithAuthor[]> {
  const { postType, activityType, skillLevel, limit = 50, offset = 0 } = opts;

  if (!isSupabaseConfigured()) {
    let results = [...MOCK_ACTIVITY_POSTS] as unknown as ActivityPostWithAuthor[];
    if (postType) {
      results = results.filter((p) => p.post_type === postType);
    }
    if (activityType) {
      results = results.filter((p) => p.activity_type === activityType);
    }
    if (skillLevel) {
      results = results.filter((p) => p.skill_level === skillLevel);
    }
    return results.slice(offset, offset + limit);
  }

  const supabase = getServerClient();
  let query = supabase
    .from('activity_posts')
    .select('*, users!activity_posts_author_id_fkey(display_name, avatar_url)')
    .eq('status', 'active')
    .order('activity_date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (postType) {
    query = query.eq('post_type', postType as DbActivityPost['post_type']);
  }
  if (activityType) {
    query = query.eq('activity_type', activityType);
  }
  if (skillLevel) {
    query = query.eq('skill_level', skillLevel as 'beginner' | 'intermediate' | 'advanced' | 'expert');
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((p) => {
    const record = p as Record<string, unknown>;
    const user = record.users as Record<string, unknown> | null;
    const { users: _users, ...rest } = record;
    return {
      ...rest,
      author_display_name: (user?.display_name as string) ?? null,
      author_avatar_url: (user?.avatar_url as string) ?? null,
    } as ActivityPostWithAuthor;
  });
}

// ---------------------------------------------------------------------------
// getActivityPostsNear — uses DB RPC function
// ---------------------------------------------------------------------------

export async function getActivityPostsNear(
  lat: number,
  lng: number,
  radiusKm: number = 100,
  opts: Omit<GetActivityPostsOptions, 'offset'> = {},
): Promise<ActivityPostWithAuthor[]> {
  if (!isSupabaseConfigured()) {
    // Mock fallback — return all posts
    let results = [...MOCK_ACTIVITY_POSTS] as unknown as ActivityPostWithAuthor[];
    if (opts.postType) results = results.filter((p) => p.post_type === opts.postType);
    if (opts.activityType) results = results.filter((p) => p.activity_type === opts.activityType);
    if (opts.skillLevel) results = results.filter((p) => p.skill_level === opts.skillLevel);
    return results.slice(0, opts.limit ?? 50);
  }

  const supabase = getServerClient();
  const args: Record<string, unknown> = {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
    p_limit: opts.limit ?? 50,
  };
  if (opts.activityType) args.p_activity_type = opts.activityType;
  if (opts.skillLevel) args.p_skill_level = opts.skillLevel;
  if (opts.postType) args.p_post_type = opts.postType;

  const { data, error } = await (supabase.rpc as any)('get_activity_posts_near', args);

  if (error || !data) return [];
  return data as ActivityPostWithAuthor[];
}
