'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured, getServerClient } from '@/lib/queries/helpers';

export interface SubmitHazardReportInput {
  trailId: string;
  trailSlug: string;
  condition: 'open' | 'caution' | 'closed';
  severity?: 'minor' | 'moderate' | 'severe';
  hazardType?: string;
  description?: string;
  photos?: string[];
}

export async function submitHazardReport(input: SubmitHazardReportInput) {
  if (!isSupabaseConfigured()) {
    return { error: 'Database not configured. Reports cannot be saved in demo mode.' };
  }

  const supabase = getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to report a hazard.' };
  }

  const { error } = await supabase.from('trail_conditions').insert({
    trail_id: input.trailId,
    reporter_id: user.id,
    condition: input.condition,
    severity: input.severity ?? null,
    hazard_type: input.hazardType ?? null,
    description: input.description ?? null,
    photos: input.photos ?? [],
    is_verified: false,
  });

  if (error) {
    return { error: error.message };
  }

  // Update trail's current condition
  await supabase
    .from('trails')
    .update({ current_condition: input.condition })
    .eq('id', input.trailId);

  revalidatePath(`/trail/${input.trailSlug}`);
  return { success: true };
}
