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
