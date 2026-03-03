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
