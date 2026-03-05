import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cairnconnect.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/dashboard/', '/settings/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
