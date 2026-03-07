// Type stub for expo-notifications (optional dependency)
// The actual package is lazy-loaded at runtime when available.
// This declaration prevents TypeScript errors when the package is not installed.
declare module 'expo-notifications' {
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: {
      name: string;
      importance: number;
      vibrationPattern?: number[];
      lightColor?: string;
    },
  ): Promise<unknown>;
  export function getExpoPushTokenAsync(options: {
    projectId?: string;
  }): Promise<{ data: string }>;
  export function scheduleNotificationAsync(options: {
    content: {
      title: string;
      body: string;
      data?: Record<string, unknown>;
      sound?: boolean;
    };
    trigger: unknown;
  }): Promise<string>;
  export function cancelScheduledNotificationAsync(id: string): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function addNotificationReceivedListener(
    handler: (notification: unknown) => void,
  ): { remove: () => void };
  export function addNotificationResponseReceivedListener(
    handler: (response: unknown) => void,
  ): { remove: () => void };

  export const AndroidImportance: {
    MAX: number;
    HIGH: number;
    DEFAULT: number;
    LOW: number;
    MIN: number;
  };

  export const SchedulableTriggerInputTypes: {
    TIME_INTERVAL: string;
    DATE: string;
    DAILY: string;
    WEEKLY: string;
    YEARLY: string;
    CALENDAR: string;
  };

  export type Notification = unknown;
  export type NotificationResponse = unknown;
  export type EventSubscription = { remove: () => void };
  export type NotificationTriggerInput = unknown;
}
