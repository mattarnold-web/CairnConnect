-- ============================================================
-- 022: Admin roles, subscriptions, business profiles
-- ============================================================

-- User roles and admin system
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'business_owner', 'moderator')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- User subscriptions (pre-Stripe, trial-based)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'past_due')),
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  features JSONB DEFAULT '{
    "max_trips": null,
    "max_recorded_activities": null,
    "trail_reviews": true,
    "activity_board": true,
    "challenges": true,
    "safety_center": true,
    "fitness_integrations": true,
    "chat_messaging": true,
    "trip_sharing": true,
    "offline_maps": false,
    "advanced_analytics": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Business profiles (for business owners)
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_docs JSONB,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  payout_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan, status);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id, created_at DESC);

-- RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles and subscription
CREATE POLICY user_roles_select ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_subscriptions_select ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY business_profiles_own ON business_profiles FOR ALL USING (auth.uid() = user_id);

-- Admins can read/write everything
CREATE POLICY admin_roles_all ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
CREATE POLICY admin_subscriptions_all ON user_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
CREATE POLICY admin_business_profiles ON business_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
CREATE POLICY admin_audit_read ON admin_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
CREATE POLICY admin_audit_insert ON admin_audit_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);

-- ============================================================
-- Helper functions
-- ============================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get or auto-create user subscription (trial on first call)
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID DEFAULT auth.uid())
RETURNS SETOF user_subscriptions AS $$
DECLARE
  sub user_subscriptions;
BEGIN
  SELECT * INTO sub FROM user_subscriptions WHERE user_id = p_user_id;

  IF sub IS NULL THEN
    INSERT INTO user_subscriptions (user_id, plan, status)
    VALUES (p_user_id, 'trial', 'active')
    RETURNING * INTO sub;
  END IF;

  -- Auto-expire trial
  IF sub.plan = 'trial' AND sub.trial_ends_at < now() THEN
    UPDATE user_subscriptions
    SET plan = 'free', status = 'active', updated_at = now()
    WHERE id = sub.id
    RETURNING * INTO sub;
  END IF;

  RETURN NEXT sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin dashboard stats
CREATE OR REPLACE FUNCTION admin_dashboard_stats()
RETURNS TABLE(
  total_users BIGINT,
  users_this_week BIGINT,
  total_trails BIGINT,
  total_businesses BIGINT,
  total_activity_posts BIGINT,
  active_trials BIGINT,
  total_reviews BIGINT,
  total_recorded_activities BIGINT
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT count(*) FROM auth.users)::BIGINT,
    (SELECT count(*) FROM auth.users WHERE created_at > now() - INTERVAL '7 days')::BIGINT,
    (SELECT count(*) FROM trails WHERE is_active = true)::BIGINT,
    (SELECT count(*) FROM businesses WHERE is_active = true)::BIGINT,
    (SELECT count(*) FROM activity_posts)::BIGINT,
    (SELECT count(*) FROM user_subscriptions WHERE plan = 'trial' AND status = 'active')::BIGINT,
    (SELECT count(*) FROM reviews)::BIGINT,
    (SELECT count(*) FROM recorded_activities)::BIGINT;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Admin: list users with subscription info
CREATE OR REPLACE FUNCTION admin_list_users(
  p_page INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 50,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  plan TEXT,
  sub_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  roles TEXT[],
  activity_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::TEXT,
    u.created_at,
    COALESCE(s.plan, 'none') AS plan,
    COALESCE(s.status, 'none') AS sub_status,
    s.trial_ends_at,
    COALESCE(ARRAY_AGG(DISTINCT r.role) FILTER (WHERE r.role IS NOT NULL), '{}') AS roles,
    COALESCE(
      (SELECT count(*) FROM recorded_activities ra WHERE ra.user_id = u.id),
      0
    ) AS activity_count
  FROM auth.users u
  LEFT JOIN user_subscriptions s ON s.user_id = u.id
  LEFT JOIN user_roles r ON r.user_id = u.id
  WHERE (p_search IS NULL OR u.email ILIKE '%' || p_search || '%')
  GROUP BY u.id, u.email, u.created_at, s.plan, s.status, s.trial_ends_at
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_page * p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
