'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export interface SubmitReviewInput {
  entityType: 'business' | 'trail';
  entityId: string;
  entitySlug: string;
  rating: number;
  title: string;
  body: string;
}

export async function submitReview(input: SubmitReviewInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Reviews cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to submit a review.' };
  }

  const { error } = await supabase.from('reviews').insert({
    author_id: user.id,
    entity_type: input.entityType,
    entity_id: input.entityId,
    rating: input.rating,
    title: input.title,
    body: input.body,
    photos: [],
    is_verified: false,
    helpful_count: 0,
  });

  if (error) {
    return { error: error.message };
  }

  const basePath = input.entityType === 'trail' ? '/trail' : '/business';
  revalidatePath(`${basePath}/${input.entitySlug}`);
  return { success: true };
}
