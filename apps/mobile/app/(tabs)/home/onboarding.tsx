import { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { saveToStorage } from '@/lib/storage';
import { ACTIVITY_TYPES } from '@cairn/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = 'cairn-onboarding-complete';

interface OnboardingStep {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    emoji: '\u26F0\uFE0F',
    title: 'Welcome to Cairn Go',
    subtitle: 'Your outdoor adventure companion.\nDiscover trails, find partners, and track your progress.',
  },
  {
    id: 'activities',
    emoji: '\u{1F3D4}\uFE0F',
    title: 'What do you love?',
    subtitle: 'Select the activities you enjoy so we can personalize your experience.',
  },
  {
    id: 'location',
    emoji: '\u{1F4CD}',
    title: 'Enable Location',
    subtitle: 'We use your location to find nearby trails, businesses, and activity partners.',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const toggleActivity = (slug: string) => {
    setSelectedActivities((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug],
    );
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      flatListRef.current?.scrollToIndex({ index: nextStep, animated: true });
    } else {
      // Complete onboarding
      await saveToStorage(ONBOARDING_KEY, true);
      if (selectedActivities.length > 0) {
        await saveToStorage('cairn-preferred-activities', selectedActivities);
      }
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = async () => {
    await saveToStorage(ONBOARDING_KEY, true);
    router.replace('/(tabs)/home');
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 px-6">
      {item.id === 'welcome' && (
        <View className="flex-1 items-center justify-center">
          <Text style={{ fontSize: 80, marginBottom: 24 }}>{item.emoji}</Text>
          <Text className="text-slate-100 font-bold text-3xl text-center mb-3">
            {item.title}
          </Text>
          <Text className="text-slate-400 text-base text-center leading-6">
            {item.subtitle}
          </Text>
        </View>
      )}

      {item.id === 'activities' && (
        <View className="flex-1 pt-16">
          <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>
            {item.emoji}
          </Text>
          <Text className="text-slate-100 font-bold text-2xl text-center mb-2">
            {item.title}
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-8">
            {item.subtitle}
          </Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {ACTIVITY_TYPES.slice(0, 12).map((at) => (
              <Pressable
                key={at.slug}
                onPress={() => toggleActivity(at.slug)}
                className={`items-center px-4 py-3 rounded-2xl border mb-1 ${
                  selectedActivities.includes(at.slug)
                    ? 'bg-canopy/15 border-canopy/30'
                    : 'bg-cairn-card border-cairn-border'
                }`}
              >
                <Text style={{ fontSize: 28 }}>{at.emoji}</Text>
                <Text
                  className={`text-xs font-medium mt-1 ${
                    selectedActivities.includes(at.slug)
                      ? 'text-canopy'
                      : 'text-slate-400'
                  }`}
                >
                  {at.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {item.id === 'location' && (
        <View className="flex-1 items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-canopy/20 items-center justify-center mb-6">
            <MapPin size={40} color="#10B981" />
          </View>
          <Text className="text-slate-100 font-bold text-2xl text-center mb-2">
            {item.title}
          </Text>
          <Text className="text-slate-400 text-sm text-center leading-5 px-4">
            {item.subtitle}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top', 'bottom']}>
      {/* Skip button */}
      <View className="flex-row justify-end px-4 pt-2">
        <Pressable onPress={handleSkip} className="py-2 px-3">
          <Text className="text-slate-500 text-sm font-medium">Skip</Text>
        </Pressable>
      </View>

      {/* Step content */}
      <FlatList
        ref={flatListRef}
        data={STEPS}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderStep}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom: progress dots + next button */}
      <View className="px-6 pb-4">
        {/* Progress dots */}
        <View className="flex-row items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === currentStep
                  ? 'w-6 bg-canopy'
                  : i < currentStep
                    ? 'w-2 bg-canopy/50'
                    : 'w-2 bg-cairn-border'
              }`}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <Button onPress={handleNext} size="lg">
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-base mr-2">
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ChevronRight size={18} color="white" />
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
}
