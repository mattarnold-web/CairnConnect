'use client';

import { AuthProvider } from '@/lib/auth-context';
import { PreferencesProvider } from '@/lib/preferences-context';
import { TripProvider } from '@/lib/trip-context';
import { ActivityProvider } from '@/lib/activity-context';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { InstallPrompt } from '@/components/ui/InstallPrompt';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <TripProvider>
          <ActivityProvider>
            <OfflineBanner />
            {children}
            <InstallPrompt />
          </ActivityProvider>
        </TripProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
