import type { DbReview } from '@/lib/database-types';
import { isSupabaseConfigured, getServerClient } from './helpers';
import { MOCK_REVIEWS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// getReviewsForEntity — reviews for a trail or business
// ---------------------------------------------------------------------------

export async function getReviewsForEntity(
  entityType: 'business' | 'trail',
  entityId: string,
  limit: number = 50,
): Promise<DbReview[]> {
  if (!isSupabaseConfigured()) {
    const reviews = MOCK_REVIEWS
      .filter((r) => r.entity_type === entityType && r.entity_id === entityId)
      .slice(0, limit);
    // Map mock review shape → DbReview shape
    return reviews.map((r) => ({
      id: r.id,
      author_id: 'mock-user',
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      photos: [] as string[],
      owner_response: null,
      is_verified: false,
      helpful_count: 0,
      created_at: r.created_at,
      updated_at: r.created_at,
    })) as DbReview[];
  }

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

// ---------------------------------------------------------------------------
// getReviewWithAuthor — review + author profile join
// ---------------------------------------------------------------------------

export interface ReviewWithAuthor extends DbReview {
  author_name?: string;
  author_avatar?: string | null;
}

export async function getReviewsWithAuthors(
  entityType: 'business' | 'trail',
  entityId: string,
  limit: number = 50,
): Promise<ReviewWithAuthor[]> {
  if (!isSupabaseConfigured()) {
    const reviews = MOCK_REVIEWS
      .filter((r) => r.entity_type === entityType && r.entity_id === entityId)
      .slice(0, limit);
    return reviews.map((r) => ({
      id: r.id,
      author_id: 'mock-user',
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      photos: [],
      owner_response: null,
      is_verified: false,
      helpful_count: 0,
      created_at: r.created_at,
      updated_at: r.created_at,
      author_name: r.author_name,
      author_avatar: r.author_avatar,
    }));
  }

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users!reviews_author_id_fkey(display_name, avatar_url)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r) => {
    const record = r as Record<string, unknown>;
    const user = record.users as Record<string, unknown> | null;
    const { users: _users, ...rest } = record;
    return {
      ...rest,
      author_name: (user?.display_name as string) ?? undefined,
      author_avatar: (user?.avatar_url as string) ?? null,
    } as ReviewWithAuthor;
  });
}
