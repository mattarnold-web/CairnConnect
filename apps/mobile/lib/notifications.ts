import { loadFromStorage, saveToStorage } from './storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotificationPayload {
  type: 'trip_reminder' | 'activity_complete' | 'board_reply' | 'weather_alert' | 'general';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationPreferences {
  enabled: boolean;
  tripReminders: boolean;
  activityUpdates: boolean;
  boardReplies: boolean;
  weatherAlerts: boolean;
}

const NOTIFICATION_PREFS_KEY = 'cairn-notification-prefs';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  tripReminders: true,
  activityUpdates: true,
  boardReplies: true,
  weatherAlerts: true,
};

// ---------------------------------------------------------------------------
// Stubbed notification functions
// expo-notifications has a native build incompatibility with expo-modules-core
// on SDK 55 (EXPermissionsService.parsePermission). These stubs maintain the
// API surface so the rest of the app compiles. Push notifications will be
// re-enabled once the upstream packages are patched.
// ---------------------------------------------------------------------------

/** No-op in stub mode */
export function configureNotificationHandler() {
  // Stubbed — expo-notifications removed due to native build error
}

/** Always returns null in stub mode */
export async function requestPushPermissions(): Promise<string | null> {
  return null;
}

/** Always returns null in stub mode */
export async function getSavedPushToken(): Promise<string | null> {
  return null;
}

/** No-op listener in stub mode */
export function onNotificationReceived(
  _handler: (notification: unknown) => void,
): { remove: () => void } {
  return { remove: () => {} };
}

/** No-op listener in stub mode */
export function onNotificationResponse(
  _handler: (response: unknown) => void,
): { remove: () => void } {
  return { remove: () => {} };
}

/** Returns empty string in stub mode */
export async function scheduleLocalNotification(
  _payload: NotificationPayload,
  _delaySeconds: number = 0,
): Promise<string> {
  return '';
}

/** No-op in stub mode */
export async function cancelNotification(_id: string): Promise<void> {}

/** No-op in stub mode */
export async function cancelAllNotifications(): Promise<void> {}

// ---------------------------------------------------------------------------
// Preferences (these work without the native module)
// ---------------------------------------------------------------------------

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const saved = await loadFromStorage<NotificationPreferences>(NOTIFICATION_PREFS_KEY);
  return saved ?? DEFAULT_NOTIFICATION_PREFS;
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<void> {
  await saveToStorage(NOTIFICATION_PREFS_KEY, prefs);
}
