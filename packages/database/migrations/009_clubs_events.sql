CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  activity_types TEXT[] DEFAULT '{}',
  geom GEOGRAPHY(POINT, 4326),
  city TEXT,
  country TEXT,
  cover_photo_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  website_url TEXT,
  instagram_handle TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clubs_geom ON clubs USING GIST(geom);
CREATE INDEX idx_clubs_activities ON clubs USING GIN(activity_types);

CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','moderator','member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','pending','banned')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  club_id UUID REFERENCES clubs(id),
  organizer_id UUID NOT NULL REFERENCES users(id),
  activity_type TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  geom GEOGRAPHY(POINT, 4326),
  location_name TEXT,
  trail_id UUID REFERENCES trails(id),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  cover_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_geom ON events USING GIST(geom);
CREATE INDEX idx_events_date ON events(starts_at);
