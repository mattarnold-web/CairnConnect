import type { DbUser, DbUserActivity } from '@/lib/database-types';
import { isSupabaseConfigured, getServerClient } from './helpers';

// ---------------------------------------------------------------------------
// getCurrentUserProfile — authenticated user's profile from `users` table
// ---------------------------------------------------------------------------

export async function getCurrentUserProfile(): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) {
    // No mock user in unauthenticated mock mode
    return null;
  }

  const supabase = getServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// getUserActivities — user's recorded activities
// ---------------------------------------------------------------------------

export interface GetUserActivitiesOptions {
  limit?: number;
  offset?: number;
}

export async function getUserActivities(
  userId?: string,
  opts: GetUserActivitiesOptions = {},
): Promise<DbUserActivity[]> {
  const { limit = 50, offset = 0 } = opts;

  if (!isSupabaseConfigured()) {
    // In mock mode, activities come from the client-side ActivityProvider
    return [];
  }

  const supabase = getServerClient();

  // If no userId provided, get current user's activities
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return [];
    targetUserId = authUser.id;
  }

  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', targetUserId)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];
  return data;
}
