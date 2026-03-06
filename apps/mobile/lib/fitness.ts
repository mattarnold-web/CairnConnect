/**
 * Fitness Platform Integration Library
 *
 * Manages OAuth connections and activity syncing for external fitness
 * platforms: Strava, Garmin Connect, Apple Health (HealthKit), Fitbit,
 * and Whoop.
 *
 * OAuth flows use `expo-web-browser` (openAuthSessionAsync) which handles
 * the redirect-based auth natively. Tokens are stored server-side in the
 * `fitness_connections` table via Supabase. Apple Health uses native
 * HealthKit access (no OAuth required).
 */

import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Ensure WebBrowser auth sessions complete properly
WebBrowser.maybeCompleteAuthSession();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FitnessPlatform =
  | 'strava'
  | 'garmin'
  | 'apple_health'
  | 'fitbit'
  | 'whoop';

export interface FitnessConnection {
  id: string;
  user_id: string;
  platform: FitnessPlatform;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  external_user_id: string | null;
  scopes: string[] | null;
  is_active: boolean;
  last_synced_at: string | null;
  sync_config: SyncConfig;
  created_at: string;
  updated_at: string;
}

export interface SyncConfig {
  auto_import: boolean;
  activity_types: string[];
}

export interface FitnessActivity {
  id: string;
  user_id: string;
  connection_id: string;
  platform: FitnessPlatform;
  external_activity_id: string;
  activity_type: string | null;
  name: string | null;
  description: string | null;
  started_at: string | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  elevation_gain_meters: number | null;
  calories: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_pace_seconds_per_km: number | null;
  route_geojson: Record<string, unknown> | null;
  matched_trail_id: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface FitnessActivityFilters {
  platform?: FitnessPlatform;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PlatformConfig {
  id: FitnessPlatform;
  name: string;
  description: string;
  color: string;
  iconName: string;
  authUrl: string | null;
  tokenUrl: string | null;
  scopes: string[];
  isNative: boolean;
}

// ---------------------------------------------------------------------------
// Platform Configuration
// ---------------------------------------------------------------------------

export const PLATFORM_CONFIGS: Record<FitnessPlatform, PlatformConfig> = {
  strava: {
    id: 'strava',
    name: 'Strava',
    description: 'Import runs, rides, hikes, and GPS tracks',
    color: '#FC4C02',
    iconName: 'Activity',
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token',
    scopes: ['activity:read_all'],
    isNative: false,
  },
  garmin: {
    id: 'garmin',
    name: 'Garmin Connect',
    description: 'Sync activities, heart rate, and GPS data',
    color: '#007CC3',
    iconName: 'Watch',
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl:
      'https://connectapi.garmin.com/oauth-service/oauth/access_token',
    scopes: [],
    isNative: false,
  },
  apple_health: {
    id: 'apple_health',
    name: 'Apple Health',
    description: 'Steps, workouts, heart rate, and elevation',
    color: '#FF2D55',
    iconName: 'Heart',
    authUrl: null,
    tokenUrl: null,
    scopes: [],
    isNative: true,
  },
  fitbit: {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Activities, heart rate, sleep, and steps',
    color: '#00B0B9',
    iconName: 'Activity',
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    scopes: ['activity', 'heartrate', 'sleep'],
    isNative: false,
  },
  whoop: {
    id: 'whoop',
    name: 'Whoop',
    description: 'Strain, recovery, sleep, and heart rate',
    color: '#1A1A2E',
    iconName: 'Zap',
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    scopes: ['read:workout', 'read:recovery', 'read:sleep'],
    isNative: false,
  },
};

// Ordered list of platforms by relevance for an outdoor adventure app
export const PLATFORM_ORDER: FitnessPlatform[] = [
  'strava',
  'garmin',
  'apple_health',
  'fitbit',
  'whoop',
];

// ---------------------------------------------------------------------------
// Untyped Supabase client (consistent with api.ts pattern)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ---------------------------------------------------------------------------
// OAuth Redirect URI
// ---------------------------------------------------------------------------

function getRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'cairnconnect',
    path: 'fitness-callback',
  });
}

