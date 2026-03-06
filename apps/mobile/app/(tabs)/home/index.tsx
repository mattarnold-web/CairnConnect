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
  Sun,
  Cloud,
  ChevronRight,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  CircleDot,
  Route,
  Calendar,
  Flame,
  Ticket,
  Award,
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
import { formatDuration } from '@cairn/shared';
import type { Trail, ActivityPost } from '@cairn/shared';

// Gradient color pairs for trail card cover placeholders
const GRADIENT_COLORS = [
  ['#065f46', '#0d9488'], // emerald to teal
  ['#1e3a5f', '#3b82f6'], // blue-dark to blue
  ['#7c2d12', '#f59e0b'], // brown to amber
  ['#4c1d95', '#8b5cf6'], // violet-dark to violet
  ['#134e4a', '#10B981'], // teal-dark to green
];

function getGradientColors(index: number): string[] {
  return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
}

// Mock permit costs for display
function getTrailCost(trail: Trail): string {
  if (trail.difficulty === 'green' || trail.difficulty === 'blue') return 'Free';
  if (trail.difficulty === 'black') return '$10 permit';
  if (trail.difficulty === 'double_black') return '$15 permit';
  return 'Free';
}

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
      <Text className="text-slate-100 font-bold text-lg">
        {title}
      </Text>
      <View className="flex-row items-center">
        <Text className="text-canopy text-sm font-semibold mr-1">
          {actionLabel}
        </Text>
        <ChevronRight size={14} color="#10B981" />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { state: activityState } = useActivityContext();
  const { state: tripState } = useTripContext();
  const fmt = useFormat();

  const [trails, setTrails] = useState<Trail[]>([]);
  const [posts, setPosts] = useState<ActivityPost[]>([]);
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
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-3 py-2">
            <Sun size={16} color="#F4A261" />
            <Text className="text-slate-300 text-sm font-medium ml-1.5">
              72°
            </Text>
          </View>
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
                  {/* Cover photo placeholder with gradient */}
                  <View
                    className="h-28 items-center justify-center relative"
                    style={{
                      backgroundColor: getGradientColors(index)[0],
                    }}
                  >
                    {/* Trending badge on first item */}
                    {index === 0 && (
                      <View
                        className="absolute top-2.5 left-2.5 flex-row items-center rounded-full px-2 py-1"
                        style={{ backgroundColor: 'rgba(245, 158, 11, 0.9)' }}
                      >
                        <Flame size={10} color="white" />
                        <Text className="text-white text-[10px] font-bold ml-0.5">
                          Trending
                        </Text>
                      </View>
                    )}
                    {/* Featured badge on second item */}
                    {index === 1 && (
                      <View
                        className="absolute top-2.5 left-2.5 flex-row items-center rounded-full px-2 py-1"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)' }}
                      >
                        <Award size={10} color="white" />
                        <Text className="text-white text-[10px] font-bold ml-0.5">
                          Featured
                        </Text>
                      </View>
                    )}
                    {/* Trail icon overlay */}
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

                    {/* Rating + review count row */}
                    <View className="flex-row items-center mb-2">
                      <Star size={12} color="#F4A261" fill="#F4A261" />
                      <Text className="text-slate-200 text-xs font-semibold ml-1">
                        {item.rating.toFixed(1)}
                      </Text>
                      <Text className="text-slate-600 text-xs ml-1">
                        ({Math.floor(item.rating * 100 + 50)} reviews)
                      </Text>
                    </View>

                    {/* Distance + difficulty + cost row */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-slate-400 text-xs">
                          {fmt.distance(item.distance_meters)}
                        </Text>
                        <View
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor:
                              item.difficulty === 'green'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : item.difficulty === 'blue'
                                  ? 'rgba(59, 130, 246, 0.15)'
                                  : item.difficulty === 'black'
                                    ? 'rgba(100, 116, 139, 0.25)'
                                    : 'rgba(239, 68, 68, 0.15)',
                          }}
                        >
                          <Text
                            className="text-[10px] font-semibold"
                            style={{
                              color:
                                item.difficulty === 'green'
                                  ? '#10B981'
                                  : item.difficulty === 'blue'
                                    ? '#3b82f6'
                                    : item.difficulty === 'black'
                                      ? '#94a3b8'
                                      : '#ef4444',
                            }}
                          >
                            {item.difficulty === 'green'
                              ? 'Easy'
                              : item.difficulty === 'blue'
                                ? 'Moderate'
                                : item.difficulty === 'black'
                                  ? 'Hard'
                                  : item.difficulty === 'double_black'
                                    ? 'Expert'
                                    : item.difficulty}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <Ticket size={10} color="#64748b" />
                        <Text className="text-slate-500 text-[10px] ml-1 font-medium">
                          {getTrailCost(item)}
                        </Text>
                      </View>
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

        {/* ── From the Board ── */}
        <View className="mb-6">
          <SectionHeader
            title="From the Board"
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
      </ScrollView>
    </SafeAreaView>
  );
}
