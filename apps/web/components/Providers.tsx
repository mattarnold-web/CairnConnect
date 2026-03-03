'use client';

import { PreferencesProvider } from '@/lib/preferences-context';
import { TripProvider } from '@/lib/trip-context';
import { ActivityProvider } from '@/lib/activity-context';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { InstallPrompt } from '@/components/ui/InstallPrompt';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <TripProvider>
        <ActivityProvider>
          <OfflineBanner />
          {children}
          <InstallPrompt />
        </ActivityProvider>
      </TripProvider>
    </PreferencesProvider>
  );
}
