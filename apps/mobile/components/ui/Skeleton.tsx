import { useEffect, useRef } from 'react';
import { View, Animated, type DimensionValue, type ViewStyle } from 'react-native';
import { clsx } from 'clsx';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%' as DimensionValue,
  height = 16,
  borderRadius = 8,
  className,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={clsx('bg-cairn-elevated', className)}
      style={[
        {
          width: width as DimensionValue,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** A preset for a card-shaped skeleton placeholder */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <View
      className={clsx(
        'bg-cairn-card border border-cairn-border rounded-2xl p-4',
        className,
      )}
    >
      <View className="flex-row items-center mb-3">
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <Skeleton width="60%" height={14} className="mb-2" />
          <Skeleton width="40%" height={10} />
        </View>
      </View>
      <Skeleton width="100%" height={12} className="mb-2" />
      <Skeleton width="85%" height={12} className="mb-2" />
      <Skeleton width="70%" height={12} />
    </View>
  );
}

/** A preset for a list item skeleton placeholder */
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <View
      className={clsx(
        'bg-cairn-card border border-cairn-border rounded-2xl p-4 flex-row items-center',
        className,
      )}
    >
      <Skeleton width={48} height={48} borderRadius={12} />
      <View className="ml-3 flex-1">
        <Skeleton width="70%" height={14} className="mb-2" />
        <Skeleton width="50%" height={10} />
      </View>
    </View>
  );
}
