'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export interface UpdateProfileInput {
  displayName?: string;
  username?: string;
  bio?: string;
  locationName?: string;
  avatarUrl?: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Profile cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to update your profile.' };
  }

  const updates: Record<string, unknown> = {};
  if (input.displayName !== undefined) updates.display_name = input.displayName;
  if (input.username !== undefined) updates.username = input.username;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (input.locationName !== undefined) updates.location_name = input.locationName;
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath('/settings');
  return { success: true };
}

export interface UpdatePreferencesInput {
  preferredUnits?: 'imperial' | 'metric';
  preferredLanguage?: string;
  activityPreferences?: string[];
  preferredSkillLevel?: string;
  skillLevels?: Record<string, string>;
}

export async function updatePreferences(input: UpdatePreferencesInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Preferences cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  const updates: Record<string, unknown> = {};
  if (input.preferredUnits !== undefined) updates.preferred_units = input.preferredUnits;
  if (input.preferredLanguage !== undefined) updates.preferred_language = input.preferredLanguage;
  if (input.activityPreferences !== undefined) updates.activity_preferences = input.activityPreferences;
  if (input.preferredSkillLevel !== undefined) updates.preferred_skill_level = input.preferredSkillLevel;
  if (input.skillLevels !== undefined) updates.skill_levels = input.skillLevels;

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}
