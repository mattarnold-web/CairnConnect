import { View, Text, Pressable } from 'react-native';
import { MapPin, Users, Calendar } from 'lucide-react-native';
import { Badge } from '../ui/Badge';
import { ActivityIcon } from '../ui/ActivityIcon';
import { formatDate, timeUntil } from '@cairn/shared';
import type { ActivityPost } from '@cairn/shared';

interface ActivityBoardCardProps {
  post: ActivityPost;
  onPress?: () => void;
}

const POST_TYPE_CONFIG = {
  im_going: { label: "I'm Going", variant: 'green' as const, emoji: '\u{1F7E2}' },
  open_permit: { label: 'Open Permit', variant: 'amber' as const, emoji: '\u{1F3AB}' },
  lfg: { label: 'LFG', variant: 'purple' as const, emoji: '\u{1F7E3}' },
};

export function ActivityBoardCard({ post, onPress }: ActivityBoardCardProps) {
  const config = POST_TYPE_CONFIG[post.post_type] ?? POST_TYPE_CONFIG.im_going;
  const spotsLeft = post.max_participants - post.current_participants;

  return (
    <Pressable
      onPress={onPress}
      className="bg-cairn-card border border-cairn-border rounded-2xl p-4 mb-3 active:bg-cairn-card-hover"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Badge label={config.label} variant={config.variant} />
        <Text className="text-slate-500 text-xs">{timeUntil(post.activity_date)}</Text>
      </View>

      <Text className="text-slate-100 font-semibold text-base mb-1" numberOfLines={2}>
        {post.title}
      </Text>

      <View className="flex-row items-center gap-3 mb-2">
        <ActivityIcon activitySlug={post.activity_type} size="sm" showLabel />
        <Badge label={post.skill_level} />
      </View>

      {post.location_name && (
        <View className="flex-row items-center mb-2">
          <MapPin size={12} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>
            {post.location_name}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Calendar size={12} color="#64748b" />
          <Text className="text-slate-400 text-xs ml-1">
            {formatDate(post.activity_date)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Users size={12} color="#64748b" />
          <Text className="text-slate-400 text-xs ml-1">
            {post.current_participants}/{post.max_participants}
            {spotsLeft > 0 && ` (${spotsLeft} left)`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
