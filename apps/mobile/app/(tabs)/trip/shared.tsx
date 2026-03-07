import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Download,
  MapPin,
  Calendar,
  Share2,
  AlertCircle,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { decodeTripState } from '@/lib/trip-share';
import { estimateTripCost } from '@/lib/trip-cost';
import { useTripContext } from '@/lib/trip-context';
import { fetchTrails } from '@/lib/api';
import { ACTIVITY_TYPES } from '@cairn/shared';
import { Share } from 'react-native';

const DIFFICULTY_LABELS: Record<string, string> = {
  green: 'Easy',
  blue: 'Intermediate',
  black: 'Advanced',
  double_black: 'Expert',
  proline: 'Pro Line',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  green: '#10B981',
  blue: '#3B82F6',
  black: '#6B7280',
  double_black: '#111827',
  proline: '#7C3AED',
};

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export default function SharedTripScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { dispatch } = useTripContext();

  const tripState = useMemo(() => {
    if (!code) return null;
    return decodeTripState(code);
  }, [code]);

  const [trails, setTrails] = useState<any[]>([]);

  useEffect(() => {
    if (!tripState) return;
    const trailIds = new Set<string>();
    for (const day of tripState.days) {
      for (const item of day.items) {
        if (item.type === 'trail' && item.trailId) trailIds.add(item.trailId);
      }
    }
    if (trailIds.size === 0) return;

    fetchTrails({ limit: 100 })
      .then(setTrails)
      .catch(() => setTrails([]));
  }, [tripState]);

  const costEstimate = useMemo(() => {
    if (!tripState) return null;
    return estimateTripCost(tripState);
  }, [tripState]);

  const tripStats = useMemo(() => {
    if (!tripState) return { totalTrails: 0, totalDistance: 0, totalElevation: 0, totalDuration: 0 };
    let totalTrails = 0;
    let totalDistance = 0;
    let totalElevation = 0;
    let totalDuration = 0;

    for (const day of tripState.days) {
      for (const item of day.items) {
        if (item.type === 'trail' && item.trailId) {
          const trail = trails.find((t) => t.id === item.trailId);
          if (trail) {
            totalTrails++;
            totalDistance += trail.distance_meters;
            totalElevation += trail.elevation_gain_meters;
            totalDuration += trail.estimated_duration_minutes ?? 0;
          }
        }
      }
    }

    return { totalTrails, totalDistance, totalElevation, totalDuration };
  }, [tripState, trails]);

  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  };

  const formatElevation = (meters: number) => {
    const feet = meters * 3.281;
    return `${Math.round(feet).toLocaleString()} ft`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleImport = () => {
    if (!tripState) return;
    Alert.alert(
      'Import Trip',
      'This will replace your current trip plan. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            dispatch({ type: 'LOAD_STATE', state: tripState });
            Alert.alert('Imported', 'Trip loaded into your planner!', [
              { text: 'View Trip', onPress: () => router.replace('/(tabs)/trip') },
            ]);
          },
        },
      ],
    );
  };

  const handleReShare = async () => {
    if (!code) return;
    await Share.share({
      message: `Check out this trip on Cairn Connect!\n\ncairnconnect://trip?code=${code}`,
    });
  };

  // Error state: no code provided or decode failed
  if (!code || !tripState) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
          <Pressable onPress={() => router.back()} className="p-1 mr-3">
            <ArrowLeft size={24} color="#e2e8f0" />
          </Pressable>
          <Text className="text-slate-100 font-semibold text-base">Shared Trip</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 rounded-full bg-cairn-card border border-cairn-border items-center justify-center mb-4">
            <AlertCircle size={28} color="#ef4444" />
          </View>
          <Text className="text-slate-300 font-semibold text-base mb-1 text-center">
            Unable to Load Trip
          </Text>
          <Text className="text-slate-500 text-sm text-center mb-4">
            {!code
              ? 'No trip code was provided. Make sure you followed a valid share link.'
              : 'The trip code could not be decoded. It may be corrupted or expired.'}
          </Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const regionName = tripState.region?.name ?? 'Unknown Region';
  const tripName = tripState.tripName || `Trip to ${regionName}`;
  const totalActivities = tripState.days.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
        <Pressable onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={24} color="#e2e8f0" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-slate-100 font-semibold text-base" numberOfLines={1}>
            Shared Trip
          </Text>
          <Text className="text-slate-500 text-xs">Read-only preview</Text>
        </View>
        <Pressable onPress={handleReShare} className="p-2">
          <Share2 size={20} color="#64748b" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Trip header card */}
        <Card className="mx-4 mt-4 mb-3">
          <View className="flex-row items-start">
            {tripState.region && (
              <Text className="text-3xl mr-3">{tripState.region.coverEmoji}</Text>
            )}
            <View className="flex-1">
              <Text className="text-slate-100 font-bold text-xl">{tripName}</Text>
              <Text className="text-slate-400 text-sm">{regionName}</Text>
              {tripState.startDate && (
                <View className="flex-row items-center mt-1">
                  <Calendar size={12} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1">
                    {new Date(tripState.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Activity badges */}
          {tripState.selectedActivities.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {tripState.selectedActivities.map((slug) => {
                const at = ACTIVITY_TYPES.find((a) => a.slug === slug);
                return (
                  <View
                    key={slug}
                    className="flex-row items-center bg-cairn-elevated rounded-full px-2.5 py-1"
                  >
                    <Text className="text-sm mr-1">{at?.emoji}</Text>
                    <Text className="text-slate-300 text-xs">{at?.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Stats */}
        <View className="flex-row gap-3 mx-4 mb-3">
          <Card className="flex-1">
            <Text className="text-canopy font-bold text-lg">{tripState.days.length}</Text>
            <Text className="text-slate-500 text-[10px]">Days</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-canopy font-bold text-lg">{totalActivities}</Text>
            <Text className="text-slate-500 text-[10px]">Activities</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-canopy font-bold text-lg">{tripStats.totalTrails}</Text>
            <Text className="text-slate-500 text-[10px]">Trails</Text>
          </Card>
        </View>

        {tripStats.totalDistance > 0 && (
          <View className="flex-row gap-3 mx-4 mb-3">
            <Card className="flex-1">
              <Text className="text-canopy font-bold text-lg">
                {formatDistance(tripStats.totalDistance)}
              </Text>
              <Text className="text-slate-500 text-[10px]">Distance</Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-canopy font-bold text-lg">
                {formatElevation(tripStats.totalElevation)}
              </Text>
              <Text className="text-slate-500 text-[10px]">Elevation</Text>
            </Card>
          </View>
        )}

        {/* Day-by-day itinerary */}
        <View className="px-4">
          <Text className="text-slate-100 font-semibold text-sm mb-2">Itinerary</Text>
          {tripState.days.map((day) => (
            <Card key={day.id} className="mb-3">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="h-6 w-6 rounded-full bg-canopy/20 items-center justify-center">
                  <Text className="text-canopy text-xs font-bold">{day.dayNumber}</Text>
                </View>
                <Text className="text-slate-100 font-semibold text-sm flex-1">
                  Day {day.dayNumber}
                  {day.label && (
                    <Text className="text-slate-400 font-normal"> {'\u2014'} {day.label}</Text>
                  )}
                </Text>
                {day.date && (
                  <Text className="text-slate-500 text-xs">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                )}
              </View>

              {day.items.length === 0 ? (
                <Text className="text-slate-500 text-xs italic">No activities planned</Text>
              ) : (
                <View className="gap-2">
                  {day.items.map((item) => {
                    if (item.type === 'trail' && item.trailId) {
                      const trail = trails.find((t) => t.id === item.trailId);
                      if (!trail) return null;
                      return (
                        <View
                          key={item.id}
                          className="flex-row items-start gap-2 p-2 bg-cairn-bg/50 rounded-lg"
                        >
                          <View
                            className="h-2.5 w-2.5 rounded-full mt-1.5"
                            style={{
                              backgroundColor: DIFFICULTY_COLORS[trail.difficulty] || '#6B7280',
                            }}
                          />
                          <View className="flex-1">
                            <Text className="text-slate-200 text-xs font-medium">
                              {trail.name}
                            </Text>
                            <View className="flex-row items-center gap-1 mt-0.5">
                              <Text className="text-slate-500 text-[10px]">
                                {DIFFICULTY_LABELS[trail.difficulty]}
                              </Text>
                              <Text className="text-slate-600 text-[10px]">{'\u2022'}</Text>
                              <Text className="text-slate-500 text-[10px]">
                                {formatDistance(trail.distance_meters)}
                              </Text>
                              {item.timeSlot && (
                                <>
                                  <Text className="text-slate-600 text-[10px]">{'\u2022'}</Text>
                                  <Text className="text-canopy text-[10px]">
                                    {TIME_SLOT_LABELS[item.timeSlot]}
                                  </Text>
                                </>
                              )}
                            </View>
                            {item.notes ? (
                              <Text className="text-slate-400 text-[10px] italic mt-0.5">
                                {item.notes}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      );
                    }

                    if (item.type === 'custom') {
                      return (
                        <View
                          key={item.id}
                          className="flex-row items-start gap-2 p-2 bg-cairn-bg/50 rounded-lg"
                        >
                          <ActivityIcon
                            activitySlug={item.customActivityType || ''}
                            size="sm"
                          />
                          <View className="flex-1">
                            <Text className="text-slate-200 text-xs font-medium">
                              {item.customTitle || 'Custom Activity'}
                            </Text>
                            {item.timeSlot && (
                              <Text className="text-canopy text-[10px] mt-0.5">
                                {TIME_SLOT_LABELS[item.timeSlot]}
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    }

                    return null;
                  })}
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* Cost estimate */}
        {costEstimate && (costEstimate.items.length > 0 || costEstimate.permitCosts > 0) && (
          <Card className="mx-4 mb-3">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-slate-100 font-semibold text-sm">Estimated Cost</Text>
            </View>
            <Text className="text-canopy font-bold text-xl">
              ${costEstimate.totalMin}-${costEstimate.totalMax}
            </Text>
            <Text className="text-slate-600 text-[9px] mt-1">
              Estimates based on typical pricing. Actual costs may vary.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View className="absolute bottom-0 left-0 right-0 bg-cairn-bg border-t border-cairn-border px-4 pt-3 pb-8">
        <Button size="lg" onPress={handleImport}>
          <View className="flex-row items-center">
            <Download size={18} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Import Trip
            </Text>
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
}
