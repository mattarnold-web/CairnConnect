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
  expires_at TIMESTAMPTZ GENERATED ALWAYS AS (activity_date + INTERVAL '24 hours') STORED,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
