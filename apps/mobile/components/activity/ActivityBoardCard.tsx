import { View, Text, Pressable } from 'react-native';
import { MapPin, Users, Calendar, Mountain, Ticket, MessageCircle } from 'lucide-react-native';
import { ActivityIcon } from '../ui/ActivityIcon';
import { formatDate, timeUntil } from '@cairn/shared';
import type { ActivityPost } from '@cairn/shared';

interface ActivityBoardCardProps {
  post: ActivityPost;
  onPress?: () => void;
  onMessage?: () => void;
}

const POST_TYPE_CONFIG = {
  lfg: {
    label: 'Looking for Group',
    barColor: '#10B981',
    labelColor: '#10B981',
    bgTint: 'bg-emerald-500/10',
    icon: Users,
    iconColor: '#10B981',
  },
  im_going: {
    label: 'Join Me on Trail',
    barColor: '#14B8A6',
    labelColor: '#14B8A6',
    bgTint: 'bg-teal-500/10',
    icon: Mountain,
    iconColor: '#14B8A6',
  },
  open_permit: {
    label: 'Open Permit Seats',
    barColor: '#F4A261',
    labelColor: '#F4A261',
    bgTint: 'bg-amber-500/10',
    icon: Ticket,
    iconColor: '#F4A261',
  },
};

export function ActivityBoardCard({ post, onPress, onMessage }: ActivityBoardCardProps) {
  const config = POST_TYPE_CONFIG[post.post_type] ?? POST_TYPE_CONFIG.im_going;
  const spotsLeft = post.max_participants - post.current_participants;
  const IconComponent = config.icon;

  return (
    <Pressable
      onPress={onPress}
      className="bg-cairn-card border border-cairn-border rounded-2xl mb-3 overflow-hidden active:bg-cairn-card-hover"
    >
      <View className="flex-row">
        {/* Left colored accent bar */}
        <View
          style={{ backgroundColor: config.barColor, width: 4 }}
          className="rounded-l-2xl"
        />

        {/* Card content */}
        <View className="flex-1 p-4">
          {/* Header: post type label + activity icon */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <IconComponent size={14} color={config.iconColor} />
              <Text
                style={{ color: config.labelColor }}
                className="text-xs font-semibold ml-1.5 uppercase tracking-wide"
              >
                {config.label}
              </Text>
            </View>
            <ActivityIcon activitySlug={post.activity_type} size="sm" showLabel />
          </View>

          {/* Title */}
          <Text className="text-slate-100 font-semibold text-base mb-2" numberOfLines={2}>
            {post.title}
          </Text>

          {/* Date + Location line */}
          <View className="flex-row items-center flex-wrap gap-x-4 mb-3">
            <View className="flex-row items-center">
              <Calendar size={13} color="#64748b" />
              <Text className="text-slate-400 text-xs ml-1.5">
                {formatDate(post.activity_date)}
              </Text>
            </View>
            {post.location_name && (
              <View className="flex-row items-center">
                <MapPin size={13} color="#64748b" />
                <Text className="text-slate-400 text-xs ml-1" numberOfLines={1}>
                  {post.location_name}
                </Text>
              </View>
            )}
          </View>

          {/* Spots + Time info */}
          <View className="flex-row items-center mb-3">
            <View className="flex-row items-center bg-cairn-bg/50 rounded-lg px-2 py-1 mr-2">
              <Users size={12} color="#94a3b8" />
              <Text className="text-slate-400 text-xs ml-1">
                {post.current_participants}/{post.max_participants}
                {spotsLeft > 0 ? ` \u00B7 ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : ' \u00B7 Full'}
              </Text>
            </View>
            <Text className="text-slate-500 text-xs">{timeUntil(post.activity_date)}</Text>
          </View>

          {/* Message button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              if (onMessage) onMessage();
            }}
            className="bg-canopy rounded-xl py-2.5 flex-row items-center justify-center active:bg-canopy-dark"
          >
            <MessageCircle size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">Message</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
