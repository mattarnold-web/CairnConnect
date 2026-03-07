import { View, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRate,
}: StarRatingProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.round(rating);
        const StarWrapper = interactive ? Pressable : View;
        return (
          <StarWrapper
            key={i}
            onPress={interactive ? () => onRate?.(i + 1) : undefined}
          >
            <Star
              size={size}
              color={filled ? '#fbbf24' : '#334155'}
              fill={filled ? '#fbbf24' : 'transparent'}
            />
          </StarWrapper>
        );
      })}
    </View>
  );
}
