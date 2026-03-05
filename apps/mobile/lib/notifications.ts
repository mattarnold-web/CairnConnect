import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-constants';
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
// Configure notification handling
// ---------------------------------------------------------------------------

/** Set how foreground notifications are displayed */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ---------------------------------------------------------------------------
// Permissions & Token
// ---------------------------------------------------------------------------

/** Request push notification permissions and return the Expo push token */
export async function requestPushPermissions(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Device.default.expoConfig?.extra?.eas?.projectId,
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
// Notification handlers
// ---------------------------------------------------------------------------

/** Register a handler for when a notification is received while the app is foregrounded */
export function onNotificationReceived(
  handler: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/** Register a handler for when the user taps a notification */
export function onNotificationResponse(
  handler: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// ---------------------------------------------------------------------------
// Local notifications
// ---------------------------------------------------------------------------

/** Schedule a local notification after a delay (in seconds) */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
  delaySeconds: number = 0,
): Promise<string> {
  const trigger: Notifications.NotificationTriggerInput = delaySeconds > 0
    ? {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      }
    : null;

  return Notifications.scheduleNotificationAsync({
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
  await Notifications.cancelScheduledNotificationAsync(id);
}

/** Cancel all scheduled notifications */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
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
