'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export async function toggleSavedItem(
  entityType: 'business' | 'trail' | 'event' | 'club' | 'activity_post',
  entityId: string,
) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Saves cannot persist in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to save items.' };
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('user_saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (existing) {
    // Unsave
    await supabase
      .from('user_saved_items')
      .delete()
      .eq('id', existing.id);

    revalidatePath('/profile');
    return { saved: false };
  }

  // Save
  const { error } = await supabase.from('user_saved_items').insert({
    user_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  return { saved: true };
}

export async function isItemSaved(
  entityType: 'business' | 'trail' | 'event' | 'club' | 'activity_post',
  entityId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from('user_saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  return !!data;
}