// ---------------------------------------------------------------------------
// Connect Platform — OAuth Flow
// ---------------------------------------------------------------------------

/**
 * Initiates the OAuth flow for a given fitness platform.
 *
 * For platforms using OAuth 2.0 (Strava, Fitbit, Whoop), opens an in-app
 * browser session that redirects back to the app with an authorization code.
 * The code is then exchanged for tokens stored in `fitness_connections`.
 *
 * For Garmin (OAuth 1.0a), the flow is similar but uses request/access token
 * exchange via the server.
 *
 * For Apple Health, this function requests HealthKit permissions natively
 * (iOS only, no OAuth required).
 */
export async function connectPlatform(
  platform: FitnessPlatform,
): Promise<{ success: boolean; error?: string }> {
  const config = PLATFORM_CONFIGS[platform];

  // ---- Apple Health: native HealthKit (iOS only) ----
  if (platform === 'apple_health') {
    return connectAppleHealth();
  }

  // ---- Garmin: OAuth 1.0a ----
  if (platform === 'garmin') {
    return connectGarmin();
  }

  // ---- OAuth 2.0 platforms: Strava, Fitbit, Whoop ----
  if (!config.authUrl) {
    return { success: false, error: 'No auth URL configured for this platform' };
  }

  try {
    const redirectUri = getRedirectUri();
    const clientId = getClientId(platform);

    if (!clientId) {
      return {
        success: false,
        error: `Missing client ID for ${config.name}. Configure EXPO_PUBLIC_${platform.toUpperCase()}_CLIENT_ID in your environment.`,
      };
    }

    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      ...(platform === 'strava' ? { approval_prompt: 'auto' } : {}),
    });

    const authUrl = `${config.authUrl}?${authParams.toString()}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success' || !result.url) {
      return { success: false, error: 'Authentication was cancelled' };
    }

    // Extract authorization code from redirect URL
    const url = new URL(result.url);
    const code = (url.searchParams as any).get('code');

    if (!code) {
      return { success: false, error: 'No authorization code received' };
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(platform, code, redirectUri);

    if (!tokens) {
      return { success: false, error: 'Failed to exchange authorization code' };
    }

    // Store connection in Supabase
    await upsertConnection(platform, tokens);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Platform-specific connection helpers
// ---------------------------------------------------------------------------

/**
 * Apple Health connection via native HealthKit. iOS only. No OAuth needed.
 * Requests read permissions for workouts, steps, heart rate, and elevation.
 */
async function connectAppleHealth(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (Platform.OS !== 'ios') {
    return {
      success: false,
      error: 'Apple Health is only available on iOS',
    };
  }

  try {
    // Apple Health uses HealthKit natively. In a full implementation you would
    // use expo-health or react-native-health here. For now, we register the
    // connection so the UI shows it as connected, and the sync function will
    // query HealthKit at sync time.
    await upsertConnection('apple_health', {
      access_token: 'healthkit_native',
      refresh_token: null,
      expires_at: null,
      external_user_id: 'local',
      scopes: ['workout', 'stepCount', 'heartRate', 'flightsClimbed'],
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Garmin Connect uses OAuth 1.0a (3-legged flow). Because OAuth 1.0a
 * requires server-side signature generation, this initiates the flow
 * via a Supabase Edge Function that handles the request token + signing.
 *
 * Flow:
 * 1. Call edge function to get a request token + authorize URL
 * 2. Open authorize URL in browser
 * 3. On redirect, call edge function to exchange for access token
 */
async function connectGarmin(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const redirectUri = getRedirectUri();

    // Step 1: Get request token from server
    const { data: requestData, error: requestError } = await sb.functions.invoke(
      'garmin-request-token',
      { body: { redirect_uri: redirectUri } },
    );

    if (requestError || !requestData?.authorize_url) {
      return {
        success: false,
        error: 'Failed to initiate Garmin authorization. Make sure the garmin-request-token edge function is deployed.',
      };
    }

    // Step 2: Open browser for user authorization
    const result = await WebBrowser.openAuthSessionAsync(
      requestData.authorize_url,
      redirectUri,
    );

    if (result.type !== 'success' || !result.url) {
      return { success: false, error: 'Garmin authentication was cancelled' };
    }

    // Step 3: Extract oauth_verifier and exchange for access token
    const url = new URL(result.url);
    const oauthVerifier = (url.searchParams as any).get('oauth_verifier');

    if (!oauthVerifier) {
      return { success: false, error: 'No verifier received from Garmin' };
    }

    const { data: tokenData, error: tokenError } = await sb.functions.invoke(
      'garmin-access-token',
      {
        body: {
          request_token: requestData.request_token,
          request_token_secret: requestData.request_token_secret,
          oauth_verifier: oauthVerifier,
        },
      },
    );

    if (tokenError || !tokenData?.access_token) {
      return { success: false, error: 'Failed to complete Garmin authorization' };
    }

    await upsertConnection('garmin', {
      access_token: tokenData.access_token,
      refresh_token: tokenData.access_token_secret ?? null,
      expires_at: null, // Garmin OAuth 1.0a tokens don't expire
      external_user_id: tokenData.user_id ?? null,
      scopes: [],
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Token Exchange
// ---------------------------------------------------------------------------

interface TokenResponse {
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  external_user_id: string | null;
  scopes: string[];
}

/**
 * Exchange an OAuth 2.0 authorization code for access/refresh tokens.
 * Each platform has slightly different response shapes.
 */
async function exchangeCodeForTokens(
  platform: FitnessPlatform,
  code: string,
  redirectUri: string,
): Promise<TokenResponse | null> {
  const config = PLATFORM_CONFIGS[platform];
  if (!config.tokenUrl) return null;

  const clientId = getClientId(platform);
  const clientSecret = getClientSecret(platform);

  if (!clientId || !clientSecret) return null;

  try {
    const body: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    };

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Normalize response across platforms
    switch (platform) {
      case 'strava':
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at
            ? new Date(data.expires_at * 1000).toISOString()
            : null,
          external_user_id: data.athlete?.id?.toString() ?? null,
          scopes: config.scopes,
        };

      case 'fitbit':
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : null,
          external_user_id: data.user_id ?? null,
          scopes: data.scope?.split(' ') ?? config.scopes,
        };

      case 'whoop':
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : null,
          external_user_id: data.user?.user_id?.toString() ?? null,
          scopes: config.scopes,
        };

      default:
        return null;
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Client ID / Secret helpers
// ---------------------------------------------------------------------------

function getClientId(platform: FitnessPlatform): string | null {
  switch (platform) {
    case 'strava':
      return process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID ?? null;
    case 'fitbit':
      return process.env.EXPO_PUBLIC_FITBIT_CLIENT_ID ?? null;
    case 'whoop':
      return process.env.EXPO_PUBLIC_WHOOP_CLIENT_ID ?? null;
    default:
      return null;
  }
}

function getClientSecret(platform: FitnessPlatform): string | null {
  // NOTE: Client secrets should ideally be kept server-side (edge functions).
  // These are exposed here for the initial mobile implementation. In production,
  // consider proxying the token exchange through a Supabase Edge Function.
  switch (platform) {
    case 'strava':
      return process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET ?? null;
    case 'fitbit':
      return process.env.EXPO_PUBLIC_FITBIT_CLIENT_SECRET ?? null;
    case 'whoop':
      return process.env.EXPO_PUBLIC_WHOOP_CLIENT_SECRET ?? null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Supabase Connection CRUD
// ---------------------------------------------------------------------------

/**
 * Insert or update a fitness connection row for the current user.
 */
async function upsertConnection(
  platform: FitnessPlatform,
  tokens: TokenResponse,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await sb
    .from('fitness_connections')
    .upsert(
      {
        user_id: user.id,
        platform,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_at,
        external_user_id: tokens.external_user_id,
        scopes: tokens.scopes,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' },
    );

  if (error) throw error;
}

/**
 * Fetch all fitness connections for the current user.
 */
export async function fetchConnections(): Promise<FitnessConnection[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from('fitness_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as FitnessConnection[];
}

/**
 * Disconnect (deactivate) a fitness platform connection.
 */
export async function disconnectPlatform(
  connectionId: string,
): Promise<void> {
  const { error } = await sb
    .from('fitness_connections')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', connectionId);

  if (error) throw error;
}

/**
 * Update sync configuration for a connection.
 */
export async function updateSyncConfig(
  connectionId: string,
  syncConfig: Partial<SyncConfig>,
): Promise<void> {
  // Fetch current config first
  const { data: current, error: fetchError } = await sb
    .from('fitness_connections')
    .select('sync_config')
    .eq('id', connectionId)
    .single();

  if (fetchError) throw fetchError;

  const merged = { ...(current?.sync_config ?? {}), ...syncConfig };

  const { error } = await sb
    .from('fitness_connections')
    .update({
      sync_config: merged,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Activity Syncing
// ---------------------------------------------------------------------------

/**
 * Sync recent activities from a connected fitness platform.
 * Fetches activities from the platform API and upserts them into
 * the `fitness_activities` table.
 */
export async function syncActivities(
  connectionId: string,
): Promise<{ imported: number; error?: string }> {
  try {
    // Fetch the connection details
    const { data: connection, error: connError } = await sb
      .from('fitness_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (connError || !connection) {
      return { imported: 0, error: 'Connection not found' };
    }

    const conn = connection as FitnessConnection;

    // Check if token refresh is needed
    if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
      const refreshed = await refreshTokenIfNeeded(conn);
      if (!refreshed) {
        return { imported: 0, error: 'Token expired and refresh failed. Please reconnect.' };
      }
    }

    // Fetch activities based on platform
    let activities: Partial<FitnessActivity>[] = [];

    switch (conn.platform) {
      case 'strava':
        activities = await fetchStravaActivities(conn);
        break;
      case 'garmin':
        activities = await fetchGarminActivities(conn);
        break;
      case 'fitbit':
        activities = await fetchFitbitActivities(conn);
        break;
      case 'whoop':
        activities = await fetchWhoopActivities(conn);
        break;
      case 'apple_health':
        activities = await fetchAppleHealthActivities(conn);
        break;
    }

    if (activities.length === 0) {
      // Update last_synced_at even if no new activities
      await sb
        .from('fitness_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', connectionId);
      return { imported: 0 };
    }

    // Upsert activities into database
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rows = activities.map((a) => ({
      user_id: user!.id,
      connection_id: connectionId,
      platform: conn.platform,
      external_activity_id: a.external_activity_id,
      activity_type: a.activity_type,
      name: a.name,
      description: a.description ?? null,
      started_at: a.started_at,
      duration_seconds: a.duration_seconds,
      distance_meters: a.distance_meters,
      elevation_gain_meters: a.elevation_gain_meters,
      calories: a.calories ?? null,
      avg_heart_rate: a.avg_heart_rate ?? null,
      max_heart_rate: a.max_heart_rate ?? null,
      avg_pace_seconds_per_km: a.avg_pace_seconds_per_km ?? null,
      route_geojson: a.route_geojson ?? null,
      raw_data: a.raw_data ?? null,
    }));

    const { error: upsertError } = await sb
      .from('fitness_activities')
      .upsert(rows, { onConflict: 'connection_id,external_activity_id' });

    if (upsertError) {
      return { imported: 0, error: upsertError.message };
    }

    // Update last synced timestamp
    await sb
      .from('fitness_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connectionId);

    return { imported: activities.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return { imported: 0, error: message };
  }
}

// ---------------------------------------------------------------------------
// Platform-specific activity fetchers
// ---------------------------------------------------------------------------

/** Map Strava activity types to CairnConnect types */
function mapStravaActivityType(stravaType: string): string {
  const mapping: Record<string, string> = {
    Hike: 'hiking',
    Walk: 'hiking',
    Run: 'trail_running',
    TrailRun: 'trail_running',
    Ride: 'cycling',
    MountainBikeRide: 'mountain_biking',
    GravelRide: 'cycling',
    BackcountrySki: 'skiing',
    NordicSki: 'cross_country_skiing',
    AlpineSki: 'skiing',
    Snowboard: 'snowboarding',
    Canoeing: 'paddling',
    Kayaking: 'paddling',
    RockClimbing: 'climbing',
  };
  return mapping[stravaType] ?? stravaType.toLowerCase();
}

async function fetchStravaActivities(
  conn: FitnessConnection,
): Promise<Partial<FitnessActivity>[]> {
  const after = conn.last_synced_at
    ? Math.floor(new Date(conn.last_synced_at).getTime() / 1000)
    : Math.floor(Date.now() / 1000) - 30 * 86400; // last 30 days

  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`,
    {
      headers: { Authorization: `Bearer ${conn.access_token}` },
    },
  );

  if (!response.ok) return [];

  const data = await response.json();

  return (data as Record<string, unknown>[]).map((a) => ({
    external_activity_id: String(a.id),
    activity_type: mapStravaActivityType(a.type as string),
    name: a.name as string,
    description: (a.description as string) ?? null,
    started_at: a.start_date as string,
    duration_seconds: a.elapsed_time as number,
    distance_meters: a.distance as number,
    elevation_gain_meters: a.total_elevation_gain as number,
    calories: (a.calories as number) ?? null,
    avg_heart_rate: (a.average_heartrate as number) ?? null,
    max_heart_rate: (a.max_heartrate as number) ?? null,
    avg_pace_seconds_per_km:
      (a.distance as number) > 0
        ? ((a.elapsed_time as number) / (a.distance as number)) * 1000
        : null,
    raw_data: a as Record<string, unknown>,
  }));
}

