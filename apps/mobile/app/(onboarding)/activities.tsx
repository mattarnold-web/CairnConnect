import { useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ACTIVITY_TYPES } from '@cairn/shared';
import { saveSelectedActivities } from '@/lib/onboarding';

export default function ActivitiesScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { width } = useWindowDimensions();

  // 5 columns on wider phones (>=400), 4 on smaller
  const numColumns = width >= 400 ? 5 : 4;
  const gap = 12;
  const horizontalPadding = 24;
  const availableWidth = width - horizontalPadding * 2;
  const itemSize = (availableWidth - gap * (numColumns - 1)) / numColumns;

  function toggleActivity(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  async function handleContinue() {
    await saveSelectedActivities(Array.from(selected));
    router.push('/(onboarding)/location');
  }

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg">
      {/* Header */}
      <View className="px-6 pb-4 pt-6">
        <Text className="text-center font-display text-3xl font-bold text-white">
          What Do You Love?
        </Text>
        <Text className="mt-2 text-center text-base text-slate-400">
          Pick the activities you enjoy. We'll personalize your experience.
        </Text>
      </View>

      {/* Activity Grid */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
        }}
        showsVerticalScrollIndicator={false}
      >
        {ACTIVITY_TYPES.map((activity) => {
          const isSelected = selected.has(activity.slug);
          return (
            <Pressable
              key={activity.slug}
              onPress={() => toggleActivity(activity.slug)}
              style={{ width: itemSize, height: itemSize + 24 }}
              className={`items-center justify-center rounded-2xl ${
                isSelected ? 'bg-canopy/20 border-2 border-canopy' : 'bg-cairn-card'
              }`}
            >
              {/* Checkmark overlay */}
              {isSelected && (
                <View className="absolute right-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full bg-canopy">
                  <Check size={12} color="#ffffff" strokeWidth={3} />
                </View>
              )}

              <Text className="text-2xl">{activity.emoji}</Text>
              <Text
                className="mt-1 px-1 text-center text-[10px] leading-tight text-slate-300"
                numberOfLines={2}
              >
                {activity.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-6 pt-3">
        <Pressable
          className={`items-center rounded-2xl py-4 ${
            selected.size > 0 ? 'bg-canopy active:bg-canopy-dark' : 'bg-cairn-card'
          }`}
          onPress={handleContinue}
          disabled={selected.size === 0}
        >
          <Text
            className={`text-lg font-bold ${
              selected.size > 0 ? 'text-white' : 'text-slate-500'
            }`}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
