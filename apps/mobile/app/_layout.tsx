import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/lib/auth-context';
import { PreferencesProvider } from '@/lib/preferences-context';
import { TripProvider } from '@/lib/trip-context';
import { ActivityProvider } from '@/lib/activity-context';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { configureNotificationHandler } from '@/lib/notifications';
import '../global.css';

// Configure notification handling on app start
configureNotificationHandler();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <PreferencesProvider>
            <TripProvider>
              <ActivityProvider>
                <StatusBar style="light" />
                <OfflineBanner />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#0B1A2B' },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen
                    name="(onboarding)"
                    options={{ presentation: 'modal', animation: 'fade' }}
                  />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="(auth)/login"
                    options={{ presentation: 'modal' }}
                  />
                </Stack>
              </ActivityProvider>
            </TripProvider>
          </PreferencesProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
