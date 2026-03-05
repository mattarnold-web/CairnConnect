import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTrailBySlug } from '@/lib/queries/trails';
import { getReviewsWithAuthors } from '@/lib/queries/reviews';
import { getBusinessesNearTrail } from '@/lib/queries/businesses';
import { TrailDetailClient } from './trail-detail-client';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trail = await getTrailBySlug(params.slug);
  if (!trail) return { title: 'Trail Not Found' };

  const title = `${trail.name} | Cairn Connect`;
  const description =
    trail.description ?? `Explore ${trail.name} on Cairn Connect.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(trail.cover_photo_url ? { images: [{ url: trail.cover_photo_url }] } : {}),
    },
  };
}

export default async function TrailDetailPage({ params }: Props) {
  const trail = await getTrailBySlug(params.slug);
  if (!trail) notFound();

  const [reviews, nearbyBusinesses] = await Promise.all([
    getReviewsWithAuthors('trail', trail.id),
    getBusinessesNearTrail(trail.id),
  ]);

  return (
    <TrailDetailClient
      trail={trail}
      reviews={reviews}
      nearbyBusinesses={nearbyBusinesses}
    />
  );
}
