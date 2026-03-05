import { View, Text, Pressable } from 'react-native';
import { MapPin, Star, ArrowUpRight } from 'lucide-react-native';
import { DifficultyBadge, ConditionBadge } from '../ui/Badge';
import { ActivityIcon } from '../ui/ActivityIcon';
import { useFormat } from '@/lib/use-format';
import type { Trail } from '@cairn/shared';

interface TrailCardProps {
  trail: Trail;
  onPress?: () => void;
}

export function TrailCard({ trail, onPress }: TrailCardProps) {
  const fmt = useFormat();

  return (
    <Pressable
      onPress={onPress}
      className="bg-cairn-card border border-cairn-border rounded-2xl p-4 mb-3 active:bg-cairn-card-hover"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-slate-100 font-semibold text-base" numberOfLines={1}>
            {trail.name}
          </Text>
          {trail.city && (
            <View className="flex-row items-center mt-0.5">
              <MapPin size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {trail.city}, {trail.state_province}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center">
          <Star size={12} color="#F4A261" fill="#F4A261" />
          <Text className="text-slate-300 text-xs ml-1">
            {trail.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-2">
        <DifficultyBadge difficulty={trail.difficulty} />
        <ConditionBadge condition={trail.current_condition} />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="text-slate-400 text-xs">
            {fmt.distance(trail.distance_meters)}
          </Text>
          <Text className="text-slate-400 text-xs">
            {fmt.elevation(trail.elevation_gain_meters)} gain
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          {trail.activity_types.slice(0, 3).map((at) => (
            <ActivityIcon key={at} activitySlug={at} size="sm" />
          ))}
        </View>
      </View>
    </Pressable>
  );
}
