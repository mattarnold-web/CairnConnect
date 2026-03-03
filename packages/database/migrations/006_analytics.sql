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
