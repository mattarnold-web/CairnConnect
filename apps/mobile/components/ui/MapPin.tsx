import { View, Text, Pressable } from 'react-native';
import { clsx } from 'clsx';

type PinType = 'trail' | 'business';

interface MapPinProps {
  type: PinType;
  /** Trail difficulty (green, blue, black, double_black, proline) or business category */
  variant?: string;
  emoji?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  selected?: boolean;
}

const TRAIL_DIFFICULTY_COLORS: Record<string, { bg: string; border: string }> = {
  green: { bg: 'bg-emerald-500', border: 'border-emerald-400' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-400' },
  black: { bg: 'bg-slate-700', border: 'border-slate-500' },
  double_black: { bg: 'bg-slate-800', border: 'border-slate-600' },
  proline: { bg: 'bg-red-600', border: 'border-red-400' },
};

const BUSINESS_CATEGORY_COLORS: Record<string, { bg: string; border: string }> = {
  bike_shop: { bg: 'bg-orange-500', border: 'border-orange-400' },
  gear_rental: { bg: 'bg-amber-500', border: 'border-amber-400' },
  guide_service: { bg: 'bg-indigo-500', border: 'border-indigo-400' },
  outfitter: { bg: 'bg-teal-500', border: 'border-teal-400' },
  outdoor_gear_shop: { bg: 'bg-lime-600', border: 'border-lime-400' },
  bike_shuttle: { bg: 'bg-violet-500', border: 'border-violet-400' },
  kayak_sup: { bg: 'bg-cyan-500', border: 'border-cyan-400' },
  trailhead_cafe: { bg: 'bg-rose-500', border: 'border-rose-400' },
  adventure_hostel: { bg: 'bg-pink-500', border: 'border-pink-400' },
  camping: { bg: 'bg-green-600', border: 'border-green-400' },
};

const SIZE_MAP = {
  sm: { container: 'w-7 h-7', emoji: 'text-xs', label: 'text-[9px]' },
  md: { container: 'w-9 h-9', emoji: 'text-sm', label: 'text-[10px]' },
  lg: { container: 'w-11 h-11', emoji: 'text-base', label: 'text-xs' },
};

export function MapPin({
  type,
  variant,
  emoji,
  label,
  size = 'md',
  onPress,
  selected = false,
}: MapPinProps) {
  const colorMap = type === 'trail' ? TRAIL_DIFFICULTY_COLORS : BUSINESS_CATEGORY_COLORS;
  const defaultColors = { bg: 'bg-canopy', border: 'border-canopy' };
  const colors = (variant ? colorMap[variant] : undefined) ?? defaultColors;
  const sizeStyles = SIZE_MAP[size];

  const pin = (
    <View className="items-center">
      <View
        className={clsx(
          'rounded-full items-center justify-center border-2',
          colors.bg,
          colors.border,
          sizeStyles.container,
          selected && 'scale-125',
        )}
        style={selected ? { transform: [{ scale: 1.25 }] } : undefined}
      >
        {emoji && <Text className={sizeStyles.emoji}>{emoji}</Text>}
      </View>
      {/* Pin tail */}
      <View
        className={clsx('w-2 h-2 rotate-45 -mt-1', colors.bg)}
        style={{ transform: [{ rotate: '45deg' }], marginTop: -4 }}
      />
      {label && (
        <Text
          className={clsx(
            'text-white font-semibold mt-0.5 text-center',
            sizeStyles.label,
          )}
          numberOfLines={1}
          style={{ maxWidth: 72, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
        >
          {label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {pin}
      </Pressable>
    );
  }

  return pin;
}
