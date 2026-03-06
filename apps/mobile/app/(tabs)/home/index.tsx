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
          <Pressable
            onPress={() => router.push('/(tabs)/explore')}
            className="flex-row items-center justify-between mb-3"
          >
            <Text className="text-slate-100 font-semibold text-lg">
              Quick Picks
            </Text>
            <View className="flex-row items-center">
              <Text className="text-canopy text-sm font-medium mr-1">
                See all
              </Text>
              <ChevronRight size={14} color="#10B981" />
            </View>
          </Pressable>

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
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push(`/(tabs)/explore/trail/${item.slug}`)
                  }
                  className="w-64 bg-cairn-card border border-cairn-border rounded-2xl p-4 active:bg-cairn-card-hover"
                >
                  <Text
                    className="text-slate-100 font-semibold text-base mb-1"
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
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-slate-400 text-xs">
                        {fmt.distance(item.distance_meters)}
                      </Text>
                      <Text className="text-canopy text-xs font-medium">
                        {item.difficulty}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Star size={11} color="#F4A261" fill="#F4A261" />
                      <Text className="text-slate-300 text-xs ml-1">
                        {item.rating.toFixed(1)}
                      </Text>
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
          <Pressable
            onPress={() => router.push('/(tabs)/record')}
            className="flex-row items-center justify-between mb-3"
          >
            <Text className="text-slate-100 font-semibold text-lg">
              Recent Activity
            </Text>
            <View className="flex-row items-center">
              <Text className="text-canopy text-sm font-medium mr-1">
                Record
              </Text>
              <ChevronRight size={14} color="#10B981" />
            </View>
          </Pressable>

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
          <Pressable
            onPress={() => router.push('/(tabs)/board')}
            className="flex-row items-center justify-between mb-3"
          >
            <Text className="text-slate-100 font-semibold text-lg">
              From the Board
            </Text>
            <View className="flex-row items-center">
              <Text className="text-canopy text-sm font-medium mr-1">
                See all
              </Text>
              <ChevronRight size={14} color="#10B981" />
            </View>
          </Pressable>

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
          <Pressable
            onPress={() => router.push('/(tabs)/trip')}
            className="flex-row items-center justify-between mb-3"
          >
            <Text className="text-slate-100 font-semibold text-lg">
              Your Trips
            </Text>
            <View className="flex-row items-center">
              <Text className="text-canopy text-sm font-medium mr-1">
                Plan
              </Text>
              <ChevronRight size={14} color="#10B981" />
            </View>
          </Pressable>

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