async function fetchGarminActivities(
  conn: FitnessConnection,
): Promise<Partial<FitnessActivity>[]> {
  // Garmin Health API uses OAuth 1.0a signed requests.
  // In a full implementation, this would go through a Supabase Edge Function
  // that handles the OAuth 1.0a request signing.
  try {
    const { data, error } = await sb.functions.invoke('garmin-sync-activities', {
      body: { connection_id: conn.id },
    });

    if (error || !data?.activities) return [];

    return (data.activities as Record<string, unknown>[]).map((a) => ({
      external_activity_id: String(a.activityId ?? a.summaryId),
      activity_type: mapGarminActivityType(a.activityType as string),
      name: (a.activityName as string) ?? 'Garmin Activity',
      started_at: a.startTimeInSeconds
        ? new Date((a.startTimeInSeconds as number) * 1000).toISOString()
        : null,
      duration_seconds: a.durationInSeconds as number,
      distance_meters: a.distanceInMeters as number,
      elevation_gain_meters: (a.elevationGainInMeters as number) ?? null,
      calories: (a.activeKilocalories as number) ?? null,
      avg_heart_rate: (a.averageHeartRateInBeatsPerMinute as number) ?? null,
      max_heart_rate: (a.maxHeartRateInBeatsPerMinute as number) ?? null,
      raw_data: a as Record<string, unknown>,
    }));
  } catch {
    return [];
  }
}

