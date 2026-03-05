-- ============================================================================
-- CairnConnect Full Database Schema
-- ============================================================================
--
-- This is the CORRECT and complete CairnConnect schema.
--
-- CairnConnect is an outdoor adventure platform with tables for users,
-- businesses, trails, reviews, user_activities, trail_conditions,
-- activity_posts, clubs, events, permits, and more.
--
-- IF YOU PREVIOUSLY RAN A WRONG SCHEMA (e.g., a generic social marketplace
-- with tables like profiles, follows, listings, conversations, etc.), you
-- must RESET your Supabase database before running this file.
--
-- HOW TO RESET YOUR SUPABASE DATABASE:
--   1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
--   2. Select your project
--   3. Navigate to: Project Settings -> Database
--   4. Scroll down to "Reset Database"
--   5. Click "Reset Database" and confirm
--   6. Wait for the reset to complete
--   7. Then run this entire SQL file in the SQL Editor
--
-- This file consolidates migrations 001 through 019 into a single file.
-- ============================================================================


-- ============================================================================
-- 001: Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================================
-- 002: Users
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location_name TEXT,
  home_point GEOGRAPHY(POINT, 4326),
  activity_preferences TEXT[] DEFAULT '{}',
  preferred_skill_level TEXT CHECK (preferred_skill_level IN ('beginner','intermediate','advanced','expert')),
  skill_levels JSONB DEFAULT '{}'::jsonb,
  is_pro_subscriber BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  pro_expires_at TIMESTAMPTZ,
  push_token TEXT,
  preferred_units TEXT DEFAULT 'imperial' CHECK (preferred_units IN ('imperial','metric')),
  preferred_language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_location ON users USING GIST(home_point);
CREATE INDEX idx_users_activities ON users USING GIN(activity_preferences);
CREATE INDEX idx_users_username ON users(username);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- 003: Businesses
-- ============================================================================

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

ALTER TABLE businesses ADD COLUMN search_vector tsvector;
CREATE INDEX idx_businesses_search ON businesses USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_business_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_businesses_search_vector
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_business_search_vector();

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


-- ============================================================================
-- 004: Trails
-- ============================================================================

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

ALTER TABLE trails ADD COLUMN search_vector tsvector;
CREATE INDEX idx_trails_search ON trails USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_trail_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trails_search_vector
  BEFORE INSERT OR UPDATE ON trails
  FOR EACH ROW EXECUTE FUNCTION update_trail_search_vector();

CREATE TRIGGER trigger_trails_updated_at
  BEFORE UPDATE ON trails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- 005: Trail Conditions
-- ============================================================================

CREATE TABLE trail_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('open','caution','closed')),
  severity TEXT CHECK (severity IN ('minor','moderate','severe')),
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trail_conditions_trail ON trail_conditions(trail_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_trail_condition()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trails SET
    current_condition = (
      SELECT condition FROM trail_conditions
      WHERE trail_id = NEW.trail_id
        AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY upvotes DESC, created_at DESC
      LIMIT 1
    ),
    condition_updated_at = NOW()
  WHERE id = NEW.trail_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trail_condition
  AFTER INSERT ON trail_conditions
  FOR EACH ROW EXECUTE FUNCTION update_trail_condition();


-- ============================================================================
-- 006: Business Analytics
-- ============================================================================

CREATE TABLE business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  direction_requests INTEGER DEFAULT 0,
  call_clicks INTEGER DEFAULT 0,
  booking_clicks INTEGER DEFAULT 0,
  search_impressions INTEGER DEFAULT 0,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, date)
);

CREATE INDEX idx_analytics_business_date ON business_analytics(business_id, date DESC);

