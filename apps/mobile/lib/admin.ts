import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────
// Note: These tables (user_roles, user_subscriptions, admin_audit_log, business_profiles)
// are defined in migration 022 but not yet in the generated DB types.
// We use the untyped client pattern until types are regenerated.

const sb = supabase as unknown as {
  from: (table: string) => any;
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
  auth: typeof supabase.auth;
};

export interface AdminStats {
  total_users: number;
  users_this_week: number;
  total_trails: number;
  total_businesses: number;
  total_activity_posts: number;
  active_trials: number;
  total_reviews: number;
  total_recorded_activities: number;
}

export interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
  plan: string;
  sub_status: string;
  trial_ends_at: string | null;
  roles: string[];
  activity_count: number;
}

export type UserRole = 'user' | 'admin' | 'business_owner' | 'moderator';

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// ── Admin checks ───────────────────────────────────────────

export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const { data, error } = await sb.from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
}

export async function getUserRoles(userId?: string): Promise<string[]> {
  const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return [];

  try {
    const { data } = await sb.from('user_roles')
      .select('role')
      .eq('user_id', uid);

    return (data ?? []).map((r: any) => r.role as string);
  } catch {
    return [];
  }
}

// ── Dashboard ──────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<AdminStats | null> {
  try {
    const { data, error } = await sb.rpc('admin_dashboard_stats');
    if (error || !data) return null;
    const row = Array.isArray(data) ? data[0] : data;
    return row as AdminStats;
  } catch {
    return null;
  }
}

// ── User management ────────────────────────────────────────

export async function fetchAllUsers(
  page = 0,
  limit = 50,
  search?: string,
): Promise<AdminUser[]> {
  const { data, error } = await sb.rpc('admin_list_users', {
    p_page: page,
    p_limit: limit,
    p_search: search ?? null,
  });

  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function grantRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await sb.from('user_roles').upsert(
    { user_id: userId, role, granted_by: user.id },
    { onConflict: 'user_id,role' },
  );
  if (error) throw error;

  await logAdminAction('grant_role', 'user', userId, { role });
}

export async function revokeRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  const { error } = await sb.from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
  if (error) throw error;

  await logAdminAction('revoke_role', 'user', userId, { role });
}

// ── Subscription management ────────────────────────────────

export async function updateSubscription(
  userId: string,
  plan: string,
  features?: Record<string, unknown>,
): Promise<void> {
  const updates: Record<string, unknown> = {
    plan,
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  if (features) updates.features = features;

  if (plan === 'trial') {
    updates.trial_started_at = new Date().toISOString();
    updates.trial_ends_at = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  const { error } = await sb.from('user_subscriptions')
    .update(updates)
    .eq('user_id', userId);

  if (error) throw error;
  await logAdminAction('update_subscription', 'user', userId, { plan });
}

// ── Business management ────────────────────────────────────

export async function fetchBusinessProfiles(
  page = 0,
  limit = 50,
): Promise<unknown[]> {
  const { data, error } = await sb.from('business_profiles')
    .select('*, businesses(*)')
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) throw error;
  return data ?? [];
}

export async function verifyBusiness(profileId: string): Promise<void> {
  const { error } = await sb.from('business_profiles')
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', profileId);

  if (error) throw error;
  await logAdminAction('verify_business', 'business_profile', profileId, {});
}

// ── Audit log ──────────────────────────────────────────────

export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await sb.from('admin_audit_log').insert({
    admin_id: user.id,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    details: details ?? null,
  });
}

export async function fetchAuditLog(limit = 50): Promise<AuditLogEntry[]> {
  const { data, error } = await sb.from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}
