CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'strava','garmin','apple_health','google_health',
    'wahoo','polar','suunto','coros','terra'
  )),
  is_connected BOOLEAN DEFAULT true,
  access_token TEXT,
  refresh_token TEXT,
  token_secret TEXT,
  expires_at TIMESTAMPTZ,
  athlete_id TEXT,
  athlete_name TEXT,
  profile_photo_url TEXT,
  last_sync_at TIMESTAMPTZ,
  total_activities_synced INTEGER DEFAULT 0,
  sync_enabled BOOLEAN DEFAULT true,
  webhook_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