CREATE OR REPLACE FUNCTION increment_business_stat(
  p_business_id UUID, p_date DATE, p_stat TEXT, p_source TEXT DEFAULT 'unknown'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO business_analytics (business_id, date, source)
  VALUES (p_business_id, p_date, p_source)
  ON CONFLICT (business_id, date)
  DO UPDATE SET
    views = CASE WHEN p_stat = 'view' THEN business_analytics.views + 1 ELSE business_analytics.views END,
    website_clicks = CASE WHEN p_stat = 'website_click' THEN business_analytics.website_clicks + 1 ELSE business_analytics.website_clicks END,
    direction_requests = CASE WHEN p_stat = 'direction' THEN business_analytics.direction_requests + 1 ELSE business_analytics.direction_requests END,
    call_clicks = CASE WHEN p_stat = 'call' THEN business_analytics.call_clicks + 1 ELSE business_analytics.call_clicks END,
    booking_clicks = CASE WHEN p_stat = 'booking' THEN business_analytics.booking_clicks + 1 ELSE business_analytics.booking_clicks END,
    search_impressions = CASE WHEN p_stat = 'impression' THEN business_analytics.search_impressions + 1 ELSE business_analytics.search_impressions END;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 007: Spotlight Subscriptions
-- ============================================================================

CREATE TABLE spotlight_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing','incomplete')),
  tier TEXT NOT NULL CHECK (tier IN ('founding','standard','premium')),
  price_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spotlight_subs_business ON spotlight_subscriptions(business_id);
CREATE INDEX idx_spotlight_subs_stripe ON spotlight_subscriptions(stripe_subscription_id);


-- ============================================================================
-- 008: Reviews
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('business','trail')),
  entity_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  photos TEXT[] DEFAULT '{}',
  owner_response TEXT,
  owner_response_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(author_id, entity_type, entity_id)
);

CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_entity_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'business' THEN
    UPDATE businesses SET
      rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE entity_type = 'business' AND entity_id = NEW.entity_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = 'business' AND entity_id = NEW.entity_id)
    WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'trail' THEN
    UPDATE trails SET
      rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE entity_type = 'trail' AND entity_id = NEW.entity_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE entity_type = 'trail' AND entity_id = NEW.entity_id)
    WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_entity_rating();


-- ============================================================================
-- 009: Clubs & Events
-- ============================================================================

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


-- ============================================================================
-- 010: Activity Board (Posts, Participants, Messages)
-- ============================================================================

CREATE TABLE activity_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('im_going','open_permit','lfg')),
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location_point GEOGRAPHY(POINT, 4326),
  trail_id UUID REFERENCES trails(id),
  activity_date TIMESTAMPTZ NOT NULL,
  activity_end_date TIMESTAMPTZ,
  skill_level TEXT CHECK (skill_level IN ('beginner','intermediate','advanced','expert')),
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 1,
  permit_required BOOLEAN DEFAULT false,
  permit_type TEXT,
  permit_slots_available INTEGER,
  cost_share DECIMAL(10,2),
  gear_required TEXT[],
  contact_method TEXT DEFAULT 'in_app' CHECK (contact_method IN ('in_app','email','phone')),
  contact_info TEXT,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','full','cancelled','completed')),
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_activity_post_expires()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.activity_date + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_expires_at
  BEFORE INSERT OR UPDATE ON activity_posts
  FOR EACH ROW EXECUTE FUNCTION set_activity_post_expires();

CREATE INDEX idx_activity_posts_location ON activity_posts USING GIST(location_point);
CREATE INDEX idx_activity_posts_activity_type ON activity_posts(activity_type);
CREATE INDEX idx_activity_posts_date ON activity_posts(activity_date);
CREATE INDEX idx_activity_posts_status ON activity_posts(status);

