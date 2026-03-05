import { View, Text, Pressable } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { SpotlightBadge } from '../ui/SpotlightBadge';
import { BUSINESS_CATEGORIES } from '@cairn/shared';
import type { Business } from '@cairn/shared';

interface BusinessCardProps {
  business: Business;
  onPress?: () => void;
}

export function BusinessCard({ business, onPress }: BusinessCardProps) {
  const categoryInfo = BUSINESS_CATEGORIES.find((c) => c.value === business.category);

  return (
    <Pressable
      onPress={onPress}
      className="bg-cairn-card border border-cairn-border rounded-2xl p-4 mb-3 active:bg-cairn-card-hover"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-slate-100 font-semibold text-base" numberOfLines={1}>
              {business.name}
            </Text>
            {business.is_spotlight && (
              <SpotlightBadge tier={business.spotlight_tier} />
            )}
          </View>
          {business.city && (
            <View className="flex-row items-center mt-0.5">
              <MapPin size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {business.city}, {business.state_province}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center">
          <Star size={12} color="#F4A261" fill="#F4A261" />
          <Text className="text-slate-300 text-xs ml-1">
            {business.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-slate-400 text-xs">
          {categoryInfo?.icon} {categoryInfo?.label ?? business.category}
        </Text>
        {business.special_offer && (
          <Text className="text-spotlight-gold text-xs font-medium" numberOfLines={1}>
            {business.special_offer}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
