import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Medal,
  Lock,
  Calendar,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ── Mock Data (will be replaced with Supabase queries) ──

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  daysRemaining: number;
  emoji: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'same';
  isCurrentUser: boolean;
}

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
}

const MOCK_CHALLENGE: Challenge = {
  id: '1',
  title: 'March Miles Challenge',
  description: 'Cover 100 miles on trails this month',
  targetValue: 100,
  currentValue: 67,
  unit: 'miles',
  daysRemaining: 26,
  emoji: '\u{1F3D4}\uFE0F',
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'TrailBlazer22', value: 142, unit: 'mi', trend: 'up', isCurrentUser: false },
  { rank: 2, name: 'MountainGoat', value: 128, unit: 'mi', trend: 'up', isCurrentUser: false },
  { rank: 3, name: 'RidgeRunner', value: 105, unit: 'mi', trend: 'down', isCurrentUser: false },
  { rank: 4, name: 'PeakSeeker', value: 89, unit: 'mi', trend: 'same', isCurrentUser: false },
  { rank: 5, name: 'You', value: 67, unit: 'mi', trend: 'up', isCurrentUser: true },
];

const MOCK_BADGES: Badge[] = [
  { id: '1', name: '100 Mile Club', emoji: '\u{1F3C5}', description: 'Cover 100 miles total', earned: true },
  { id: '2', name: 'Early Bird', emoji: '\u{1F305}', description: '10 activities before 7am', earned: true },
  { id: '3', name: 'Trail Steward', emoji: '\u{1F33F}', description: 'Write 5 trail reviews', earned: false },
  { id: '4', name: 'Summit Seeker', emoji: '\u26F0\uFE0F', description: '50,000 ft elevation gain', earned: false },
  { id: '5', name: 'Social Butterfly', emoji: '\u{1F98B}', description: 'Join 10 group activities', earned: false },
  { id: '6', name: 'Streak Master', emoji: '\u{1F525}', description: '30-day activity streak', earned: false },
];

// ── Components ──

function ProgressBar({
  current,
  target,
  label,
}: {
  current: number;
  target: number;
  label: string;
}) {
  const pct = Math.min((current / target) * 100, 100);

  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-slate-300 text-sm font-medium">{label}</Text>
        <Text className="text-canopy text-sm font-bold">
          {current}/{target}
        </Text>
      </View>
      <View className="h-3 bg-cairn-elevated rounded-full overflow-hidden">
        <View
          className="h-full bg-canopy rounded-full"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const TrendIcon =
    entry.trend === 'up'
      ? TrendingUp
      : entry.trend === 'down'
        ? TrendingDown
        : Minus;
  const trendColor =
    entry.trend === 'up'
      ? '#10B981'
      : entry.trend === 'down'
        ? '#ef4444'
        : '#64748b';

  return (
    <View
      className={`flex-row items-center py-3 px-3 rounded-xl mb-1.5 ${
        entry.isCurrentUser ? 'bg-canopy/10 border border-canopy/30' : ''
      }`}
    >
      {/* Rank */}
      <View className="w-8 items-center">
        {entry.rank <= 3 ? (
          <Text className="text-lg">
            {entry.rank === 1
              ? '\u{1F947}'
              : entry.rank === 2
                ? '\u{1F948}'
                : '\u{1F949}'}
          </Text>
        ) : (
          <Text className="text-slate-500 font-bold text-sm">
            {entry.rank}
          </Text>
        )}
      </View>

      {/* Avatar + Name */}
      <View className="flex-row items-center flex-1 ml-2">
        <View className="w-8 h-8 rounded-full bg-cairn-elevated items-center justify-center mr-2">
          <Text className="text-slate-400 text-xs font-semibold">
            {entry.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text
          className={`text-sm font-medium ${
            entry.isCurrentUser ? 'text-canopy' : 'text-slate-200'
          }`}
        >
          {entry.name}
        </Text>
      </View>

      {/* Value */}
      <Text className="text-slate-300 font-bold text-sm mr-2">
        {entry.value} {entry.unit}
      </Text>

      {/* Trend */}
      <TrendIcon size={14} color={trendColor} />
    </View>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <View
      className={`w-[30%] items-center p-3 rounded-2xl border mb-3 ${
        badge.earned
          ? 'bg-cairn-card border-cairn-border'
          : 'bg-cairn-card/50 border-cairn-border/50'
      }`}
    >
      <View className="relative">
        <Text style={{ fontSize: 32, opacity: badge.earned ? 1 : 0.3 }}>
          {badge.emoji}
        </Text>
        {!badge.earned && (
          <View className="absolute -bottom-1 -right-1">
            <Lock size={12} color="#64748b" />
          </View>
        )}
      </View>
      <Text
        className={`text-[10px] font-medium text-center mt-1 ${
          badge.earned ? 'text-slate-300' : 'text-slate-600'
        }`}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
    </View>
  );
}

// ── Main Screen ──

export default function ChallengesScreen() {
  const challenge = MOCK_CHALLENGE;
  const [joined, setJoined] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-cairn-card items-center justify-center mr-3"
        >
          <ArrowLeft size={20} color="#e2e8f0" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-slate-100 font-bold text-xl">
            Challenges
          </Text>
        </View>
        <Trophy size={20} color="#f59e0b" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Current Challenge ── */}
        <Card className="mb-4 border-canopy/30">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">{challenge.emoji}</Text>
              <View>
                <Text className="text-slate-100 font-bold text-base">
                  {challenge.title}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  {challenge.description}
                </Text>
              </View>
            </View>
          </View>

          <ProgressBar
            current={challenge.currentValue}
            target={challenge.targetValue}
            label={`${challenge.unit} completed`}
          />

          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center">
              <Calendar size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {challenge.daysRemaining} days remaining
              </Text>
            </View>
            <Text className="text-canopy text-xs font-bold">
              {Math.round(
                (challenge.currentValue / challenge.targetValue) * 100,
              )}
              % complete
            </Text>
          </View>
        </Card>

        {/* Join CTA (if not joined) */}
        {!joined && (
          <Button onPress={() => setJoined(true)} size="lg" className="mb-4">
            Join This Challenge
          </Button>
        )}

        {/* ── Leaderboard ── */}
        <Text className="text-slate-100 font-semibold text-lg mb-3">
          Leaderboard
        </Text>
        <Card className="mb-4">
          {MOCK_LEADERBOARD.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </Card>

        {/* ── Achievement Badges ── */}
        <Text className="text-slate-100 font-semibold text-lg mb-3">
          Badges
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {MOCK_BADGES.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
