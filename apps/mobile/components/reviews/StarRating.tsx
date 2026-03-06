import { View, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
  rating: number;
  size?: number;
  /** If provided, stars are tappable */
  onRate?: (rating: number) => void;
  color?: string;
}

export function StarRating({
  rating,
  size = 14,
  onRate,
  color = '#F4A261',
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <View className="flex-row items-center gap-0.5">
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        const starElement = (
          <Star
            key={star}
            size={size}
            color={color}
            fill={filled ? color : 'transparent'}
          />
        );

        if (onRate) {
          return (
            <Pressable key={star} onPress={() => onRate(star)} hitSlop={4}>
              {starElement}
            </Pressable>
          );
        }

        return starElement;
      })}
    </View>
  );
}
