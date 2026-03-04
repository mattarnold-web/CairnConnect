import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Cairn Connect',
  description:
    'Sign in or create your Cairn Connect account to discover trails, connect with outdoor businesses, and find adventure partners.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
