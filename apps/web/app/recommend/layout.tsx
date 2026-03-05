import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recommendations | Cairn Connect',
  description:
    'Get personalized outdoor activity and trail recommendations based on your preferences and location.',
};

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return children;
}