function mapGarminActivityType(garminType: string): string {
  const mapping: Record<string, string> = {
    HIKING: 'hiking',
    WALKING: 'hiking',
    RUNNING: 'trail_running',
    TRAIL_RUNNING: 'trail_running',
    CYCLING: 'cycling',
    MOUNTAIN_BIKING: 'mountain_biking',
    SKIING: 'skiing',
    SNOWBOARDING: 'snowboarding',
    PADDLEBOARDING: 'paddling',
    KAYAKING: 'paddling',
    ROCK_CLIMBING: 'climbing',
  };
  return mapping[garminType] ?? garminType.toLowerCase();
}

async function fetchFitbitActivities(
  conn: FitnessConnection,
): Promise<Partial<FitnessActivity>[]> {
  const afterDate = conn.last_synced_at
    ? conn.last_synced_at.split('T')[0]
    : new Date(Date.now() - 30 * 86400 * 1000).toISOString().split('T')[0];

  const response = await fetch(
    `https://api.fitbit.com/1/user/-/activities/list.json?afterDate=${afterDate}&sort=desc&offset=0&limit=50`,
    {
      headers: { Authorization: `Bearer ${conn.access_token}` },
    },
  );

  if (!response.ok) return [];

  const data = await response.json();
  const activities = data?.activities ?? [];

  return (activities as Record<string, unknown>[]).map((a) => ({
    external_activity_id: String(a.logId),
    activity_type: mapFitbitActivityType(a.activityName as string),
    name: a.activityName as string,
    started_at: a.startTime as string,
    duration_seconds: a.activeDuration
      ? Math.round((a.activeDuration as number) / 1000)
      : null,
    distance_meters: a.distance
      ? (a.distance as number) * 1000 // Fitbit returns km
      : null,
    elevation_gain_meters: (a.elevationGain as number) ?? null,
    calories: (a.calories as number) ?? null,
    avg_heart_rate: (a.averageHeartRate as number) ?? null,
    raw_data: a as Record<string, unknown>,
  }));
}

