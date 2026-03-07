import { Platform } from 'react-native';
import { saveToStorage, loadFromStorage } from './storage';

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

const PUSH_TOKEN_KEY = 'cairn-push-token';
const NOTIFICATION_PREFS_KEY = 'cairn-notification-prefs';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  tripReminders: true,
  activityUpdates: true,
  boardReplies: true,
  weatherAlerts: true,
};

// ---------------------------------------------------------------------------
// Lazy-load expo-notifications (optional dependency)
// ---------------------------------------------------------------------------

let Notifications: typeof import('expo-notifications') | null = null;

async function getNotificationsModule() {
  if (Notifications) return Notifications;
  try {
    Notifications = await import('expo-notifications');
    return Notifications;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Configure notification handling
// ---------------------------------------------------------------------------

/** Set how foreground notifications are displayed */
export function configureNotificationHandler() {
  getNotificationsModule().then((mod) => {
    if (!mod) return;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  });
}

// ---------------------------------------------------------------------------
// Permissions & Token
// ---------------------------------------------------------------------------

/** Request push notification permissions and return the Expo push token */
export async function requestPushPermissions(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const mod = await getNotificationsModule();
  if (!mod) return null;

  const { status: existingStatus } = await mod.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await mod.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await mod.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: mod.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  try {
    const Constants = (await import('expo-constants')).default;
    const tokenData = await mod.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    const token = tokenData.data;

    // Persist the token locally
    await saveToStorage(PUSH_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

/** Get saved push token without re-requesting */
export async function getSavedPushToken(): Promise<string | null> {
  return loadFromStorage<string>(PUSH_TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Local notifications
// ---------------------------------------------------------------------------

/** Schedule a local notification after a delay (in seconds) */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
  delaySeconds: number = 0,
): Promise<string | null> {
  const mod = await getNotificationsModule();
  if (!mod) return null;

  const trigger = delaySeconds > 0
    ? {
        type: mod.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      } as const
    : null;

  return mod.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: { type: payload.type, ...payload.data },
      sound: true,
    },
    trigger,
  });
}

/** Cancel a specific scheduled notification */
export async function cancelNotification(id: string): Promise<void> {
  const mod = await getNotificationsModule();
  if (!mod) return;
  await mod.cancelScheduledNotificationAsync(id);
}

/** Cancel all scheduled notifications */
export async function cancelAllNotifications(): Promise<void> {
  const mod = await getNotificationsModule();
  if (!mod) return;
  await mod.cancelAllScheduledNotificationsAsync();
}

// ---------------------------------------------------------------------------
// Preferences
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
