'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export interface SaveTripInput {
  title: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  trailIds?: string[];
  businessIds?: string[];
  isPublic?: boolean;
  coverPhotoUrl?: string;
}

export async function saveTrip(input: SaveTripInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Trips cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to save trips.' };
  }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      destination: input.destination ?? null,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      trail_ids: input.trailIds ?? [],
      business_ids: input.businessIds ?? [],
      is_public: input.isPublic ?? false,
      cover_photo_url: input.coverPhotoUrl ?? null,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/trip');
  return { success: true, id: data.id };
}

export async function updateTrip(tripId: string, input: Partial<SaveTripInput>) {
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

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.destination !== undefined) updates.destination = input.destination;
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.endDate !== undefined) updates.end_date = input.endDate;
  if (input.trailIds !== undefined) updates.trail_ids = input.trailIds;
  if (input.businessIds !== undefined) updates.business_ids = input.businessIds;
  if (input.isPublic !== undefined) updates.is_public = input.isPublic;
  if (input.coverPhotoUrl !== undefined) updates.cover_photo_url = input.coverPhotoUrl;

  const { error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/trip');
  return { success: true };
}

export async function deleteTrip(tripId: string) {
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
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/trip');
  return { success: true };
}
