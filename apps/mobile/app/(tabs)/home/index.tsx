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
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* ── Greeting Header ── */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-slate-100 font-bold text-2xl">
              {greeting}, {firstName}
            </Text>
            <Text className="text-slate-500 text-sm mt-0.5">
              Ready for your next adventure?
            </Text>
          </View>
          {weather && (
            <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-3 py-2">
              <Text className="text-sm mr-1">{weather.icon}</Text>
              <Text className="text-slate-300 text-sm font-medium">
                {weather.temp_f}°F
              </Text>
            </View>
          )}
        </View>

        {/* ── Quick Picks: Nearby Trails ── */}
        <View className="mb-6">
          <SectionHeader
            title="Quick Picks"
            actionLabel="See All"
            onAction={() => router.push('/(tabs)/explore')}
          />

          {loading ? (
            <View className="flex-row gap-3">
              <View className="w-64">
                <SkeletonCard />
              </View>
              <View className="w-64">
                <SkeletonCard />
              </View>
            </View>
          ) : trails.length > 0 ? (
            <FlatList
              data={trails.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.slug}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() =>
                    router.push(`/(tabs)/explore/trail/${item.slug}`)
                  }
                  className="w-64 bg-cairn-card border border-cairn-border rounded-2xl overflow-hidden active:bg-cairn-card-hover"
                >
                  {/* Cover gradient */}
                  <View
                    className="h-24 items-center justify-center"
                    style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
                  >
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                      <MapPin size={20} color="white" />
                    </View>
                  </View>

                  {/* Card content */}
                  <View className="p-3.5">
                    <Text
                      className="text-slate-100 font-bold text-base mb-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.city && (
                      <View className="flex-row items-center mb-2">
                        <MapPin size={11} color="#64748b" />
                        <Text className="text-slate-500 text-xs ml-1">
                          {item.city}, {item.state_province}
                        </Text>
                      </View>
                    )}

                    {/* Stats row */}
                    <View className="flex-row items-center gap-3">
                      {item.rating != null && item.rating > 0 && (
                        <View className="flex-row items-center">
                          <Star size={11} color="#F4A261" fill="#F4A261" />
                          <Text className="text-slate-300 text-xs font-medium ml-1">
                            {item.rating.toFixed(1)}
                          </Text>
                          {item.review_count > 0 && (
                            <Text className="text-slate-600 text-xs ml-0.5">
                              ({item.review_count})
                            </Text>
                          )}
                        </View>
                      )}
                      {item.distance_meters != null && (
                        <Text className="text-slate-400 text-xs">
                          {fmt.distance(item.distance_meters)}
                        </Text>
                      )}
                      {item.difficulty && (
                        <DifficultyBadge difficulty={item.difficulty} />
                      )}
                    </View>
                  </View>
                </Pressable>
              )}
            />
          ) : (
            <Card>
              <Text className="text-slate-500 text-sm text-center">
                No trails found nearby. Try exploring the map!
              </Text>
            </Card>
          )}
        </View>

        {/* ── Recent Activity ── */}
        <View className="mb-6">
          <SectionHeader
            title="Recent Activity"
            actionLabel="Record"
            onAction={() => router.push('/(tabs)/record')}
          />

          {latestActivity ? (
            <Pressable
              onPress={() =>
                router.push(
                  `/(tabs)/record/activity/${latestActivity.id}`,
                )
              }
            >
              <Card>
                <View className="flex-row items-center mb-2">
                  <ActivityIcon
                    activitySlug={latestActivity.activityType}
                    size="md"
                  />
                  <View className="ml-2 flex-1">
                    <Text
                      className="text-slate-100 font-medium text-sm"
                      numberOfLines={1}
                    >
                      {latestActivity.title}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                      {new Date(latestActivity.startedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </View>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={10} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs">
                      {fmt.distance(latestActivity.distanceMeters)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Clock size={10} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs">
                      {formatDuration(latestActivity.durationSeconds)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <TrendingUp size={10} color="#10B981" />
                    <Text className="text-slate-400 text-xs">
                      {fmt.elevation(latestActivity.elevationGainMeters)}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/record')}>
              <Card>
                <View className="items-center py-4">
                  <CircleDot size={32} color="#10B981" />
                  <Text className="text-slate-100 font-medium text-sm mt-2">
                    Record your first activity
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    Track your hikes, rides, and more
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
        </View>

        {/* ── Your Trips ── */}
        <View className="mb-6">
          <SectionHeader
            title="Your Trips"
            actionLabel="Plan"
            onAction={() => router.push('/(tabs)/trip')}
          />

          {hasActiveTrip ? (
            <Pressable onPress={() => router.push('/(tabs)/trip')}>
              <Card>
                <View className="flex-row items-center mb-2">
                  <Route size={16} color="#10B981" />
                  <View className="flex-1 ml-2">
                    <Text className="text-slate-100 font-medium text-sm">
                      {tripState.tripName || 'Upcoming Trip'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </View>
                {tripState.region && (
                  <View className="flex-row items-center">
                    <MapPin size={11} color="#64748b" />
                    <Text className="text-slate-500 text-xs ml-1">
                      {tripState.region.name}, {tripState.region.state_province}
                    </Text>
                  </View>
                )}
                {tripState.days.length > 0 && (
                  <Text className="text-slate-500 text-xs mt-1">
                    {tripState.days.length} day{tripState.days.length !== 1 ? 's' : ''} planned
                  </Text>
                )}
              </Card>
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/trip')}>
              <Card>
                <View className="items-center py-4">
                  <Route size={32} color="#10B981" />
                  <Text className="text-slate-100 font-medium text-sm mt-2">
                    Plan your next trip
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    Build an itinerary with trails, lodging, and more
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
        </View>

        {/* ── Happening Nearby ── */}
        <View className="mb-6">
          <SectionHeader
            title="Happening Nearby"
            actionLabel="See All"
            onAction={() => router.push('/(tabs)/board')}
          />

          {loading ? (
            <View>
              <SkeletonCard className="mb-3" />
              <SkeletonCard />
            </View>
          ) : posts.length > 0 ? (
            posts
              .slice(0, 3)
              .map((post) => (
                <ActivityBoardCard
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/(tabs)/board/${post.id}`)}
                />
              ))
          ) : (
            <Pressable onPress={() => router.push('/(tabs)/board/create')}>
              <Card>
                <View className="items-center py-4">
                  <Calendar size={32} color="#10B981" />
                  <Text className="text-slate-100 font-medium text-sm mt-2">
                    No upcoming activities
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    Post to the board and find adventure partners
                  </Text>
                </View>
              </Card>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
