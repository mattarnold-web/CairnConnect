import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';

interface SpotlightBadgeProps {
  tier?: 'founding' | 'standard' | 'premium' | null;
}

export function SpotlightBadge({ tier }: SpotlightBadgeProps) {
  if (!tier) return null;

  return (
    <View className="flex-row items-center bg-spotlight-gold/20 rounded-full px-2 py-0.5">
      <Star size={10} color="#F4A261" fill="#F4A261" />
      <Text className="text-spotlight-gold text-xs font-semibold ml-1">
        Spotlight
      </Text>
    </View>
  );
}
