import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Dashboard | Cairn Connect',
  description:
    'Manage your business listing, track performance analytics, and engage with customer reviews on Cairn Connect.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