CREATE TABLE activity_post_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES activity_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','declined','waitlist')),
  message TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE activity_post_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES activity_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  parent_message_id UUID REFERENCES activity_post_messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE activity_posts
  SET current_participants = 1 + (
    SELECT COUNT(*) FROM activity_post_participants
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND status = 'approved'
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  UPDATE activity_posts
  SET status = CASE
    WHEN current_participants >= max_participants THEN 'full'
    ELSE 'active'
  END
  WHERE id = COALESCE(NEW.post_id, OLD.post_id) AND status NOT IN ('cancelled','completed');

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON activity_post_participants
  FOR EACH ROW EXECUTE FUNCTION update_participant_count();


-- ============================================================================
-- 011: Activity Types (Seed Data)
-- ============================================================================

CREATE TABLE activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  emoji TEXT,
  icon_url TEXT,
  category TEXT CHECK (category IN ('mountain','water','snow','air','nature')),
  is_seasonal BOOLEAN DEFAULT false,
  seasons TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0
);

INSERT INTO activity_types (slug, label, emoji, category, seasons, sort_order) VALUES
  ('mtb', 'Mountain Biking', '🚵', 'mountain', '{spring,summer,fall}', 1),
  ('hiking', 'Hiking', '🥾', 'mountain', '{spring,summer,fall}', 2),
  ('trail_running', 'Trail Running', '🏃', 'mountain', '{spring,summer,fall}', 3),
  ('climbing', 'Rock Climbing', '🧗', 'mountain', '{spring,summer,fall}', 4),
  ('road_cycling', 'Road Cycling', '🚴', 'mountain', '{spring,summer,fall}', 5),
  ('camping', 'Camping', '🏕️', 'mountain', '{spring,summer,fall}', 6),
  ('horseback', 'Horseback Riding', '🏇', 'mountain', '{spring,summer,fall}', 7),
  ('disc_golf', 'Disc Golf', '🥏', 'mountain', '{spring,summer,fall}', 8),
  ('orienteering', 'Orienteering', '🧭', 'mountain', '{spring,summer,fall}', 9),
  ('fly_fishing', 'Fly Fishing', '🎣', 'mountain', '{spring,summer,fall}', 10),
  ('kayaking', 'Kayaking / Paddling', '🛶', 'water', '{spring,summer,fall}', 11),
  ('surfing', 'Surfing', '🏄', 'water', '{all}', 12),
  ('scuba', 'Scuba / Snorkeling', '🤿', 'water', '{summer,fall}', 13),
  ('kitesurfing', 'Kite Surfing', '🪁', 'water', '{spring,summer,fall}', 14),
  ('wild_swimming', 'Wild Swimming', '🏊', 'water', '{summer}', 15),
  ('motorized_water', 'Motorized Water Sports', '🚤', 'water', '{summer}', 16),
  ('standup_paddle', 'Stand-Up Paddleboard', '🏄', 'water', '{spring,summer,fall}', 17),
  ('whitewater', 'Whitewater Rafting', '🌊', 'water', '{spring,summer}', 18),
  ('skiing', 'Skiing', '⛷️', 'snow', '{winter}', 19),
  ('snowboarding', 'Snowboarding', '🏂', 'snow', '{winter}', 20),
  ('nordic_skiing', 'Nordic Skiing', '🎿', 'snow', '{winter}', 21),
  ('snowshoeing', 'Snowshoeing', '🥾', 'snow', '{winter}', 22),
  ('ice_climbing', 'Ice Climbing', '🧊', 'snow', '{winter}', 23),
  ('paragliding', 'Paragliding', '🪂', 'air', '{spring,summer,fall}', 24),
  ('drone_flying', 'Drone Flying', '🛸', 'air', '{all}', 25),
  ('wildlife_photography', 'Wildlife Photography', '📸', 'nature', '{all}', 26),
  ('birdwatching', 'Birdwatching', '🦅', 'nature', '{all}', 27),
  ('outdoor_yoga', 'Outdoor Yoga', '🧘', 'nature', '{spring,summer,fall}', 28),
  ('foraging', 'Foraging', '🍄', 'nature', '{spring,summer,fall}', 29);


-- ============================================================================
-- 012: Region Highlights
-- ============================================================================

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
  score DECIMAL(10,4),
  is_seasonal BOOLEAN DEFAULT false,
  best_season TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_name, activity_slug)
);

