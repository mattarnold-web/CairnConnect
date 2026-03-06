import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────

export type SubscriptionPlan = 'trial' | 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  features: SubscriptionFeatures;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeatures {
  max_trips: number | null;
  max_recorded_activities: number | null;
  trail_reviews: boolean;
  activity_board: boolean;
  challenges: boolean;
  safety_center: boolean;
  fitness_integrations: boolean;
  chat_messaging: boolean;
  trip_sharing: boolean;
  offline_maps: boolean;
  advanced_analytics: boolean;
}

// ── Plan details ───────────────────────────────────────────

export const PLAN_DETAILS: Record<
  SubscriptionPlan,
  { name: string; description: string; color: string; features: string[] }
> = {
  trial: {
    name: 'Free Trial',
    description: '30-day full access to all features',
    color: '#10B981',
    features: [
      'Unlimited trip planning',
      'Trail reviews & photos',
      'Activity board & messaging',
      'GPS activity recording',
      'Challenges & leaderboards',
      'Safety center & SOS',
      'Fitness app integrations',
      'Trip sharing',
    ],
  },
  free: {
    name: 'Free',
    description: 'Basic access to explore and record',
    color: '#64748b',
    features: [
      'Browse trails & businesses',
      'Record up to 5 activities/month',
      'Basic trip planning',
      'View activity board',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'Full access for serious adventurers',
    color: '#10B981',
    features: [
      'Everything in Free, plus:',
      'Unlimited activity recording',
      'Advanced trip planning',
      'Fitness app integrations',
      'Challenges & leaderboards',
      'Offline maps',
      'Priority support',
    ],
  },
  business: {
    name: 'Business',
    description: 'For guide services & outfitters',
    color: '#818cf8',
    features: [
      'Everything in Pro, plus:',
      'Business listing management',
      'Booking & reservations',
      'Analytics dashboard',
      'Customer messaging',
      'Commission management',
    ],
  },
};

// ── Subscription API ───────────────────────────────────────

export async function fetchSubscription(): Promise<Subscription | null> {
  const { data, error } = await supabase.rpc('get_user_subscription');

  if (error) {
    console.warn('Failed to fetch subscription:', error.message);
    return null;
  }

  // RPC returns array
  const row = Array.isArray(data) ? data[0] : data;
  return row as Subscription | null;
}

// ── Subscription helpers ───────────────────────────────────

export function isTrialActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  return sub.plan === 'trial' && sub.status === 'active';
}

export function getTrialDaysRemaining(sub: Subscription | null): number {
  if (!sub?.trial_ends_at) return 0;
  const diff = new Date(sub.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialExpired(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.plan !== 'trial') return false;
  return getTrialDaysRemaining(sub) <= 0;
}

export function canAccessFeature(
  sub: Subscription | null,
  feature: keyof SubscriptionFeatures,
): boolean {
  if (!sub) return false;

  // Trial users get everything
  if (sub.plan === 'trial' && sub.status === 'active') return true;

  // Check feature flags
  return !!sub.features?.[feature];
}

export function getPlanBadgeColor(plan: SubscriptionPlan): string {
  return PLAN_DETAILS[plan]?.color ?? '#64748b';
}
