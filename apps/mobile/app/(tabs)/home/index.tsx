import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  CircleDot,
  Route,
  Calendar,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { TrailCard } from '@/components/trail/TrailCard';
import { ActivityBoardCard } from '@/components/activity/ActivityBoardCard';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth-context';
import { useActivityContext } from '@/lib/activity-context';
import { useTripContext } from '@/lib/trip-context';
import { useFormat } from '@/lib/use-format';
import { fetchTrails, fetchActivityPosts } from '@/lib/api';
import { fetchWeather, type CurrentWeather } from '@/lib/weather';
import { formatDuration } from '@cairn/shared';
import type { Trail, ActivityPost } from '@cairn/shared';

const CARD_COLORS = ['#065f46', '#1e3a5f', '#7c2d12', '#4c1d95', '#134e4a'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(email?: string | null): string {
  if (!email) return 'Explorer';
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Pressable
      onPress={onAction}
      className="flex-row items-center justify-between mb-3"
    >
      <Text className="text-slate-100 font-bold text-lg">{title}</Text>
      <View className="flex-row items-center">
        <Text className="text-canopy text-sm font-medium mr-1">{actionLabel}</Text>
        <ChevronRight size={14} color="#10B981" />
      </View>
    </Pressable>
  );
}

const DIFF_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  green: { bg: 'rgba(16,185,129,0.15)', text: '#10B981', label: 'Easy' },
  blue: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Moderate' },
  black: { bg: 'rgba(100,116,139,0.25)', text: '#94a3b8', label: 'Hard' },
  double_black: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Expert' },
  proline: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', label: 'Pro' },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const d = DIFF_COLORS[difficulty] ?? DIFF_COLORS.blue;
  return (
    <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: d.bg }}>
      <Text className="text-[10px] font-semibold" style={{ color: d.text }}>{d.label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { state: activityState } = useActivityContext();
  const { state: tripState } = useTripContext();
  const fmt = useFormat();

  const [trails, setTrails] = useState<Trail[]>([]);
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [trailData, postData] = await Promise.all([
        fetchTrails({ limit: 5 }),
        fetchActivityPosts({ limit: 3 }),
      ]);
      setTrails(trailData);
      setPosts(postData);
      // Fetch weather in background (non-blocking)
      fetchWeather(38.5733, -109.5498).then((w) => setWeather(w.current)).catch(() => {});
    } catch {
      // Data will be empty — sections show empty states
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Get latest completed activity from local context
  const latestActivity = activityState.activities
    .filter((a) => a.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )[0];

  // Active trip — the trip context holds a single trip state
  const hasActiveTrip = tripState.region != null || tripState.days.length > 0;

  const greeting = getGreeting();
  const displayName = user?.user_metadata?.display_name as string | undefined;
  const firstName = displayName ?? getFirstName(user?.email);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-slate-100 font-bold text-xl">
              {greeting}, {firstName}
            </Text>
          </View>
          {weather && (
            <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-lg px-2.5 py-1.5">
              <Text className="text-xs mr-1">{weather.icon}</Text>
              <Text className="text-slate-300 text-xs font-medium">{weather.temp_f}°</Text>
            </View>
          )}
        </View>

        {/* ── Quick Actions ── */}
        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => router.push('/(tabs)/explore')}
            className="flex-1 bg-canopy/15 border border-canopy/30 rounded-xl px-3 py-3 items-center"
          >
            <MapPin size={18} color="#10B981" />
            <Text className="text-canopy text-xs font-semibold mt-1">Explore</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/record')}
            className="flex-1 bg-cairn-card border border-cairn-border rounded-xl px-3 py-3 items-center"
          >
            <CircleDot size={18} color="#94a3b8" />
            <Text className="text-slate-300 text-xs font-semibold mt-1">Record</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/trip')}
            className="flex-1 bg-cairn-card border border-cairn-border rounded-xl px-3 py-3 items-center"
          >
            <Route size={18} color="#94a3b8" />
            <Text className="text-slate-300 text-xs font-semibold mt-1">Plan Trip</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/board')}
            className="flex-1 bg-cairn-card border border-cairn-border rounded-xl px-3 py-3 items-center"
          >
            <Calendar size={18} color="#94a3b8" />
            <Text className="text-slate-300 text-xs font-semibold mt-1">Board</Text>
          </Pressable>
        </View>

        {/* ── Nearby Trails ── */}
        <View className="mb-4">
          <SectionHeader title="Nearby Trails" actionLabel="See All" onAction={() => router.push('/(tabs)/explore')} />
          {loading ? (
            <View className="flex-row gap-2">
              <View className="flex-1"><SkeletonCard /></View>
              <View className="flex-1"><SkeletonCard /></View>
            </View>
          ) : trails.length > 0 ? (
            <FlatList
              data={trails.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.slug}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => router.push(`/(tabs)/explore/trail/${item.slug}`)}
                  className="w-44 bg-cairn-card border border-cairn-border rounded-xl overflow-hidden"
                >
                  <View
                    className="h-16 items-center justify-center"
                    style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
                  >
                    <MapPin size={16} color="rgba(255,255,255,0.6)" />
                  </View>
                  <View className="px-2.5 py-2">
                    <Text className="text-slate-100 font-semibold text-xs" numberOfLines={1}>{item.name}</Text>
                    {item.city && (
                      <Text className="text-slate-500 text-[10px] mt-0.5" numberOfLines={1}>{item.city}</Text>
                    )}
                    <View className="flex-row items-center gap-2 mt-1">
                      {item.rating != null && item.rating > 0 && (
                        <View className="flex-row items-center">
                          <Star size={9} color="#F4A261" fill="#F4A261" />
                          <Text className="text-slate-400 text-[10px] ml-0.5">{item.rating.toFixed(1)}</Text>
                        </View>
                      )}
                      {item.difficulty && <DifficultyBadge difficulty={item.difficulty} />}
                    </View>
                  </View>
                </Pressable>
              )}
            />
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/explore')} className="bg-cairn-card border border-cairn-border rounded-xl p-3">
              <Text className="text-slate-500 text-xs text-center">Tap to explore trails nearby</Text>
            </Pressable>
          )}
        </View>

        {/* ── Recent Activity ── */}
        <View className="mb-4">
          <SectionHeader title="Recent Activity" actionLabel="Record" onAction={() => router.push('/(tabs)/record')} />
          {latestActivity ? (
            <Pressable onPress={() => router.push(`/(tabs)/record/activity/${latestActivity.id}`)}>
              <Card>
                <View className="flex-row items-center">
                  <ActivityIcon activitySlug={latestActivity.activityType} size="md" />
                  <View className="ml-2 flex-1">
                    <Text className="text-slate-100 font-medium text-sm" numberOfLines={1}>{latestActivity.title}</Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      <Text className="text-slate-500 text-[10px]">{fmt.distance(latestActivity.distanceMeters)}</Text>
                      <Text className="text-slate-500 text-[10px]">{formatDuration(latestActivity.durationSeconds)}</Text>
                      <Text className="text-canopy text-[10px]">↑{fmt.elevation(latestActivity.elevationGainMeters)}</Text>
                    </View>
                  </View>
                  <ChevronRight size={14} color="#475569" />
                </View>
              </Card>
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/record')}>
              <Card>
                <View className="flex-row items-center py-1">
                  <CircleDot size={20} color="#10B981" />
                  <View className="ml-3">
                    <Text className="text-slate-200 font-medium text-sm">Record your first activity</Text>
                    <Text className="text-slate-500 text-[10px]">Track hikes, rides, and more</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
        </View>

        {/* ── Active Trip ── */}
        {hasActiveTrip && (
          <View className="mb-4">
            <SectionHeader title="Active Trip" actionLabel="View" onAction={() => router.push('/(tabs)/trip')} />
            <Pressable onPress={() => router.push('/(tabs)/trip')}>
              <Card>
                <View className="flex-row items-center">
                  <Route size={16} color="#10B981" />
                  <View className="flex-1 ml-2">
                    <Text className="text-slate-100 font-medium text-sm">{tripState.tripName || 'Upcoming Trip'}</Text>
                    {tripState.region && (
                      <Text className="text-slate-500 text-[10px] mt-0.5">{tripState.region.name} · {tripState.days.length} day{tripState.days.length !== 1 ? 's' : ''}</Text>
                    )}
                  </View>
                  <ChevronRight size={14} color="#475569" />
                </View>
              </Card>
            </Pressable>
          </View>
        )}

        {/* ── Community ── */}
        <View className="mb-4">
          <SectionHeader title="Community" actionLabel="See All" onAction={() => router.push('/(tabs)/board')} />
          {loading ? (
            <SkeletonCard />
          ) : posts.length > 0 ? (
            posts.slice(0, 2).map((post) => (
              <ActivityBoardCard key={post.id} post={post} onPress={() => router.push(`/(tabs)/board/${post.id}`)} />
            ))
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/board/create')}>
              <Card>
                <View className="flex-row items-center py-1">
                  <Calendar size={20} color="#10B981" />
                  <View className="ml-3">
                    <Text className="text-slate-200 font-medium text-sm">Find adventure partners</Text>
                    <Text className="text-slate-500 text-[10px]">Post to the community board</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