CREATE INDEX idx_region_highlights_location ON region_highlights USING GIST(center_point);
CREATE OR REPLACE FUNCTION update_region_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := (NEW.trail_count::DECIMAL * 0.4) + (NEW.business_count::DECIMAL * 0.3) + (NEW.active_posts_count::DECIMAL * 0.3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_region_score
  BEFORE INSERT OR UPDATE ON region_highlights
  FOR EACH ROW EXECUTE FUNCTION update_region_score();

CREATE INDEX idx_region_highlights_score ON region_highlights(score DESC);


-- ============================================================================
-- 013: Social Connections & Messages
-- ============================================================================

CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(
  LEAST(sender_id, recipient_id),
  GREATEST(sender_id, recipient_id),
  created_at DESC
);


-- ============================================================================
-- 014: Permits
-- ============================================================================

CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_local TEXT,
  type TEXT CHECK (type IN ('day_use','overnight','seasonal','annual','lottery')),
  fee DECIMAL(10,2),
  fee_currency TEXT DEFAULT 'USD',
  fee_notes TEXT,
  requires_reservation BOOLEAN DEFAULT false,
  reservation_url TEXT,
  info_url TEXT,
  geom GEOGRAPHY(POINT, 4326),
  country TEXT,
  country_code TEXT,
  state_province TEXT,
  region TEXT,
  recreation_gov_id TEXT,
  season_start TEXT,
  season_end TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trails ADD CONSTRAINT fk_trails_permit
  FOREIGN KEY (permit_id) REFERENCES permits(id);


-- ============================================================================
-- 015: Saved Items & Trips
-- ============================================================================

CREATE TABLE user_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('business','trail','event','club','activity_post')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  destination_point GEOGRAPHY(POINT, 4326),
  start_date DATE,
  end_date DATE,
  trail_ids UUID[] DEFAULT '{}',
  business_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  cover_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 016: User Activities
-- ============================================================================

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


-- ============================================================================
-- 017: User Integrations
-- ============================================================================

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


-- ============================================================================
-- 018: Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles visible" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active businesses visible" ON businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Claimed owners edit" ON businesses FOR UPDATE USING (auth.uid() = claimed_by);

ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active trails visible" ON trails FOR SELECT USING (is_active = true);

ALTER TABLE trail_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conditions visible" ON trail_conditions FOR SELECT USING (true);
CREATE POLICY "Authenticated report" ON trail_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews visible" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated review" ON reviews FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Own review editable" ON reviews FOR UPDATE USING (auth.uid() = author_id);

ALTER TABLE activity_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts visible" ON activity_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Own posts manageable" ON activity_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated create" ON activity_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE activity_post_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post owner + self sees" ON activity_post_participants FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() = (SELECT user_id FROM activity_posts WHERE id = post_id)
);
CREATE POLICY "Authenticated join" ON activity_post_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public activities visible" ON user_activities FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Own activities" ON user_activities FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own integrations" ON user_integrations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own saved items" ON user_saved_items FOR ALL USING (auth.uid() = user_id);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public or own trips" ON trips FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Own trips manageable" ON trips FOR ALL USING (auth.uid() = user_id);

ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business owner reads analytics" ON business_analytics FOR SELECT USING (
  auth.uid() = (SELECT claimed_by FROM businesses WHERE id = business_id)
);


-- ============================================================================
-- 019: Functions (Geospatial Queries & Utilities)
-- ============================================================================

