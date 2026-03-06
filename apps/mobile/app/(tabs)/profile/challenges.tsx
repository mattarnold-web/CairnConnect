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
  Lock,
  Calendar,
  Flame,
  Users,
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
  participantCount: number;
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
  earnedDate?: string;
}

const AVATAR_COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
  participantCount: 284,
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'TrailBlazer22', value: 142, unit: 'mi', trend: 'up', isCurrentUser: false },
  { rank: 2, name: 'MountainGoat', value: 128, unit: 'mi', trend: 'up', isCurrentUser: false },
  { rank: 3, name: 'RidgeRunner', value: 105, unit: 'mi', trend: 'down', isCurrentUser: false },
  { rank: 4, name: 'PeakSeeker', value: 89, unit: 'mi', trend: 'same', isCurrentUser: false },
  { rank: 5, name: 'You', value: 67, unit: 'mi', trend: 'up', isCurrentUser: true },
];

const MOCK_BADGES: Badge[] = [
  { id: '1', name: '100 Mile Club', emoji: '\u{1F3C5}', description: 'Cover 100 miles total', earned: true, earnedDate: 'Feb 2025' },
  { id: '2', name: 'Early Bird', emoji: '\u{1F305}', description: '10 activities before 7am', earned: true, earnedDate: 'Jan 2025' },
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
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-300 text-sm font-medium">{label}</Text>
        <Text className="text-canopy text-sm font-bold">
          {current}/{target}
        </Text>
      </View>
      <View className="h-3.5 bg-cairn-elevated rounded-full overflow-hidden">
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

  const avatarBg = getAvatarColor(entry.name);

  return (
    <View
      className={`flex-row items-center py-3.5 px-3 rounded-xl mb-1.5 ${
        entry.isCurrentUser ? 'bg-canopy/10 border-2 border-canopy/40' : ''
      }`}
    >
      {/* Rank */}
      <View className="w-8 items-center">
        {entry.rank <= 3 ? (
          <Text className="text-xl">
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
        <View
          className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
          style={{ backgroundColor: avatarBg + '30' }}
        >
          <Text
            style={{ color: avatarBg, fontSize: 13, fontWeight: '700' }}
          >
            {entry.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text
            className={`text-sm font-semibold ${
              entry.isCurrentUser ? 'text-canopy' : 'text-slate-200'
            }`}
          >
            {entry.name}
          </Text>
          {entry.isCurrentUser && (
            <Text className="text-canopy/60 text-[10px] mt-0.5">
              That's you!
            </Text>
          )}
        </View>
      </View>

      {/* Value */}
      <Text className="text-slate-100 font-bold text-sm mr-3">
        {entry.value} {entry.unit}
      </Text>

      {/* Trend */}
      <View
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{ backgroundColor: trendColor + '20' }}
      >
        <TrendIcon size={13} color={trendColor} />
      </View>
    </View>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <View
      className={`w-[30%] items-center p-3 rounded-2xl border mb-3 ${
        badge.earned
          ? 'bg-cairn-card border-canopy/30'
          : 'bg-cairn-card/50 border-cairn-border/50'
      }`}
    >
      {/* Circular badge container */}
      <View
        className={`w-16 h-16 rounded-full items-center justify-center mb-2 ${
          badge.earned
            ? 'bg-canopy/10'
            : 'bg-cairn-elevated/50'
        }`}
        style={badge.earned ? {
          borderWidth: 2,
          borderColor: 'rgba(16, 185, 129, 0.3)',
        } : undefined}
      >
        <View className="relative">
          <Text style={{ fontSize: 28, opacity: badge.earned ? 1 : 0.25 }}>
            {badge.emoji}
          </Text>
          {!badge.earned && (
            <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cairn-elevated items-center justify-center">
              <Lock size={10} color="#64748b" />
            </View>
          )}
        </View>
      </View>
      <Text
        className={`text-xs font-semibold text-center ${
          badge.earned ? 'text-slate-200' : 'text-slate-600'
        }`}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
      {badge.earned && badge.earnedDate && (
        <Text className="text-canopy/60 text-[10px] mt-0.5">
          {badge.earnedDate}
        </Text>
      )}
      {!badge.earned && (
        <Text className="text-slate-700 text-[10px] mt-0.5">
          Locked
        </Text>
      )}
    </View>
  );
}

// ── Main Screen ──

export default function ChallengesScreen() {
  const challenge = MOCK_CHALLENGE;
  const [joined, setJoined] = useState(true);

  const earnedCount = MOCK_BADGES.filter((b) => b.earned).length;

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
          {/* Challenge header with large emoji */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-2xl bg-canopy/10 items-center justify-center mb-3">
              <Text style={{ fontSize: 36 }}>{challenge.emoji}</Text>
            </View>
            <Text className="text-slate-100 font-bold text-lg text-center">
              {challenge.title}
            </Text>
            <Text className="text-slate-500 text-sm mt-1 text-center">
              {challenge.description}
            </Text>
          </View>

          {/* Participants count */}
          <View className="flex-row items-center justify-center mb-4">
            <Users size={13} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1.5">
              {challenge.participantCount} participants
            </Text>
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
            <View className="flex-row items-center">
              <Flame size={12} color="#10B981" />
              <Text className="text-canopy text-xs font-bold ml-1">
                {Math.round(
                  (challenge.currentValue / challenge.targetValue) * 100,
                )}
                % complete
              </Text>
            </View>
          </View>
        </Card>

        {/* Join CTA (if not joined) */}
        {!joined && (
          <Pressable
            onPress={() => setJoined(true)}
            className="mb-4 rounded-xl overflow-hidden"
            style={{
              borderWidth: 2,
              borderColor: '#10B981',
            }}
          >
            <View
              className="px-6 py-4 items-center"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
              }}
            >
              <Text className="text-canopy font-bold text-base">
                Join This Challenge
              </Text>
              <Text className="text-canopy/60 text-xs mt-1">
                Compete with {challenge.participantCount} others
              </Text>
            </View>
          </Pressable>
        )}

        {/* ── Leaderboard ── */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-100 font-bold text-lg">
            Leaderboard
          </Text>
          <View className="flex-row items-center bg-cairn-elevated rounded-full px-2.5 py-1">
            <Trophy size={11} color="#F59E0B" />
            <Text className="text-slate-400 text-[10px] font-medium ml-1">
              Top 5
            </Text>
          </View>
        </View>
        <Card className="mb-5">
          {MOCK_LEADERBOARD.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </Card>

        {/* ── Achievement Badges ── */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-100 font-bold text-lg">
            Badges
          </Text>
          <Text className="text-slate-500 text-xs">
            {earnedCount}/{MOCK_BADGES.length} earned
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {MOCK_BADGES.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
