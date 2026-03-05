import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBusinessBySlug } from '@/lib/queries/businesses';
import { getReviewsWithAuthors } from '@/lib/queries/reviews';
import { getTrailsNear } from '@/lib/queries/trails';
import { isItemSaved } from '@/lib/actions/saved-items';
import { BusinessDetailClient } from './business-detail-client';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const business = await getBusinessBySlug(params.slug);
  if (!business) return { title: 'Business Not Found' };

  const biz = business as any;
  const title = `${business.name} | Cairn Connect`;
  const description =
    business.description ??
    `Discover ${business.name}${biz.category ? ` — ${biz.category}` : ''} on Cairn Connect.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(biz.cover_photo_url ? { images: [{ url: biz.cover_photo_url }] } : {}),
    },
  };
}

export default async function BusinessDetailPage({ params }: Props) {
  const business = await getBusinessBySlug(params.slug);
  if (!business) notFound();

  // Fetch reviews and nearby trails in parallel
  const biz = business as any;
  const lat = biz.lat as number | undefined;
  const lng = biz.lng as number | undefined;

  const [reviews, nearbyTrails, saved] = await Promise.all([
    getReviewsWithAuthors('business', business.id),
    lat && lng ? getTrailsNear(lat, lng, 25, 3) : getTrailsNear(38.5733, -109.5498, 25, 3),
    isItemSaved('business', business.id),
  ]);

  return (
    <BusinessDetailClient
      business={business}
      reviews={reviews}
      nearbyTrails={nearbyTrails}
      isSaved={saved}
    />
  );
}
