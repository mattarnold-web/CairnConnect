CREATE TABLE trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_local TEXT,
  activity_types TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('green','blue','black','double_black','proline')),
  difficulty_label TEXT,
  technical_rating INTEGER,
  distance_meters DECIMAL(10,2),
  elevation_gain_meters DECIMAL(8,2),
  elevation_loss_meters DECIMAL(8,2),
  max_elevation_meters DECIMAL(8,2),
  min_elevation_meters DECIMAL(8,2),
  trail_type TEXT CHECK (trail_type IN ('loop','out_and_back','point_to_point','network')),
  surface_type TEXT[] DEFAULT '{}',
  start_point GEOGRAPHY(POINT, 4326),
  end_point GEOGRAPHY(POINT, 4326),
  route_geojson JSONB,
  city TEXT,
  state_province TEXT,
  country TEXT,
  country_code TEXT,
  current_condition TEXT DEFAULT 'unknown' CHECK (current_condition IN ('open','caution','closed','unknown')),
  condition_updated_at TIMESTAMPTZ,
  requires_permit BOOLEAN DEFAULT false,
  permit_id UUID,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  ride_count INTEGER DEFAULT 0,
  photos TEXT[] DEFAULT '{}',
  cover_photo_url TEXT,
  elevation_profile_url TEXT,
  source TEXT DEFAULT 'osm',
  external_id TEXT,
  best_seasons TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trails_start ON trails USING GIST(start_point);
CREATE INDEX idx_trails_activity_types ON trails USING GIN(activity_types);
CREATE INDEX idx_trails_difficulty ON trails(difficulty);
CREATE INDEX idx_trails_city ON trails(city);
CREATE INDEX idx_trails_slug ON trails(slug);
CREATE INDEX idx_trails_name_trgm ON trails USING GIN(name gin_trgm_ops);

ALTER TABLE trails ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(city, '')), 'B')
  ) STORED;

CREATE INDEX idx_trails_search ON trails USING GIN(search_vector);

CREATE TRIGGER trigger_trails_updated_at
  BEFORE UPDATE ON trails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
