import { Pressable, Text } from 'react-native';
import { clsx } from 'clsx';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  emoji?: string;
}

export function FilterChip({ label, selected = false, onPress, emoji }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        'flex-row items-center rounded-full px-3 py-1.5 mr-2',
        selected
          ? 'bg-canopy/20 border border-canopy'
          : 'bg-cairn-card border border-cairn-border',
      )}
    >
      {emoji && <Text className="mr-1 text-sm">{emoji}</Text>}
      <Text
        className={clsx(
          'text-xs font-medium',
          selected ? 'text-canopy' : 'text-slate-400',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
