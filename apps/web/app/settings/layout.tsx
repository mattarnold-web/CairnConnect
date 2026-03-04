import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Cairn Connect',
  description:
    'Manage your profile, language, units, equipment, and privacy settings on Cairn Connect.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
