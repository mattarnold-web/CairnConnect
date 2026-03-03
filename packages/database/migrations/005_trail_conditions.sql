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
