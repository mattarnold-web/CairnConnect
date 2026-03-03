CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN (
    'gpx_upload','fit_upload','strava','garmin',
    'apple_health','google_health','native_recording',
    'wahoo','polar','suunto','manual'
  )),
  external_activity_id TEXT,
  activity_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  distance_meters DECIMAL(10,2),
  duration_seconds INTEGER,
  elevation_gain_meters DECIMAL(8,2),
  elevation_loss_meters DECIMAL(8,2),
  max_elevation_meters DECIMAL(8,2),
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_speed_ms DECIMAL(8,4),
  max_speed_ms DECIMAL(8,4),
  avg_power_watts INTEGER,
  avg_cadence INTEGER,
  calories INTEGER,
  avg_temperature_celsius DECIMAL(5,2),
  route_geojson JSONB,
  start_point GEOGRAPHY(POINT, 4326),
  end_point GEOGRAPHY(POINT, 4326),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  device_name TEXT,
  is_public BOOLEAN DEFAULT true,
  activity_post_id UUID REFERENCES activity_posts(id),
  matched_trail_id UUID REFERENCES trails(id),
  original_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source, external_activity_id)
);

CREATE INDEX idx_user_activities_start ON user_activities USING GIST(start_point);
CREATE INDEX idx_user_activities_user_date ON user_activities(user_id, started_at DESC);
CREATE INDEX idx_user_activities_matched_trail ON user_activities(matched_trail_id);
