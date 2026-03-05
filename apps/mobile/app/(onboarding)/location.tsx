import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Mountain, TreePine } from 'lucide-react-native';
import { requestLocationPermissions } from '@/lib/location';

export default function LocationScreen() {
  const [requesting, setRequesting] = useState(false);

  async function handleEnableLocation() {
    setRequesting(true);
    try {
      await requestLocationPermissions();
    } catch {
      // User denied or error — continue anyway
    }
    router.push('/(onboarding)/upgrade');
  }

  function handleSkip() {
    router.push('/(onboarding)/upgrade');
  }

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg">
      <View className="flex-1 items-center justify-center px-8">
        {/* Title */}
        <Text className="mb-3 text-center font-display text-3xl font-bold text-white">
          Discover Trails &amp; Businesses Near You
        </Text>

        {/* Description */}
        <Text className="mb-10 text-center text-base leading-relaxed text-slate-400">
          Allow location access so we can show you nearby trails, local outdoor
          businesses, and activity partners in your area.
        </Text>

        {/* Illustration: stylized map with location pin */}
        <View className="mb-10 h-52 w-72 items-center justify-center overflow-hidden rounded-3xl bg-cairn-card">
          {/* Background landscape elements */}
          <View className="absolute bottom-0 left-0 right-0 h-20 rounded-b-3xl bg-canopy/10" />
          <View className="absolute bottom-16 left-6">
            <TreePine size={32} color="#10B981" strokeWidth={1.5} opacity={0.4} />
          </View>
          <View className="absolute bottom-14 right-8">
            <Mountain size={40} color="#10B981" strokeWidth={1.5} opacity={0.3} />
          </View>
          <View className="absolute bottom-12 left-16">
            <TreePine size={24} color="#10B981" strokeWidth={1.5} opacity={0.3} />
          </View>

          {/* Center pin */}
          <View className="items-center">
            <View className="mb-1 h-16 w-16 items-center justify-center rounded-full bg-canopy">
              <MapPin size={32} color="#ffffff" strokeWidth={2} />
            </View>
            {/* Pin shadow / pulse ring */}
            <View className="h-3 w-10 rounded-full bg-canopy/20" />
          </View>

          {/* Decorative grid lines */}
          <View className="absolute left-1/2 top-4 h-full w-px bg-slate-600/20" />
          <View className="absolute left-4 top-1/2 h-px w-full bg-slate-600/20" />
        </View>
      </View>

      {/* Bottom CTAs */}
      <View className="px-8 pb-6">
        <Pressable
          className="items-center rounded-2xl bg-canopy py-4 active:bg-canopy-dark"
          onPress={handleEnableLocation}
          disabled={requesting}
        >
          <Text className="text-lg font-bold text-white">
            {requesting ? 'Requesting...' : 'Enable Location'}
          </Text>
        </Pressable>

        <Pressable className="mt-4 items-center py-2" onPress={handleSkip}>
          <Text className="text-base text-slate-400">Skip for Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
