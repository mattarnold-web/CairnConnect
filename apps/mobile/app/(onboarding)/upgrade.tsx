import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Check,
  X,
  Map,
  MessageSquare,
  RefreshCw,
  Tag,
  ShieldOff,
  Search,
  FileText,
  Megaphone,
} from 'lucide-react-native';
import { setOnboardingCompleted } from '@/lib/onboarding';

interface FeatureRowProps {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

function FeatureRow({ label, free, pro }: FeatureRowProps) {
  return (
    <View className="flex-row items-center border-b border-cairn-border/30 py-3">
      {/* Label */}
      <View className="flex-1 pr-2">
        <Text className="text-sm text-slate-300">{label}</Text>
      </View>

      {/* FREE column */}
      <View className="w-16 items-center">
        {typeof free === 'string' ? (
          <Text className="text-xs text-slate-400">{free}</Text>
        ) : free ? (
          <Check size={18} color="#10B981" strokeWidth={2.5} />
        ) : (
          <X size={18} color="#64748b" strokeWidth={2} />
        )}
      </View>

      {/* PRO column */}
      <View className="w-16 items-center">
        {typeof pro === 'string' ? (
          <Text className="text-xs font-semibold text-canopy">{pro}</Text>
        ) : pro ? (
          <Check size={18} color="#10B981" strokeWidth={2.5} />
        ) : (
          <X size={18} color="#64748b" strokeWidth={2} />
        )}
      </View>
    </View>
  );
}

const FEATURES: FeatureRowProps[] = [
  { label: 'Basic Trail Search', free: true, pro: true },
  { label: 'Activity Board Posts', free: 'Limited', pro: 'Unlimited' },
  { label: 'Offline Maps', free: false, pro: true },
  { label: 'Device Sync', free: false, pro: true },
  { label: 'Exclusive Local Discounts', free: false, pro: true },
  { label: 'Ads', free: 'Yes', pro: 'None' },
];

export default function UpgradeScreen() {
  async function handleStartTrial() {
    await setOnboardingCompleted();
    router.replace('/(tabs)/explore');
  }

  async function handleContinueFree() {
    await setOnboardingCompleted();
    router.replace('/(tabs)/explore');
  }

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="px-6 pb-2 pt-8">
          <Text className="text-center font-display text-3xl font-bold text-white">
            Upgrade to Cairn Pro
          </Text>
        </View>

        {/* Column headers */}
        <View className="mx-6 mt-6 flex-row items-end">
          <View className="flex-1" />

          {/* FREE header */}
          <View className="w-16 items-center">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Free
            </Text>
          </View>

          {/* PRO header with badge */}
          <View className="w-16 items-center">
            <View className="mb-1 rounded-full bg-spotlight-gold/20 px-2 py-0.5">
              <Text className="text-[9px] font-bold text-spotlight-gold">
                Save 33%
              </Text>
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-canopy">
              Pro
            </Text>
          </View>
        </View>

        {/* Feature comparison */}
        <View className="mx-6 mt-3 rounded-2xl bg-cairn-card px-4">
          {FEATURES.map((feature) => (
            <FeatureRow key={feature.label} {...feature} />
          ))}
        </View>

        {/* Price */}
        <View className="mt-6 items-center">
          <Text className="text-2xl font-bold text-white">
            $80<Text className="text-base font-normal text-slate-400">/yr</Text>
          </Text>
          <Text className="mt-1 text-sm text-slate-400">
            billed annually
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View className="px-6 pb-6 pt-3">
        <Pressable
          className="items-center rounded-2xl bg-canopy py-4 active:bg-canopy-dark"
          onPress={handleStartTrial}
        >
          <Text className="text-lg font-bold text-white">Start Free Trial</Text>
          <Text className="mt-0.5 text-xs text-canopy-light/70">
            7 days free, then $80/yr
          </Text>
        </Pressable>

        <Pressable className="mt-4 items-center py-2" onPress={handleContinueFree}>
          <Text className="text-base text-slate-400">Continue with Free</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
