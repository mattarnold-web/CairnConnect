import { View, Text, Pressable } from 'react-native';
import { ThumbsUp } from 'lucide-react-native';
import { StarRating } from './StarRating';
import { Card } from '@/components/ui/Card';
import type { Review } from '@/lib/api';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''} ago`;
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  return (
    <Card className="mb-3">
      {/* Author row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="w-9 h-9 rounded-full bg-cairn-elevated items-center justify-center mr-2.5">
            <Text className="text-slate-300 text-xs font-semibold">
              {getInitials(review.author_name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-200 text-sm font-medium">
              {review.author_name}
            </Text>
            <View className="flex-row items-center mt-0.5 gap-2">
              <StarRating rating={review.rating} size={11} />
              <Text className="text-slate-600 text-[10px]">
                {formatRelativeDate(review.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Title */}
      {review.title && (
        <Text className="text-slate-200 font-medium text-sm mb-1">
          {review.title}
        </Text>
      )}

      {/* Body */}
      {review.body && (
        <Text className="text-slate-400 text-sm leading-5 mb-2">
          {review.body}
        </Text>
      )}

      {/* Photo thumbnails */}
      {review.photos && review.photos.length > 0 && (
        <View className="flex-row gap-2 mb-2">
          {review.photos.slice(0, 4).map((photo, i) => (
            <View
              key={i}
              className="w-16 h-16 rounded-lg bg-cairn-elevated items-center justify-center"
            >
              <Text className="text-slate-600 text-[10px]">Photo</Text>
            </View>
          ))}
        </View>
      )}

      {/* Helpful button */}
      {onHelpful && (
        <Pressable
          onPress={() => onHelpful(review.id)}
          className="flex-row items-center mt-1"
        >
          <ThumbsUp size={12} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-1.5">Helpful</Text>
        </Pressable>
      )}
    </Card>
  );
}
