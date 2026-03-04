import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trip Planner | Cairn Connect',
  description:
    'Plan your outdoor adventure with the Cairn Connect trip planner. Build itineraries, discover trails, and organize gear for your next trip.',
};

export default function TripLayout({ children }: { children: React.ReactNode }) {
  return children;
}
