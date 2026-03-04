'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export interface CreateActivityPostInput {
  postType: 'im_going' | 'open_permit' | 'lfg';
  activityType: string;
  title: string;
  description?: string;
  locationName?: string;
  trailId?: string;
  activityDate: string;
  activityEndDate?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  maxParticipants?: number;
  permitRequired?: boolean;
  permitType?: string;
  costShare?: string;
  gearRequired?: string[];
  contactMethod?: 'in_app' | 'email' | 'phone';
  contactInfo?: string;
}

export async function createActivityPost(input: CreateActivityPostInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Posts cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to create a post.' };
  }

  const { data, error } = await supabase
    .from('activity_posts')
    .insert({
      author_id: user.id,
      post_type: input.postType,
      activity_type: input.activityType,
      title: input.title,
      description: input.description ?? null,
      location_name: input.locationName ?? null,
      trail_id: input.trailId ?? null,
      activity_date: input.activityDate,
      activity_end_date: input.activityEndDate ?? null,
      skill_level: input.skillLevel ?? null,
      max_participants: input.maxParticipants ?? null,
      permit_required: input.permitRequired ?? false,
      permit_type: input.permitType ?? null,
      cost_share: input.costShare ?? null,
      gear_required: input.gearRequired ?? [],
      contact_method: input.contactMethod ?? 'in_app',
      contact_info: input.contactInfo ?? null,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/board');
  return { success: true, id: data.id };
}

export async function cancelActivityPost(postId: string) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  const { error } = await supabase
    .from('activity_posts')
    .update({ status: 'cancelled' })
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/board');
  return { success: true };
}
