import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mountain } from 'lucide-react-native';
import { isOnboardingCompleted } from '@/lib/onboarding';

export default function WelcomeScreen() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    isOnboardingCompleted().then((completed) => {
      if (completed) {
        router.replace('/(tabs)/explore');
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return <View className="flex-1 bg-cairn-bg" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-canopy/20">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-canopy">
            <Mountain size={48} color="#ffffff" strokeWidth={2} />
          </View>
        </View>

        {/* Title */}
        <Text className="mb-3 text-center font-display text-4xl font-bold text-white">
          Cairn Connect
        </Text>

        {/* Subtitle */}
        <Text className="text-center text-lg text-slate-400">
          Find Your Trail. Find Your People.
        </Text>
      </View>

      {/* Bottom CTA */}
      <View className="px-8 pb-6">
        <Pressable
          className="items-center rounded-2xl bg-canopy py-4 active:bg-canopy-dark"
          onPress={() => router.push('/(onboarding)/activities')}
        >
          <Text className="text-lg font-bold text-white">Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
