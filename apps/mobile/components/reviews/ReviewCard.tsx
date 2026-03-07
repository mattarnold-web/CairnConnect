import { View, Text, Pressable } from 'react-native';
import { ThumbsUp } from 'lucide-react-native';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: {
    id: string;
    author_name: string;
    author_avatar: string | null;
    rating: number;
    title: string | null;
    body: string | null;
    created_at: string;
    photos?: string[];
  };
  onHelpful?: (reviewId: string) => void;
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const initials = review.author_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = getTimeAgo(review.created_at);

  return (
    <View
      style={{
        backgroundColor: '#0F2337',
        borderWidth: 1,
        borderColor: '#1E3A5F',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Author row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#10B981',
            opacity: 0.2,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '700' }}>
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '600' }}>
            {review.author_name}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 11 }}>{timeAgo}</Text>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>

      {/* Title */}
      {review.title && (
        <Text
          style={{
            color: '#cbd5e1',
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
          }}
        >
          {review.title}
        </Text>
      )}

      {/* Body */}
      {review.body && (
        <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 18 }}>
          {review.body}
        </Text>
      )}

      {/* Helpful button */}
      {onHelpful && (
        <Pressable
          onPress={() => onHelpful(review.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 8,
            backgroundColor: 'rgba(15, 35, 55, 0.5)',
            alignSelf: 'flex-start',
          }}
        >
          <ThumbsUp size={12} color="#64748b" />
          <Text style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>
            Helpful
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
