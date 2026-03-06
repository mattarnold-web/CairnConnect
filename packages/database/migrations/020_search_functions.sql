-- ============================================================================
-- 020: Search Functions (Full-Text, Trigram, Spatial)
-- ============================================================================
--
-- Unified search RPCs for the CairnConnect mobile + web apps.
-- Leverages existing indexes:
--   - trails.search_vector       GIN (tsvector)
--   - trails.name                GIN (gin_trgm_ops)
--   - trails.start_point         GIST (geography)
--   - businesses.search_vector   GIN (tsvector)
--   - businesses.name            GIN (gin_trgm_ops)
--   - businesses.geom            GIST (geography)
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. search_locations — Unified search across trails + businesses
-- ---------------------------------------------------------------------------
-- Combines full-text search (tsvector), trigram similarity (pg_trgm), and
-- spatial proximity (PostGIS ST_DWithin) into a single ranked result set.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_locations(
  p_query         TEXT        DEFAULT NULL,
  p_lat           FLOAT       DEFAULT NULL,
  p_lng           FLOAT       DEFAULT NULL,
  p_radius_km     FLOAT       DEFAULT 50,
  p_activity_types TEXT[]     DEFAULT NULL,
  p_limit         INTEGER     DEFAULT 20
)
RETURNS TABLE(
  entity_type      TEXT,
  id               UUID,
  name             TEXT,
  slug             TEXT,
  description      TEXT,
  city             TEXT,
  state_province   TEXT,
  lat              FLOAT,
  lng              FLOAT,
  distance_km      FLOAT,
  rating           DECIMAL,
  review_count     INTEGER,
  cover_photo_url  TEXT,
  activity_types   TEXT[],
  difficulty       TEXT,
  category         TEXT,
  rank             FLOAT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_tsquery  tsquery;
  v_point    geography;
  v_radius_m FLOAT;
BEGIN
  -- Build the tsquery from the search term (prefix matching with :*)
  IF p_query IS NOT NULL AND TRIM(p_query) <> '' THEN
    v_tsquery := plainto_tsquery('english', p_query);
  END IF;

  -- Build the geography point for spatial filtering
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_point    := ST_MakePoint(p_lng, p_lat)::geography;
    v_radius_m := p_radius_km * 1000;
  END IF;

  RETURN QUERY
  -- Trails CTE
  WITH trail_results AS (
    SELECT
      'trail'::TEXT                                           AS entity_type,
      t.id,
      t.name,
      t.slug,
      LEFT(t.description, 200)                               AS description,
      t.city,
      t.state_province,
      ST_Y(t.start_point::geometry)                          AS lat,
      ST_X(t.start_point::geometry)                          AS lng,
      CASE
        WHEN v_point IS NOT NULL AND t.start_point IS NOT NULL
        THEN ST_Distance(t.start_point, v_point) / 1000.0
        ELSE NULL
      END                                                    AS distance_km,
      t.rating,
      t.review_count,
      t.cover_photo_url,
      t.activity_types,
      t.difficulty,
      NULL::TEXT                                              AS category,
      -- Compute a composite rank: text relevance + trigram similarity
      (
        COALESCE(ts_rank_cd(t.search_vector, v_tsquery), 0) * 2.0 +
        COALESCE(similarity(t.name, p_query), 0)
      )                                                      AS rank
    FROM trails t
    WHERE t.is_active = true
      -- Text filter: must match tsvector OR trigram threshold
      AND (
        v_tsquery IS NULL
        OR t.search_vector @@ v_tsquery
        OR similarity(t.name, p_query) > 0.15
      )
      -- Spatial filter
      AND (
        v_point IS NULL
        OR t.start_point IS NULL
        OR ST_DWithin(t.start_point, v_point, v_radius_m)
      )
      -- Activity type filter
      AND (
        p_activity_types IS NULL
        OR t.activity_types && p_activity_types
      )
  ),
  -- Businesses CTE
  business_results AS (
    SELECT
      'business'::TEXT                                        AS entity_type,
      b.id,
      b.name,
      b.slug,
      LEFT(b.description, 200)                               AS description,
      b.city,
      b.state_province,
      ST_Y(b.geom::geometry)                                 AS lat,
      ST_X(b.geom::geometry)                                 AS lng,
      CASE
        WHEN v_point IS NOT NULL AND b.geom IS NOT NULL
        THEN ST_Distance(b.geom, v_point) / 1000.0
        ELSE NULL
      END                                                    AS distance_km,
      b.rating,
      b.review_count,
      b.cover_photo_url,
      b.activity_types,
      NULL::TEXT                                              AS difficulty,
      b.category,
      (
        COALESCE(ts_rank_cd(b.search_vector, v_tsquery), 0) * 2.0 +
        COALESCE(similarity(b.name, p_query), 0)
      )                                                      AS rank
    FROM businesses b
    WHERE b.is_active = true
      AND (
        v_tsquery IS NULL
        OR b.search_vector @@ v_tsquery
        OR similarity(b.name, p_query) > 0.15
      )
      AND (
        v_point IS NULL
        OR b.geom IS NULL
        OR ST_DWithin(b.geom, v_point, v_radius_m)
      )
      AND (
        p_activity_types IS NULL
        OR b.activity_types && p_activity_types
      )
  ),
  combined AS (
    SELECT * FROM trail_results
    UNION ALL
    SELECT * FROM business_results
  )
  SELECT
    c.entity_type,
    c.id,
    c.name,
    c.slug,
    c.description,
    c.city,
    c.state_province,
    c.lat,
    c.lng,
    c.distance_km,
    c.rating,
    c.review_count,
    c.cover_photo_url,
    c.activity_types,
    c.difficulty,
    c.category,
    c.rank
  FROM combined c
  ORDER BY
    c.rank DESC,
    c.distance_km ASC NULLS LAST,
    c.rating DESC NULLS LAST
  LIMIT p_limit;
END;
$$;


-- ---------------------------------------------------------------------------
-- 2. autocomplete_locations — Fast lightweight autocomplete
-- ---------------------------------------------------------------------------
-- Designed for search-as-you-type. Uses only trigram similarity on name +
-- optional spatial proximity boost. Returns minimal columns for speed.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION autocomplete_locations(
  p_query   TEXT,
  p_lat     FLOAT    DEFAULT NULL,
  p_lng     FLOAT    DEFAULT NULL,
  p_limit   INTEGER  DEFAULT 8
)
RETURNS TABLE(
  entity_type       TEXT,
  id                UUID,
  name              TEXT,
  slug              TEXT,
  city              TEXT,
  state_province    TEXT,
  similarity_score  FLOAT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_point geography;
BEGIN
  IF p_query IS NULL OR TRIM(p_query) = '' THEN
    RETURN;
  END IF;

  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_point := ST_MakePoint(p_lng, p_lat)::geography;
  END IF;

  RETURN QUERY
  WITH trail_matches AS (
    SELECT
      'trail'::TEXT                        AS entity_type,
      t.id,
      t.name,
      t.slug,
      t.city,
      t.state_province,
      similarity(t.name, p_query)::FLOAT  AS similarity_score,
      CASE
        WHEN v_point IS NOT NULL AND t.start_point IS NOT NULL
        THEN ST_Distance(t.start_point, v_point)
        ELSE 999999999
      END                                  AS dist
    FROM trails t
    WHERE t.is_active = true
      AND (
        similarity(t.name, p_query) > 0.1
        OR t.name ILIKE p_query || '%'
      )
  ),
  business_matches AS (
    SELECT
      'business'::TEXT                     AS entity_type,
      b.id,
      b.name,
      b.slug,
      b.city,
      b.state_province,
      similarity(b.name, p_query)::FLOAT  AS similarity_score,
      CASE
        WHEN v_point IS NOT NULL AND b.geom IS NOT NULL
        THEN ST_Distance(b.geom, v_point)
        ELSE 999999999
      END                                  AS dist
    FROM businesses b
    WHERE b.is_active = true
      AND (
        similarity(b.name, p_query) > 0.1
        OR b.name ILIKE p_query || '%'
      )
  ),
  combined AS (
    SELECT * FROM trail_matches
    UNION ALL
    SELECT * FROM business_matches
  )
  SELECT
    c.entity_type,
    c.id,
    c.name,
    c.slug,
    c.city,
    c.state_province,
    c.similarity_score
  FROM combined c
  ORDER BY
    c.similarity_score DESC,
    c.dist ASC
  LIMIT p_limit;
END;
$$;


-- ---------------------------------------------------------------------------
-- 3. search_regions — Search for regions by city name
-- ---------------------------------------------------------------------------
-- Aggregates trail and business counts per city/state grouping. Useful for
-- the "Explore regions" feature and trip destination picker.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_regions(
  p_query   TEXT        DEFAULT NULL,
  p_limit   INTEGER     DEFAULT 10
)
RETURNS TABLE(
  city             TEXT,
  state_province   TEXT,
  country          TEXT,
  lat              FLOAT,
  lng              FLOAT,
  trail_count      BIGINT,
  business_count   BIGINT
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH trail_cities AS (
    SELECT
      t.city,
      t.state_province,
      t.country,
      AVG(ST_Y(t.start_point::geometry))  AS avg_lat,
      AVG(ST_X(t.start_point::geometry))  AS avg_lng,
      COUNT(*)                             AS t_count
    FROM trails t
    WHERE t.is_active = true
      AND t.city IS NOT NULL
      AND t.start_point IS NOT NULL
      AND (
        p_query IS NULL
        OR TRIM(p_query) = ''
        OR t.city ILIKE '%' || p_query || '%'
        OR t.state_province ILIKE '%' || p_query || '%'
      )
    GROUP BY t.city, t.state_province, t.country
  ),
  biz_cities AS (
    SELECT
      b.city,
      b.state_province,
      COUNT(*) AS b_count
    FROM businesses b
    WHERE b.is_active = true
      AND b.city IS NOT NULL
      AND (
        p_query IS NULL
        OR TRIM(p_query) = ''
        OR b.city ILIKE '%' || p_query || '%'
        OR b.state_province ILIKE '%' || p_query || '%'
      )
    GROUP BY b.city, b.state_province
  )
  SELECT
    tc.city,
    tc.state_province,
    tc.country,
    tc.avg_lat::FLOAT        AS lat,
    tc.avg_lng::FLOAT        AS lng,
    tc.t_count               AS trail_count,
    COALESCE(bc.b_count, 0)  AS business_count
  FROM trail_cities tc
  LEFT JOIN biz_cities bc
    ON tc.city = bc.city
    AND tc.state_province = bc.state_province
  ORDER BY
    (tc.t_count + COALESCE(bc.b_count, 0)) DESC,
    tc.city ASC
  LIMIT p_limit;
END;
$$;


-- ---------------------------------------------------------------------------
-- 4. search_trails_for_trip — Full trail search for trip planning
-- ---------------------------------------------------------------------------
-- Combines text search, spatial search, and multi-filter support (activity
-- types, difficulty) with pagination. Intended for the trip planning wizard.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_trails_for_trip(
  p_query           TEXT        DEFAULT NULL,
  p_lat             FLOAT       DEFAULT NULL,
  p_lng             FLOAT       DEFAULT NULL,
  p_radius_km       FLOAT       DEFAULT 50,
  p_activity_types  TEXT[]      DEFAULT NULL,
  p_difficulty      TEXT        DEFAULT NULL,
  p_limit           INTEGER     DEFAULT 20,
  p_offset          INTEGER     DEFAULT 0
)
RETURNS TABLE(
  id                UUID,
  name              TEXT,
  slug              TEXT,
  description       TEXT,
  city              TEXT,
  state_province    TEXT,
  lat               FLOAT,
  lng               FLOAT,
  distance_km       FLOAT,
  rating            DECIMAL,
  review_count      INTEGER,
  cover_photo_url   TEXT,
  activity_types    TEXT[],
  difficulty        TEXT,
  difficulty_label  TEXT,
  distance_meters   DECIMAL,
  elevation_gain_meters DECIMAL,
  trail_type        TEXT,
  rank              FLOAT
)
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_tsquery  tsquery;
  v_point    geography;
  v_radius_m FLOAT;
BEGIN
  IF p_query IS NOT NULL AND TRIM(p_query) <> '' THEN
    v_tsquery := plainto_tsquery('english', p_query);
  END IF;

  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    v_point    := ST_MakePoint(p_lng, p_lat)::geography;
    v_radius_m := p_radius_km * 1000;
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.slug,
    LEFT(t.description, 300)                               AS description,
    t.city,
    t.state_province,
    ST_Y(t.start_point::geometry)::FLOAT                   AS lat,
    ST_X(t.start_point::geometry)::FLOAT                   AS lng,
    CASE
      WHEN v_point IS NOT NULL AND t.start_point IS NOT NULL
      THEN (ST_Distance(t.start_point, v_point) / 1000.0)::FLOAT
      ELSE NULL::FLOAT
    END                                                    AS distance_km,
    t.rating,
    t.review_count,
    t.cover_photo_url,
    t.activity_types,
    t.difficulty,
    t.difficulty_label,
    t.distance_meters,
    t.elevation_gain_meters,
    t.trail_type,
    (
      COALESCE(ts_rank_cd(t.search_vector, v_tsquery), 0) * 2.0 +
      COALESCE(similarity(t.name, p_query), 0)
    )::FLOAT                                               AS rank
  FROM trails t
  WHERE t.is_active = true
    -- Text filter
    AND (
      v_tsquery IS NULL
      OR t.search_vector @@ v_tsquery
      OR similarity(t.name, p_query) > 0.15
    )
    -- Spatial filter
    AND (
      v_point IS NULL
      OR t.start_point IS NULL
      OR ST_DWithin(t.start_point, v_point, v_radius_m)
    )
    -- Activity type filter
    AND (
      p_activity_types IS NULL
      OR t.activity_types && p_activity_types
    )
    -- Difficulty filter
    AND (
      p_difficulty IS NULL
      OR t.difficulty = p_difficulty
    )
  ORDER BY
    rank DESC,
    distance_km ASC NULLS LAST,
    t.rating DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
