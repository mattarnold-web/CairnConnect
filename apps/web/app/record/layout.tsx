import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Record Activity | Cairn Connect',
  description:
    'Record your outdoor activities with GPS tracking, elevation data, and photos. Supports hiking, biking, climbing, and more.',
};

export default function RecordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