function mapFitbitActivityType(fitbitName: string): string {
  const lower = (fitbitName ?? '').toLowerCase();
  if (lower.includes('hike') || lower.includes('walk')) return 'hiking';
  if (lower.includes('run') || lower.includes('trail')) return 'trail_running';
  if (lower.includes('bike') || lower.includes('cycling')) return 'cycling';
  if (lower.includes('mountain bike')) return 'mountain_biking';
  if (lower.includes('ski')) return 'skiing';
  if (lower.includes('paddle') || lower.includes('kayak')) return 'paddling';
  return lower;
}

async function fetchWhoopActivities(
  conn: FitnessConnection,
): Promise<Partial<FitnessActivity>[]> {
  const start = conn.last_synced_at
    ? conn.last_synced_at
    : new Date(Date.now() - 30 * 86400 * 1000).toISOString();

  const response = await fetch(
    `https://api.prod.whoop.com/developer/v1/activity/workout?start=${encodeURIComponent(start)}&limit=50`,
    {
      headers: { Authorization: `Bearer ${conn.access_token}` },
    },
  );

  if (!response.ok) return [];

  const data = await response.json();
  const records = data?.records ?? [];

  return (records as Record<string, unknown>[]).map((a) => ({
    external_activity_id: String(a.id),
    activity_type: mapWhoopActivityType((a.sport_id as number) ?? 0),
    name: `Whoop Workout`,
    started_at: a.start as string,
    duration_seconds: a.end && a.start
      ? Math.round(
          (new Date(a.end as string).getTime() -
            new Date(a.start as string).getTime()) /
            1000,
        )
      : null,
    distance_meters: (a.distance_meter as number) ?? null,
    calories: a.kilojoule ? Math.round((a.kilojoule as number) / 4.184) : null,
    avg_heart_rate: (a.average_heart_rate as number) ?? null,
    max_heart_rate: (a.max_heart_rate as number) ?? null,
    raw_data: a as Record<string, unknown>,
  }));
}

