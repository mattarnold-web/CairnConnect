import type { MetadataRoute } from 'next';
import { createSupabaseAdmin } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cairnconnect.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/board`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Dynamic trail pages
  let trailRoutes: MetadataRoute.Sitemap = [];
  let businessRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = createSupabaseAdmin();

    const { data: trails } = await supabase
      .from('trails')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });

    if (trails) {
      trailRoutes = trails.map((t) => ({
        url: `${BASE_URL}/trail/${t.slug}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }

    const { data: businesses } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });

    if (businesses) {
      businessRoutes = businesses.map((b) => ({
        url: `${BASE_URL}/business/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // If Supabase is not configured, return only static routes
  }

  return [...staticRoutes, ...trailRoutes, ...businessRoutes];
}
