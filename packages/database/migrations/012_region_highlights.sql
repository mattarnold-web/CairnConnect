CREATE TABLE region_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name TEXT NOT NULL,
  city_slug TEXT,
  center_point GEOGRAPHY(POINT, 4326) NOT NULL,
  radius_km INTEGER DEFAULT 50,
  activity_slug TEXT NOT NULL,
  activity_label TEXT NOT NULL,
  activity_emoji TEXT,
  trail_count INTEGER DEFAULT 0,
  business_count INTEGER DEFAULT 0,
  active_posts_count INTEGER DEFAULT 0,
  score DECIMAL(10,4) GENERATED ALWAYS AS (
    (trail_count::DECIMAL * 0.4) + (business_count::DECIMAL * 0.3) + (active_posts_count::DECIMAL * 0.3)
  ) STORED,
  is_seasonal BOOLEAN DEFAULT false,
  best_season TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_name, activity_slug)
);

CREATE INDEX idx_region_highlights_location ON region_highlights USING GIST(center_point);
CREATE INDEX idx_region_highlights_score ON region_highlights(score DESC);
