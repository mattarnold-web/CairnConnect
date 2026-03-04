import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy, Security & Licensing | Cairn Connect',
  description:
    'Learn how Cairn Connect protects your data, your GDPR and CCPA rights, and the platform licensing terms.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
