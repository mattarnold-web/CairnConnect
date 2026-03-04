import type { DbAnalytics } from '@/lib/database-types';
import { isSupabaseConfigured, getServerClient } from './helpers';

// ---------------------------------------------------------------------------
// getBusinessAnalytics — analytics for a business (dashboard)
// ---------------------------------------------------------------------------

export interface AnalyticsSummary {
  rows: DbAnalytics[];
  totals: {
    views: number;
    websiteClicks: number;
    directionRequests: number;
    callClicks: number;
    bookingClicks: number;
    searchImpressions: number;
  };
}

export async function getBusinessAnalytics(
  businessId: string,
  days: number = 30,
): Promise<AnalyticsSummary> {
  const emptyTotals = {
    views: 0,
    websiteClicks: 0,
    directionRequests: 0,
    callClicks: 0,
    bookingClicks: 0,
    searchImpressions: 0,
  };

  if (!isSupabaseConfigured()) {
    // Generate mock analytics for dashboard preview
    const rows: DbAnalytics[] = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 86400000).toISOString().split('T')[0];
      rows.push({
        id: `mock-${i}`,
        business_id: businessId,
        date,
        views: Math.floor(Math.random() * 80) + 20,
        website_clicks: Math.floor(Math.random() * 15) + 2,
        direction_requests: Math.floor(Math.random() * 8) + 1,
        call_clicks: Math.floor(Math.random() * 5),
        booking_clicks: Math.floor(Math.random() * 10) + 1,
        search_impressions: Math.floor(Math.random() * 200) + 50,
      });
    }
    const totals = rows.reduce(
      (acc, r) => ({
        views: acc.views + r.views,
        websiteClicks: acc.websiteClicks + r.website_clicks,
        directionRequests: acc.directionRequests + r.direction_requests,
        callClicks: acc.callClicks + r.call_clicks,
        bookingClicks: acc.bookingClicks + r.booking_clicks,
        searchImpressions: acc.searchImpressions + r.search_impressions,
      }),
      { ...emptyTotals },
    );
    return { rows, totals };
  }

  const supabase = getServerClient();
  const sinceDate = new Date(Date.now() - days * 86400000)
    .toISOString()
    .split('T')[0];

  const { data, error } = await supabase
    .from('business_analytics')
    .select('*')
    .eq('business_id', businessId)
    .gte('date', sinceDate)
    .order('date', { ascending: true });

  if (error || !data) return { rows: [], totals: emptyTotals };

  const rows = data as DbAnalytics[];
  const totals = rows.reduce(
    (acc, r) => ({
      views: acc.views + r.views,
      websiteClicks: acc.websiteClicks + r.website_clicks,
      directionRequests: acc.directionRequests + r.direction_requests,
      callClicks: acc.callClicks + r.call_clicks,
      bookingClicks: acc.bookingClicks + r.booking_clicks,
      searchImpressions: acc.searchImpressions + r.search_impressions,
    }),
    { ...emptyTotals },
  );

  return { rows, totals };
}
