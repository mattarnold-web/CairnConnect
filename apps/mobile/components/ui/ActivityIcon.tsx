import { View, Text } from 'react-native';
import { ACTIVITY_TYPES } from '@cairn/shared';
import { clsx } from 'clsx';

interface ActivityIconProps {
  activitySlug: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ActivityIcon({ activitySlug, size = 'md', showLabel = false }: ActivityIconProps) {
  const activity = ACTIVITY_TYPES.find((a) => a.slug === activitySlug);
  const emoji = activity?.emoji ?? '\u{1F3D5}\u{FE0F}';
  const label = activity?.label ?? activitySlug;

  const sizeMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <View className="flex-row items-center">
      <Text className={clsx(sizeMap[size])}>{emoji}</Text>
      {showLabel && (
        <Text className="text-xs text-slate-400 ml-1">{label}</Text>
      )}
    </View>
  );
}
