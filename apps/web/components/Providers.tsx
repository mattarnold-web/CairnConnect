'use client';

import { AuthProvider } from '@/lib/auth-context';
import { PreferencesProvider } from '@/lib/preferences-context';
import { TripProvider } from '@/lib/trip-context';
import { ActivityProvider } from '@/lib/activity-context';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DemoBanner } from '@/components/demo/DemoBanner';

export function Providers({ children }: { children: any }) {
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
