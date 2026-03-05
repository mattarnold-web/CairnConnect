import { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-cairn-elevated',
  };

  return (
    <Animated.View
      style={{ opacity }}
      className={clsx(
        'absolute top-14 left-4 right-4 rounded-xl px-4 py-3 flex-row items-center justify-between z-50',
        bgColor[type],
      )}
    >
      <Text className="text-white text-sm flex-1">{message}</Text>
      <Pressable onPress={onDismiss} className="ml-2">
        <X size={16} color="white" />
      </Pressable>
    </Animated.View>
  );
}
