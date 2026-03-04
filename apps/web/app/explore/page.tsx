import type { Metadata } from 'next';
import { getBusinesses } from '@/lib/queries/businesses';
import { getTrails } from '@/lib/queries/trails';
import { MOCK_REGION_HIGHLIGHTS } from '@/lib/mock-data';
import { ExploreClient } from './explore-client';

export const metadata: Metadata = {
  title: 'Explore | Cairn Connect',
  description: 'Discover outdoor businesses, trails, and activities near you.',
};

export default async function ExplorePage() {
  const [businesses, trails] = await Promise.all([
    getBusinesses(),
    getTrails(),
  ]);

  return (
    <ExploreClient
      businesses={businesses}
      trails={trails}
      regionHighlights={MOCK_REGION_HIGHLIGHTS}
    />
  );
}
