import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Hook providing haptic feedback helpers for common UI interactions.
 *
 * Usage:
 *   const haptics = useHaptics();
 *   <Pressable onPress={() => { haptics.light(); doSomething(); }} />
 */
export function useHaptics() {
  /** Light impact - for button presses, toggle switches */
  const light = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  /** Medium impact - for significant actions */
  const medium = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /** Heavy impact - for destructive actions, confirmations */
  const heavy = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  /** Selection feedback - for tab changes, picker selections */
  const selection = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync();
  }, []);

  /** Success notification feedback */
  const success = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /** Warning notification feedback */
  const warning = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  /** Error notification feedback */
  const error = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
  };
}