CREATE OR REPLACE FUNCTION businesses_near_point(
  lat FLOAT, lng FLOAT, radius_m FLOAT DEFAULT 15000
) RETURNS SETOF businesses AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM businesses
  WHERE is_active = true
    AND ST_DWithin(geom, ST_MakePoint(lng, lat)::geography, radius_m)
  ORDER BY is_spotlight DESC, ST_Distance(geom, ST_MakePoint(lng, lat)::geography) ASC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION businesses_near_trail(
  p_trail_id UUID, p_radius_m FLOAT DEFAULT 15000
) RETURNS TABLE(
  id UUID, name TEXT, category TEXT, is_spotlight BOOLEAN,
  distance_km FLOAT, slug TEXT, cover_photo_url TEXT, rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.name, b.category, b.is_spotlight,
    ST_Distance(b.geom, t.start_point) / 1000.0 AS distance_km,
    b.slug, b.cover_photo_url, b.rating
  FROM businesses b, trails t
  WHERE t.id = p_trail_id AND b.is_active = true
    AND ST_DWithin(b.geom, t.start_point, p_radius_m)
  ORDER BY b.is_spotlight DESC, distance_km ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_activity_posts_near(
  p_lat FLOAT, p_lng FLOAT, p_radius_km FLOAT DEFAULT 50,
  p_activity_type TEXT DEFAULT NULL, p_skill_level TEXT DEFAULT NULL,
  p_post_type TEXT DEFAULT NULL, p_days_ahead INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
  id UUID, post_type TEXT, activity_type TEXT, title TEXT,
  location_name TEXT, activity_date TIMESTAMPTZ, skill_level TEXT,
  current_participants INTEGER, max_participants INTEGER,
  permit_required BOOLEAN, cost_share DECIMAL,
  distance_km FLOAT, user_avatar TEXT, user_display_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.id, ap.post_type, ap.activity_type, ap.title,
    ap.location_name, ap.activity_date, ap.skill_level,
    ap.current_participants, ap.max_participants,
    ap.permit_required, ap.cost_share,
    ST_Distance(ap.location_point, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY) / 1000 AS distance_km,
    u.avatar_url, u.display_name
  FROM activity_posts ap
  JOIN users u ON ap.user_id = u.id
  WHERE ap.status = 'active' AND ap.is_public = true
    AND ap.activity_date > NOW()
    AND ap.activity_date < NOW() + (p_days_ahead || ' days')::INTERVAL
    AND ST_DWithin(ap.location_point, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY, p_radius_km * 1000)
    AND (p_activity_type IS NULL OR ap.activity_type = p_activity_type)
    AND (p_skill_level IS NULL OR ap.skill_level = p_skill_level)
    AND (p_post_type IS NULL OR ap.post_type = p_post_type)
  ORDER BY
    ap.post_type = 'open_permit' DESC,
    ap.activity_date ASC,
    distance_km ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION match_activity_to_trail(p_activity_id UUID)
RETURNS UUID AS $$
DECLARE v_trail_id UUID;
BEGIN
  SELECT t.id INTO v_trail_id
  FROM user_activities a CROSS JOIN trails t
  WHERE a.id = p_activity_id
    AND t.start_point IS NOT NULL
    AND ST_DWithin(a.start_point, t.start_point, 5000)
  ORDER BY ST_Distance(a.start_point, t.start_point) ASC
  LIMIT 1;

  IF v_trail_id IS NOT NULL THEN
    UPDATE user_activities SET matched_trail_id = v_trail_id WHERE id = p_activity_id;
    UPDATE trails SET ride_count = COALESCE(ride_count, 0) + 1 WHERE id = v_trail_id;
  END IF;

  RETURN v_trail_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_trails_near(
  p_lat FLOAT, p_lng FLOAT, p_radius_km FLOAT, p_activity_type TEXT
) RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM trails
  WHERE is_active = true
    AND p_activity_type = ANY(activity_types)
    AND ST_DWithin(start_point, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY, p_radius_km * 1000);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION count_businesses_near(
  p_lat FLOAT, p_lng FLOAT, p_radius_km FLOAT, p_activity_type TEXT
) RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM businesses
  WHERE is_active = true
    AND p_activity_type = ANY(activity_types)
    AND ST_DWithin(geom, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY, p_radius_km * 1000);
$$ LANGUAGE sql STABLE;


-- ============================================================================
-- End of CairnConnect Full Schema
-- ============================================================================
