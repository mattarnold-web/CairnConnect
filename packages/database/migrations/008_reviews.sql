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
