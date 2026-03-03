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