function mapWhoopActivityType(sportId: number): string {
  const mapping: Record<number, string> = {
    1: 'cycling',
    16: 'hiking',
    33: 'trail_running',
    43: 'skiing',
    44: 'snowboarding',
    52: 'climbing',
    56: 'paddling',
    63: 'mountain_biking',
  };
  return mapping[sportId] ?? 'other';
}

async function fetchAppleHealthActivities(
  _conn: FitnessConnection,
): Promise<Partial<FitnessActivity>[]> {
  // Apple Health uses native HealthKit APIs. In a full implementation,
  // you would use expo-health or react-native-health here to query
  // HKWorkout samples from the HealthKit store.
  //
  // Example with react-native-health:
  //   const workouts = await AppleHealthKit.getSamples({
  //     type: 'Workout',
  //     startDate: after.toISOString(),
  //   });
  //
  // For now, return empty — this will be populated when the HealthKit
  // native module is configured.
  return [];
}

// ---------------------------------------------------------------------------
// Token Refresh
// ---------------------------------------------------------------------------

/**
 * Refresh an expired OAuth 2.0 token. Returns true if the refresh succeeded.
 */
async function refreshTokenIfNeeded(
  conn: FitnessConnection,
): Promise<boolean> {
  if (!conn.refresh_token) return false;

  const config = PLATFORM_CONFIGS[conn.platform];
  if (!config.tokenUrl) return false;

  // Garmin tokens don't expire
  if (conn.platform === 'garmin') return true;

  // Apple Health doesn't use OAuth
  if (conn.platform === 'apple_health') return true;

  const clientId = getClientId(conn.platform);
  const clientSecret = getClientSecret(conn.platform);
  if (!clientId || !clientSecret) return false;

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: conn.refresh_token,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) return false;

    const data = await response.json();

    const expiresAt = data.expires_at
      ? new Date(data.expires_at * 1000).toISOString()
      : data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null;

    await sb
      .from('fitness_connections')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? conn.refresh_token,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conn.id);

    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fitness Activities Query
