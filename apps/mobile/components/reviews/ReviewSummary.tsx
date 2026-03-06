import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import type { Review } from '@/lib/api';

interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

/**
 * Displays an average rating with star display and rating breakdown bars.
 * Matches the reference design with a large rating number + distribution bars.
 */
export function ReviewSummary({
  rating,
  reviewCount,
  reviews,
}: ReviewSummaryProps) {
  // Compute breakdown by star count
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter(
      (r) => Math.round(r.rating) === star,
    ).length;
    const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <View className="bg-cairn-card border border-cairn-border rounded-2xl p-4 mb-4">
      <View className="flex-row items-start">
        {/* Left: big rating number */}
        <View className="items-center mr-5">
          <Text className="text-slate-100 font-bold text-4xl">
            {rating.toFixed(1)}
          </Text>
          <View className="flex-row items-center mt-1 gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                color="#F4A261"
                fill={i < Math.round(rating) ? '#F4A261' : 'transparent'}
              />
            ))}
          </View>
          <Text className="text-slate-500 text-xs mt-1">
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Right: breakdown bars */}
        <View className="flex-1">
          {breakdown.map((item) => (
            <View
              key={item.star}
              className="flex-row items-center gap-2 mb-1.5"
            >
              <Text className="text-slate-500 text-xs w-3 text-right">
                {item.star}
              </Text>
              <View className="flex-1 h-2 bg-cairn-elevated rounded-full overflow-hidden">
                <View
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${item.pct}%` }}
                />
              </View>
              <Text className="text-slate-500 text-[10px] w-6 text-right">
                {item.count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
