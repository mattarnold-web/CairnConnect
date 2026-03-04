import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Climbing Routes | Cairn Connect',
  description:
    'Explore climbing routes, crags, and topo maps worldwide. Filter by grade, type, and region for sport, trad, boulder, and ice climbing.',
};

export default function ClimbingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
