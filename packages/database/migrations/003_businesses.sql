CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_local TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_local TEXT,
  category TEXT NOT NULL,
  subcategories TEXT[] DEFAULT '{}',
  activity_types TEXT[] DEFAULT '{}',
  address TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT,
  country_code TEXT,
  postal_code TEXT,
  geom GEOGRAPHY(POINT, 4326),
  phone TEXT,
  email TEXT,
  website_url TEXT,
  booking_url TEXT,
  instagram_handle TEXT,
  facebook_url TEXT,
  tripadvisor_url TEXT,
  yelp_url TEXT,
  alltrails_url TEXT,
  google_maps_url TEXT,
  youtube_url TEXT,
  strava_segment_url TEXT,
  hours JSONB DEFAULT '{}'::jsonb,
  photos TEXT[] DEFAULT '{}',
  cover_photo_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_spotlight BOOLEAN DEFAULT false,
  spotlight_tier TEXT CHECK (spotlight_tier IN ('founding','standard','premium')),
  spotlight_expires_at TIMESTAMPTZ,
  spotlight_stripe_sub_id TEXT,
  special_offer TEXT,
  special_offer_expires_at TIMESTAMPTZ,
  is_claimed BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ,
  google_place_id TEXT,
  osm_id TEXT,
  yelp_id TEXT,
  source TEXT DEFAULT 'seeder',
  tags TEXT[] DEFAULT '{}',
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_geom ON businesses USING GIST(geom);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_activity_types ON businesses USING GIN(activity_types);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_spotlight ON businesses(is_spotlight) WHERE is_spotlight = true;
CREATE INDEX idx_businesses_name_trgm ON businesses USING GIN(name gin_trgm_ops);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_google_place_id ON businesses(google_place_id);

ALTER TABLE businesses ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C')
  ) STORED;

CREATE INDEX idx_businesses_search ON businesses USING GIN(search_vector);

CREATE OR REPLACE FUNCTION generate_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug = LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || LEFT(NEW.id::TEXT, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_slug
  BEFORE INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION generate_business_slug();

CREATE OR REPLACE FUNCTION generate_google_maps_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geom IS NOT NULL AND NEW.google_maps_url IS NULL THEN
    NEW.google_maps_url = 'https://www.google.com/maps/search/?api=1&query=' ||
      ST_Y(NEW.geom::GEOMETRY) || ',' || ST_X(NEW.geom::GEOMETRY);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_maps_url
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION generate_google_maps_url();

CREATE TRIGGER trigger_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
