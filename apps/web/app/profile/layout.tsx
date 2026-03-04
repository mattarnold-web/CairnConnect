import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity History | Cairn Connect',
  description:
    'View your recorded outdoor activities, stats, and GPS tracks. Export to GPX or connect with Strava.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
