-- Migration 023: Challenges & Badges
-- Gamification system for outdoor activity tracking

-- ============================================================================
-- Challenges
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT NOT NULL DEFAULT 'distance',  -- distance, elevation, count, streak, time
    target_value NUMERIC NOT NULL DEFAULT 100,
    unit TEXT NOT NULL DEFAULT 'miles',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    cover_image_url TEXT,
    participant_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Challenge Participants
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_value NUMERIC NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_value ON challenge_participants(challenge_id, current_value DESC);

-- ============================================================================
-- Badges
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_emoji TEXT NOT NULL DEFAULT '🏆',
    criteria_type TEXT NOT NULL,  -- distance, elevation, count, reviews, social, trails, streak, photos
    criteria_value NUMERIC NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- User Badges
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (badge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- ============================================================================
-- Seed default badges
-- ============================================================================

INSERT INTO badges (slug, name, description, icon_emoji, criteria_type, criteria_value, sort_order) VALUES
    ('100-miles', '100 Mile Club', 'Log 100 miles of activity', '🏅', 'distance', 160934, 1),
    ('early-bird', 'Early Bird', 'Record 5 activities before 7 AM', '🌅', 'count', 5, 2),
    ('trail-steward', 'Trail Steward', 'Leave 10 trail reviews', '🌿', 'reviews', 10, 3),
    ('summit-seeker', 'Summit Seeker', 'Gain 50,000 ft of elevation', '⛰️', 'elevation', 15240, 4),
    ('social-butterfly', 'Social Butterfly', 'Join 5 community activities', '🦋', 'social', 5, 5),
    ('explorer', 'Explorer', 'Visit 10 different trails', '🧭', 'trails', 10, 6),
    ('streak-7', 'Week Warrior', '7-day activity streak', '🔥', 'streak', 7, 7),
    ('photographer', 'Shutterbug', 'Take 50 trail photos', '📸', 'photos', 50, 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Seed a default active challenge
-- ============================================================================

INSERT INTO challenges (title, description, challenge_type, target_value, unit, start_date, end_date, is_active) VALUES
    ('March Distance Challenge', 'Log 100 miles of outdoor activity this month', 'distance', 100, 'miles',
     date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day'), true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Challenges: everyone can read, authenticated users can create (creator tracked via created_by)
CREATE POLICY challenges_select ON challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY challenges_insert ON challenges FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Challenge participants: read all, users manage their own
CREATE POLICY challenge_participants_select ON challenge_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY challenge_participants_insert ON challenge_participants FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
CREATE POLICY challenge_participants_update ON challenge_participants FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Badges: everyone can read
CREATE POLICY badges_select ON badges FOR SELECT TO authenticated USING (true);

-- User badges: read all, system manages (we'll use service key for awarding)
CREATE POLICY user_badges_select ON user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY user_badges_insert ON user_badges FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Auto-update participant count trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE challenges SET participant_count = participant_count + 1 WHERE id = NEW.challenge_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE challenges SET participant_count = participant_count - 1 WHERE id = OLD.challenge_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_challenge_participant_count
    AFTER INSERT OR DELETE ON challenge_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_participant_count();

-- ============================================================================
-- RPC: Join a challenge
-- ============================================================================

CREATE OR REPLACE FUNCTION join_challenge(p_challenge_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO challenge_participants (challenge_id, user_id)
    VALUES (p_challenge_id, auth.uid())
    ON CONFLICT (challenge_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: Update challenge progress (called after activity save)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_challenge_progress(p_challenge_id UUID, p_value NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE challenge_participants
    SET current_value = p_value, last_updated = now()
    WHERE challenge_id = p_challenge_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
