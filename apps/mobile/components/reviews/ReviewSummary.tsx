import { View, Text, ScrollView } from 'react-native';
import { Star } from 'lucide-react-native';
import { FilterChip } from '@/components/ui/FilterChip';
import type { Review } from '@/lib/api';

type ReviewFilter = 'recent' | 'highest' | 'photos' | 'video';

interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviews: Review[];
  activeFilter?: ReviewFilter;
  onFilterChange?: (filter: ReviewFilter) => void;
}

const FILTER_OPTIONS: { key: ReviewFilter; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'highest', label: 'Highest Rated' },
  { key: 'photos', label: 'Photos Only' },
  { key: 'video', label: 'Video' },
];

/**
 * Displays an average rating with star display, rating breakdown bars,
 * and filter chips for sorting/filtering reviews.
 */
export function ReviewSummary({
  rating,
  reviewCount,
  reviews,
  activeFilter = 'recent',
  onFilterChange,
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
    <View className="mb-4">
      {/* Rating card */}
      <View className="bg-cairn-card border border-cairn-border rounded-2xl p-4 mb-3">
        <View className="flex-row items-start">
          {/* Left: big rating number */}
          <View className="items-center mr-5">
            <Text className="text-slate-100 font-bold text-5xl">
              {rating.toFixed(1)}
            </Text>
            <View className="flex-row items-center mt-1.5 gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color="#F4A261"
                  fill={i < Math.round(rating) ? '#F4A261' : 'transparent'}
                />
              ))}
            </View>
            <Text className="text-slate-500 text-xs mt-1.5">
              {reviewCount.toLocaleString()} review{reviewCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Right: breakdown bars */}
          <View className="flex-1 justify-center">
            {breakdown.map((item) => (
              <View
                key={item.star}
                className="flex-row items-center gap-2 mb-2"
              >
                <View className="flex-row items-center w-5">
                  <Text className="text-slate-500 text-xs font-medium text-right">
                    {item.star}
                  </Text>
                  <Star size={8} color="#64748b" className="ml-0.5" />
                </View>
                <View className="flex-1 h-2.5 bg-cairn-elevated rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.pct > 0 ? '#F4A261' : 'transparent',
                    }}
                  />
                </View>
                <Text className="text-slate-500 text-[10px] w-8 text-right font-medium">
                  {Math.round(item.pct)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Filter chips row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {FILTER_OPTIONS.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            selected={activeFilter === filter.key}
            onPress={() => onFilterChange?.(filter.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
