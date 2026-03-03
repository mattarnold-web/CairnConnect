export interface UserActivity {
  id: string;
  user_id: string;
  source: ActivitySource;
  external_activity_id: string | null;
  activity_type: string;
  title: string | null;
  description: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  elevation_gain_meters: number | null;
  elevation_loss_meters: number | null;
  max_elevation_meters: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_speed_ms: number | null;
  max_speed_ms: number | null;
  avg_power_watts: number | null;
  avg_cadence: number | null;
  calories: number | null;
  route_geojson: object | null;
  lat: number | null;
  lng: number | null;
  started_at: string | null;
  ended_at: string | null;
  device_name: string | null;
  is_public: boolean;
  matched_trail_id: string | null;
  original_file_url: string | null;
  created_at: string;
}

export type ActivitySource =
  | 'gpx_upload' | 'fit_upload' | 'strava' | 'garmin'
  | 'apple_health' | 'google_health' | 'native_recording'
  | 'wahoo' | 'polar' | 'suunto' | 'manual';
