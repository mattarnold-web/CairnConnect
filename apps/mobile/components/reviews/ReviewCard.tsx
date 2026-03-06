import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ThumbsUp, MoreHorizontal } from 'lucide-react-native';
import { StarRating } from './StarRating';
import { Card } from '@/components/ui/Card';
import type { Review } from '@/lib/api';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
}

const AVATAR_COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
  const [helpfulPressed, setHelpfulPressed] = useState(false);
  const avatarColor = getAvatarColor(review.author_name);

  // Simulated helpful count (from DB helpful_count or fallback)
  const helpfulCount = (review as unknown as Record<string, unknown>).helpful_count as number | undefined;
  const displayHelpful = helpfulCount ?? Math.floor(Math.random() * 50);

  const handleHelpful = () => {
    setHelpfulPressed(true);
    onHelpful?.(review.id);
  };

  return (
    <Card className="mb-3">
      {/* Author row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {/* Colored avatar circle */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: avatarColor + '25' }}
          >
            <Text
              style={{ color: avatarColor, fontSize: 14, fontWeight: '700' }}
            >
              {getInitials(review.author_name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-200 text-sm font-semibold">
              {review.author_name}
            </Text>
            <View className="flex-row items-center mt-1 gap-2">
              <StarRating rating={review.rating} size={12} />
              <View className="w-1 h-1 rounded-full bg-slate-600" />
              <Text className="text-slate-500 text-xs">
                {formatRelativeDate(review.created_at)}
              </Text>
            </View>
          </View>
        </View>
        <Pressable className="p-1">
          <MoreHorizontal size={16} color="#475569" />
        </Pressable>
      </View>

      {/* Title */}
      {review.title && (
        <Text className="text-slate-100 font-semibold text-sm mb-1.5">
          {review.title}
        </Text>
      )}

      {/* Body */}
      {review.body && (
        <Text className="text-slate-400 text-sm leading-5 mb-3">
          {review.body}
        </Text>
      )}

      {/* Photo thumbnails grid - horizontal scrollable */}
      {review.photos && review.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3 -mx-1"
          contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
        >
          {review.photos.slice(0, 6).map((photo, i) => (
            <Pressable key={i}>
              <View
                className="w-20 h-20 rounded-xl bg-cairn-elevated items-center justify-center overflow-hidden"
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(30, 58, 95, 0.5)',
                }}
              >
                <Text className="text-slate-600 text-[10px]">Photo</Text>
              </View>
            </Pressable>
          ))}
          {review.photos.length > 6 && (
            <View className="w-20 h-20 rounded-xl bg-cairn-elevated/80 items-center justify-center">
              <Text className="text-slate-400 text-sm font-bold">
                +{review.photos.length - 6}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Helpful button */}
      <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-cairn-border/50">
        <Pressable
          onPress={handleHelpful}
          disabled={helpfulPressed}
          className={`flex-row items-center rounded-full px-3 py-1.5 ${
            helpfulPressed
              ? 'bg-canopy/10'
              : 'bg-cairn-elevated'
          }`}
        >
          <ThumbsUp
            size={13}
            color={helpfulPressed ? '#10B981' : '#64748b'}
            fill={helpfulPressed ? '#10B981' : 'transparent'}
          />
          <Text
            className={`text-xs font-medium ml-1.5 ${
              helpfulPressed ? 'text-canopy' : 'text-slate-500'
            }`}
          >
            Helpful{displayHelpful > 0 ? ` (${displayHelpful + (helpfulPressed ? 1 : 0)})` : ''}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
