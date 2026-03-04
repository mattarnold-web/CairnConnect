'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export interface SaveRecordedActivityInput {
  source: string;
  activityType: string;
  title: string;
  description?: string;
  distanceMeters: number;
  durationSeconds: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  maxElevationMeters?: number;
  avgSpeedMs?: number;
  maxSpeedMs?: number;
  calories?: number;
  startedAt: string;
  endedAt?: string;
  deviceName?: string;
  isPublic?: boolean;
}

export async function saveRecordedActivity(input: SaveRecordedActivityInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Activities cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to save activities.' };
  }

  const { data, error } = await supabase.from('user_activities')
    .insert({
      user_id: user.id,
      source: input.source,
      activity_type: input.activityType,
      title: input.title,
      description: input.description ?? null,
      distance_meters: input.distanceMeters,
      duration_seconds: input.durationSeconds,
      elevation_gain_meters: input.elevationGainMeters,
      elevation_loss_meters: input.elevationLossMeters,
      max_elevation_meters: input.maxElevationMeters ?? null,
      avg_speed_ms: input.avgSpeedMs ?? null,
      max_speed_ms: input.maxSpeedMs ?? null,
      calories: input.calories ?? null,
      started_at: input.startedAt,
      ended_at: input.endedAt ?? null,
      device_name: input.deviceName ?? null,
      is_public: input.isPublic ?? true,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  return { success: true, id: data.id };
}

export async function deleteRecordedActivity(activityId: string) {
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
    .from('user_activities')
    .delete()
    .eq('id', activityId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  return { success: true };
}
