import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upgrade to Spotlight | Cairn Connect',
  description:
    'Get premium visibility for your outdoor business with Cairn Connect Spotlight. Gold map pins, priority search ranking, and monthly analytics.',
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