// ---------------------------------------------------------------------------

/**
 * Fetch imported fitness activities with optional filters.
 */
export async function fetchFitnessActivities(
  filters: FitnessActivityFilters = {},
): Promise<FitnessActivity[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = sb
    .from('fitness_activities')
    .select('*')
    .eq('user_id', user.id);

  if (filters.platform) {
    query = query.eq('platform', filters.platform);
  }
  if (filters.activityType) {
    query = query.eq('activity_type', filters.activityType);
  }
  if (filters.startDate) {
    query = query.gte('started_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('started_at', filters.endDate);
  }

  query = query
    .order('started_at', { ascending: false })
    .range(
      filters.offset ?? 0,
      (filters.offset ?? 0) + (filters.limit ?? 50) - 1,
    );

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as FitnessActivity[];
}

// ---------------------------------------------------------------------------
// Trail Matching
// ---------------------------------------------------------------------------

/**
 * Match an imported fitness activity to a CairnConnect trail by GPS proximity.
 * Uses the `match_fitness_activity_to_trail` database function.
 */
export async function matchActivityToTrail(
  activityId: string,
  radiusM = 500,
): Promise<string | null> {
  const { data, error } = await sb.rpc('match_fitness_activity_to_trail', {
    p_activity_id: activityId,
    p_radius_m: radiusM,
  });

  if (error) return null;
  return data as string | null;
}

// ---------------------------------------------------------------------------
// Aggregate Stats
// ---------------------------------------------------------------------------

export interface FitnessStats {
  totalActivities: number;
  totalDistanceMeters: number;
  totalElevationMeters: number;
  totalDurationSeconds: number;
  totalCalories: number;
}

/**
 * Compute aggregate stats across all imported fitness activities.
 */
export async function fetchFitnessStats(): Promise<FitnessStats> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalActivities: 0,
      totalDistanceMeters: 0,
      totalElevationMeters: 0,
      totalDurationSeconds: 0,
      totalCalories: 0,
    };
  }

  const { data, error } = await sb
    .from('fitness_activities')
    .select('distance_meters, elevation_gain_meters, duration_seconds, calories')
    .eq('user_id', user.id);

  if (error || !data) {
    return {
      totalActivities: 0,
      totalDistanceMeters: 0,
      totalElevationMeters: 0,
      totalDurationSeconds: 0,
      totalCalories: 0,
    };
  }

  const rows = data as {
    distance_meters: number | null;
    elevation_gain_meters: number | null;
    duration_seconds: number | null;
    calories: number | null;
  }[];

  return {
    totalActivities: rows.length,
    totalDistanceMeters: rows.reduce((s, r) => s + (r.distance_meters ?? 0), 0),
    totalElevationMeters: rows.reduce(
      (s, r) => s + (r.elevation_gain_meters ?? 0),
      0,
    ),
    totalDurationSeconds: rows.reduce(
      (s, r) => s + (r.duration_seconds ?? 0),
      0,
    ),
    totalCalories: rows.reduce((s, r) => s + (r.calories ?? 0), 0),
  };
}
