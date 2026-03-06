-- ---------------------------------------------------------------------------
-- 021: Fitness Platform Integrations
-- ---------------------------------------------------------------------------
-- Adds tables for connecting external fitness platforms (Strava, Garmin,
-- Apple Health, Fitbit, Whoop) and storing imported activities with GPS
-- tracks, heart rate, and trail matching.
-- ---------------------------------------------------------------------------

-- Fitness platform connections
CREATE TABLE IF NOT EXISTS fitness_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('strava', 'garmin', 'apple_health', 'fitbit', 'whoop')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  external_user_id TEXT,
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_config JSONB DEFAULT '{"auto_import": true, "activity_types": ["hiking", "trail_running", "mountain_biking", "cycling"]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Imported activities from fitness platforms
CREATE TABLE IF NOT EXISTS fitness_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES fitness_connections(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_activity_id TEXT NOT NULL,
  activity_type TEXT,
  name TEXT,
  description TEXT,
  started_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  distance_meters FLOAT,
  elevation_gain_meters FLOAT,
  calories INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_pace_seconds_per_km FLOAT,
  route_geojson JSONB,
  start_point GEOGRAPHY(POINT, 4326),
  matched_trail_id UUID REFERENCES trails(id) ON DELETE SET NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(connection_id, external_activity_id)
);

-- Indexes for common query patterns
CREATE INDEX idx_fitness_activities_user ON fitness_activities(user_id);
CREATE INDEX idx_fitness_activities_started ON fitness_activities(started_at DESC);
CREATE INDEX idx_fitness_activities_start_point ON fitness_activities USING GIST(start_point);
CREATE INDEX idx_fitness_connections_user ON fitness_connections(user_id);

-- Row Level Security
ALTER TABLE fitness_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_activities ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own connections
CREATE POLICY fitness_connections_user ON fitness_connections
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see and manage their own imported activities
CREATE POLICY fitness_activities_user ON fitness_activities
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Match fitness activity to nearest trail by start point proximity
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_fitness_activity_to_trail(
  p_activity_id UUID,
  p_radius_m FLOAT DEFAULT 500
)
RETURNS UUID AS $$
DECLARE
  v_trail_id UUID;
  v_start_point GEOGRAPHY;
BEGIN
  SELECT start_point INTO v_start_point
  FROM fitness_activities
  WHERE id = p_activity_id;

  IF v_start_point IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT t.id INTO v_trail_id
  FROM trails t
  WHERE ST_DWithin(
    t.location::geography,
    v_start_point,
    p_radius_m
  )
  ORDER BY ST_Distance(t.location::geography, v_start_point)
  LIMIT 1;

  IF v_trail_id IS NOT NULL THEN
    UPDATE fitness_activities
    SET matched_trail_id = v_trail_id
    WHERE id = p_activity_id;
  END IF;

  RETURN v_trail_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
