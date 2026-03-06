import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Settings,
  LogOut,
  FileDown,
  Trash2,
  Mountain,
  BarChart3,
  ChevronRight,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  Image as ImageIcon,
  Award,
  Activity,
  Shield,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth-context';
import { useActivityContext } from '@/lib/activity-context';
import { usePreferences } from '@/lib/preferences-context';
import { useFormat } from '@/lib/use-format';
import { shareGpx } from '@/lib/gpx-export';
import { fetchUserActivities } from '@/lib/api';
import { formatDuration } from '@cairn/shared';
import type { UserActivity } from '@cairn/shared';
import type { RecordedActivity } from '@/lib/activity-types';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { state, dispatch } = useActivityContext();
  const { preferences, dispatch: prefsDispatch } = usePreferences();
  const fmt = useFormat();
  const [refreshing, setRefreshing] = useState(false);

  // Server-side activities from Supabase
  const [serverActivities, setServerActivities] = useState<UserActivity[]>([]);
  const [loadingServer, setLoadingServer] = useState(false);

  // Fetch server activities when user is logged in
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoadingServer(true);

    fetchUserActivities(user.id)
      .then((data) => {
        if (!cancelled) setServerActivities(data);
      })
      .catch(() => {
        // Silently fail - we still have local activities
      })
      .finally(() => {
        if (!cancelled) setLoadingServer(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Use local recorded activities (from context) as primary display
  const completedActivities = state.activities
    .filter((a) => a.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

  // Compute stats from local activities + server activities
  const localDistance = completedActivities.reduce(
    (sum, a) => sum + a.distanceMeters,
    0,
  );
  const serverDistance = serverActivities.reduce(
    (sum, a) => sum + (a.distance_meters ?? 0),
    0,
  );
  const totalDistance = localDistance + serverDistance;

  const localElevation = completedActivities.reduce(
    (sum, a) => sum + a.elevationGainMeters,
    0,
  );
  const serverElevation = serverActivities.reduce(
    (sum, a) => sum + (a.elevation_gain_meters ?? 0),
    0,
  );
  const totalElevation = localElevation + serverElevation;

  const localDuration = completedActivities.reduce(
    (sum, a) => sum + a.durationSeconds,
    0,
  );
  const serverDuration = serverActivities.reduce(
    (sum, a) => sum + (a.duration_seconds ?? 0),
    0,
  );
  const totalDuration = localDuration + serverDuration;

  const totalPhotos = completedActivities.reduce(
    (sum, a) => sum + a.photos.length,
    0,
  );

  const totalActivityCount =
    completedActivities.length + serverActivities.length;

  // Longest activity by distance (local only for now)
  const longestActivity =
    completedActivities.length > 0
      ? completedActivities.reduce((best, a) =>
          a.distanceMeters > best.distanceMeters ? a : best,
        )
      : null;

  // Activity type breakdown
  const typeCounts = completedActivities.reduce(
    (acc, a) => {
      acc[a.activityType] = (acc[a.activityType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  // Also count server activities
  for (const a of serverActivities) {
    typeCounts[a.activity_type] = (typeCounts[a.activity_type] || 0) + 1;
  }
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      try {
        const data = await fetchUserActivities(user.id);
        setServerActivities(data);
      } catch {
        // Silently fail
      }
    }
    setRefreshing(false);
  }, [user?.id]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Activity?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'DELETE_ACTIVITY', id }),
      },
    ]);
  };

  const handleShareActivity = async (activity: RecordedActivity) => {
    const avgSpeed =
      activity.durationSeconds > 0
        ? activity.distanceMeters / activity.durationSeconds
        : 0;
    const text = [
      activity.title,
      `Distance: ${fmt.distance(activity.distanceMeters)}`,
      `Duration: ${formatDuration(activity.durationSeconds)}`,
      `Avg Speed: ${fmt.speed(avgSpeed)}`,
      `Elevation Gain: ${fmt.elevation(activity.elevationGainMeters)}`,
      '',
      'Recorded with Cairn Connect',
    ].join('\n');

    try {
      await Share.share({ message: text, title: activity.title });
    } catch {
      // User cancelled
    }
  };

  const navigateToActivity = (id: string) => {
    router.push(`/(tabs)/record/activity/${id}`);
  };

  const isBusinessOwner = !!user;

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <FlatList
        data={completedActivities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Profile header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View className="h-14 w-14 rounded-full bg-canopy/20 items-center justify-center mr-3">
                  <Mountain size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-100 font-bold text-lg">
                    {user?.email ?? 'Outdoor Explorer'}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    {totalActivityCount} activities recorded
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/profile/settings')}
                className="p-2"
              >
                <Settings size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Quick action buttons */}
            <View className="flex-row gap-3 mb-4">
              {isBusinessOwner && (
                <Pressable
                  onPress={() => router.push('/(tabs)/profile/dashboard')}
                  className="flex-1 flex-row items-center justify-center bg-cairn-card border border-cairn-border rounded-xl py-2.5 active:bg-cairn-card-hover"
                >
                  <BarChart3 size={14} color="#10B981" />
                  <Text className="text-slate-300 text-xs font-medium ml-2">
                    Dashboard
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => router.push('/(tabs)/profile/settings')}
                className="flex-1 flex-row items-center justify-center bg-cairn-card border border-cairn-border rounded-xl py-2.5 active:bg-cairn-card-hover"
              >
                <Settings size={14} color="#64748b" />
                <Text className="text-slate-300 text-xs font-medium ml-2">
                  Settings
                </Text>
              </Pressable>
            </View>

            {/* Stats overview - enhanced with 4 cards */}
            <View className="flex-row gap-2 mb-3">
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <MapPin size={10} color="#64748b" />
                  <Text className="text-slate-500 text-[10px]">Total Distance</Text>
                </View>
                <Text className="text-slate-100 font-bold text-base">
                  {fmt.distance(totalDistance)}
                </Text>
              </Card>
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <TrendingUp size={10} color="#10B981" />
                  <Text className="text-slate-500 text-[10px]">Total Elevation</Text>
                </View>
                <Text className="text-canopy font-bold text-base">
                  {fmt.elevation(totalElevation)}
                </Text>
              </Card>
            </View>

            <View className="flex-row gap-2 mb-4">
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <Clock size={10} color="#64748b" />
                  <Text className="text-slate-500 text-[10px]">Total Time</Text>
                </View>
                <Text className="text-slate-100 font-bold text-base">
                  {formatDuration(totalDuration)}
                </Text>
              </Card>
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <ImageIcon size={10} color="#64748b" />
                  <Text className="text-slate-500 text-[10px]">Photos</Text>
                </View>
                <Text className="text-slate-100 font-bold text-base">
                  {totalPhotos}
                </Text>
              </Card>
            </View>

            {/* Achievement highlights */}
            {(longestActivity || topType) && (
              <Card className="mb-4">
                <View className="flex-row items-center gap-1 mb-2">
                  <Award size={12} color="#fbbf24" />
                  <Text className="text-amber-400 text-xs font-semibold">
                    Highlights
                  </Text>
                </View>
                {longestActivity && (
                  <Text className="text-slate-400 text-xs mb-1">
                    Longest: {fmt.distance(longestActivity.distanceMeters)} (
                    {longestActivity.title})
                  </Text>
                )}
                {topType && (
                  <Text className="text-slate-400 text-xs">
                    Favorite: {topType[0]} ({topType[1]} times)
                  </Text>
                )}
              </Card>
            )}

            {/* Loading indicator for server activities */}
            {loadingServer && (
              <View className="mb-4">
                <SkeletonCard />
              </View>
            )}

            {/* Connected Apps */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile/connected-apps')}
              className="mb-4"
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-9 w-9 rounded-xl bg-canopy/20 items-center justify-center mr-3">
                      <Activity size={18} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-medium text-sm">
                        Connected Apps
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        Strava, Garmin, Apple Health, and more
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </View>
              </Card>
            </Pressable>

            {/* Challenges */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile/challenges')}
              className="mb-4"
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-9 w-9 rounded-xl bg-amber-500/20 items-center justify-center mr-3">
                      <Award size={18} color="#fbbf24" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-medium text-sm">
                        Challenges & Badges
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        Monthly challenges, leaderboards, achievements
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </View>
              </Card>
            </Pressable>

            {/* Safety Center */}
            <Pressable
              onPress={() => router.push('/(tabs)/profile/safety')}
              className="mb-4"
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-9 w-9 rounded-xl bg-red-500/20 items-center justify-center mr-3">
                      <Shield size={18} color="#ef4444" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-medium text-sm">
                        Safety Center
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        SOS, emergency contacts, share location
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#64748b" />
                </View>
              </Card>
            </Pressable>

            {/* Auth button */}
            {!user && (
              <Button
                onPress={() => router.push('/(auth)/login')}
                size="lg"
                className="mb-6"
              >
                Sign In / Sign Up
              </Button>
            )}

            <Text className="text-slate-100 font-semibold text-lg mb-3">
              Activity History
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigateToActivity(item.id)}
            className="mb-3"
          >
            <Card>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <ActivityIcon activitySlug={item.activityType} size="md" />
                  <View className="ml-2 flex-1">
                    <Text
                      className="text-slate-100 font-medium text-sm"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Calendar size={10} color="#64748b" />
                      <Text className="text-slate-500 text-xs">
                        {new Date(item.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={16} color="#64748b" />
              </View>

              {/* Stats row */}
              <View className="flex-row items-center gap-4 mb-2">
                <View className="flex-row items-center gap-1">
                  <MapPin size={10} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs">
                    {fmt.distance(item.distanceMeters)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Clock size={10} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs">
                    {formatDuration(item.durationSeconds)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <TrendingUp size={10} color="#10B981" />
                  <Text className="text-slate-400 text-xs">
                    {fmt.elevation(item.elevationGainMeters)}
                  </Text>
                </View>
                {item.photos.length > 0 && (
                  <View className="flex-row items-center gap-1">
                    <ImageIcon size={10} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs">
                      {item.photos.length}
                    </Text>
                  </View>
                )}
              </View>

              {/* Quick actions */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => shareGpx(item)}
                  className="flex-row items-center px-2 py-1 bg-cairn-elevated rounded-lg"
                >
                  <FileDown size={12} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs ml-1">GPX</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleShareActivity(item)}
                  className="flex-row items-center px-2 py-1 bg-cairn-elevated rounded-lg"
                >
                  <Text className="text-slate-400 text-xs">Share</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  className="flex-row items-center px-2 py-1 bg-cairn-elevated rounded-lg"
                >
                  <Trash2 size={12} color="#ef4444" />
                  <Text className="text-red-400 text-xs ml-1">Delete</Text>
                </Pressable>
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          loadingServer ? (
            <View>
              <SkeletonCard className="mb-3" />
              <SkeletonCard className="mb-3" />
            </View>
          ) : (
            <Text className="text-slate-500 text-center mt-4">
              No activities recorded yet. Hit the Record tab to get started!
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
