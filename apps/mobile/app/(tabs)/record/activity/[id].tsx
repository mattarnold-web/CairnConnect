import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Gauge,
  TrendingUp,
  TrendingDown,
  Mountain,
  Zap,
  Flame,
  FileDown,
  Share2,
  Trash2,
  Navigation,
  Image as ImageIcon,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { PhotoGallery } from '@/components/activity/PhotoGallery';
import { useActivityContext } from '@/lib/activity-context';
import { useFormat } from '@/lib/use-format';
import { shareGpx } from '@/lib/gpx-export';
import { formatDuration } from '@cairn/shared';
import { calcSpeed } from '@/lib/location';
import type { GpsPoint } from '@/lib/activity-types';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useActivityContext();
  const fmt = useFormat();

  const activity = state.activities.find((a) => a.id === id);

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-400 text-base mb-4">
            Activity not found
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  // Compute detailed stats
  const avgSpeed =
    activity.durationSeconds > 0
      ? activity.distanceMeters / activity.durationSeconds
      : 0;

  // Max speed from GPS track
  let maxSpeed = 0;
  if (activity.gpsTrack.length >= 2) {
    for (let i = 1; i < activity.gpsTrack.length; i++) {
      const speed = calcSpeed(activity.gpsTrack[i - 1], activity.gpsTrack[i]);
      if (speed > maxSpeed && speed < 100) {
        // Filter unrealistic speeds (>100 m/s)
        maxSpeed = speed;
      }
    }
  }

  // Calories estimate (rough: ~60 cal/km hiking, ~40 biking)
  const distKm = activity.distanceMeters / 1000;
  const calorieRate =
    activity.activityType === 'road_cycling' ||
    activity.activityType === 'mtb'
      ? 40
      : activity.activityType === 'trail_running'
        ? 70
        : 60;
  const estimatedCalories = Math.round(distKm * calorieRate);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShareGpx = () => {
    shareGpx(activity);
  };

  const handleShareText = async () => {
    const text = [
      activity.title,
      '',
      `Distance: ${fmt.distance(activity.distanceMeters)}`,
      `Duration: ${formatDuration(activity.durationSeconds)}`,
      `Avg Speed: ${fmt.speed(avgSpeed)}`,
      `Max Speed: ${fmt.speed(maxSpeed)}`,
      `Elevation Gain: ${fmt.elevation(activity.elevationGainMeters)}`,
      `Elevation Loss: ${fmt.elevation(activity.elevationLossMeters)}`,
      estimatedCalories > 0 ? `Calories: ~${estimatedCalories}` : '',
      '',
      `GPS Points: ${activity.gpsTrack.length}`,
      `Photos: ${activity.photos.length}`,
      '',
      'Recorded with Cairn Connect',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share({ message: text, title: activity.title });
    } catch {
      // User cancelled
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity?',
      'This will permanently delete this activity and all its data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_ACTIVITY', id: activity.id });
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-cairn-card items-center justify-center mr-3"
        >
          <ArrowLeft size={20} color="#e2e8f0" />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-slate-100 font-bold text-lg"
            numberOfLines={1}
          >
            {activity.title}
          </Text>
          <Text className="text-slate-500 text-xs">
            {new Date(activity.startedAt).toLocaleDateString()} at{' '}
            {new Date(activity.startedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <ActivityIcon activitySlug={activity.activityType} size="lg" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Duration hero */}
        <Card className="mb-4 items-center py-5">
          <Text className="text-slate-500 text-xs mb-1">Duration</Text>
          <Text className="text-slate-100 font-bold text-4xl font-mono">
            {formatTime(activity.durationSeconds)}
          </Text>
        </Card>

        {/* Primary stats */}
        <View className="flex-row gap-3 mb-3">
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MapPin size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs">Distance</Text>
            </View>
            <Text className="text-slate-100 font-bold text-xl">
              {fmt.distance(activity.distanceMeters)}
            </Text>
          </Card>
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Gauge size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs">Avg Speed</Text>
            </View>
            <Text className="text-slate-100 font-bold text-xl">
              {fmt.speed(avgSpeed)}
            </Text>
          </Card>
        </View>

        <View className="flex-row gap-3 mb-3">
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Zap size={12} color="#fbbf24" />
              <Text className="text-slate-500 text-xs">Max Speed</Text>
            </View>
            <Text className="text-amber-400 font-bold text-xl">
              {fmt.speed(maxSpeed)}
            </Text>
          </Card>
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Flame size={12} color="#f97316" />
              <Text className="text-slate-500 text-xs">Calories</Text>
            </View>
            <Text className="text-orange-400 font-bold text-xl">
              {estimatedCalories > 0 ? `~${estimatedCalories}` : '--'}
            </Text>
          </Card>
        </View>

        {/* Elevation stats */}
        <View className="flex-row gap-3 mb-3">
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <TrendingUp size={12} color="#10B981" />
              <Text className="text-slate-500 text-xs">Elev. Gain</Text>
            </View>
            <Text className="text-canopy font-bold text-xl">
              {fmt.elevation(activity.elevationGainMeters)}
            </Text>
          </Card>
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <TrendingDown size={12} color="#ef4444" />
              <Text className="text-slate-500 text-xs">Elev. Loss</Text>
            </View>
            <Text className="text-red-400 font-bold text-xl">
              {fmt.elevation(activity.elevationLossMeters)}
            </Text>
          </Card>
        </View>

        {/* Max/Min elevation */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Mountain size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs">Max Elevation</Text>
            </View>
            <Text className="text-slate-100 font-bold text-lg">
              {activity.maxElevationMeters != null
                ? fmt.elevation(activity.maxElevationMeters)
                : '--'}
            </Text>
          </Card>
          <Card className="flex-1">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Mountain size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs">Min Elevation</Text>
            </View>
            <Text className="text-slate-100 font-bold text-lg">
              {activity.minElevationMeters != null
                ? fmt.elevation(activity.minElevationMeters)
                : '--'}
            </Text>
          </Card>
        </View>

        {/* Route visualization */}
        {activity.gpsTrack.length > 1 && (
          <Card className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <Navigation size={12} color="#64748b" />
                <Text className="text-slate-400 text-sm font-medium">
                  Route
                </Text>
              </View>
              <Text className="text-slate-600 text-xs">
                {activity.gpsTrack.length} GPS points
              </Text>
            </View>
            <RouteVisualization points={activity.gpsTrack} />
          </Card>
        )}

        {/* Photos */}
        {activity.photos.length > 0 && (
          <View className="mb-4">
            <View className="flex-row items-center gap-1.5 mb-2">
              <ImageIcon size={14} color="#94a3b8" />
              <Text className="text-slate-400 text-sm font-medium">
                Photos ({activity.photos.length})
              </Text>
            </View>
            <PhotoGallery
              photoIds={activity.photos}
              showAddButton={false}
            />
          </View>
        )}

        {/* Notes */}
        {activity.notes ? (
          <Card className="mb-4">
            <Text className="text-slate-500 text-xs mb-1">Notes</Text>
            <Text className="text-slate-300 text-sm">{activity.notes}</Text>
          </Card>
        ) : null}

        {/* Action buttons */}
        <View className="gap-3 mb-8">
          <Button onPress={handleShareGpx} variant="secondary" size="lg">
            <View className="flex-row items-center gap-2">
              <FileDown size={18} color="#94a3b8" />
              <Text className="text-slate-300 font-semibold text-base">
                Export GPX
              </Text>
            </View>
          </Button>

          <Button onPress={handleShareText} variant="secondary" size="lg">
            <View className="flex-row items-center gap-2">
              <Share2 size={18} color="#94a3b8" />
              <Text className="text-slate-300 font-semibold text-base">
                Share Summary
              </Text>
            </View>
          </Button>

          <Button onPress={handleDelete} variant="destructive" size="lg">
            <View className="flex-row items-center gap-2">
              <Trash2 size={18} color="white" />
              <Text className="text-white font-semibold text-base">
                Delete Activity
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Route Visualization (waypoints on dark background) ─────────

function RouteVisualization({ points }: { points: GpsPoint[] }) {
  if (points.length < 2) return null;

  // Compute bounding box
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const pt of points) {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
  }

  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const padding = 16;
  const viewWidth = 320;
  const viewHeight = 160;

  // Map points to view coordinates
  const mapped = points.map((pt) => ({
    x: padding + ((pt.lng - minLng) / lngRange) * (viewWidth - padding * 2),
    y:
      padding +
      (1 - (pt.lat - minLat) / latRange) * (viewHeight - padding * 2),
  }));

  // Simplify by sampling
  const maxRenderPoints = 80;
  const step = Math.max(1, Math.floor(mapped.length / maxRenderPoints));
  const sampled = mapped.filter(
    (_, i) => i % step === 0 || i === mapped.length - 1,
  );

  return (
    <View
      className="bg-cairn-bg rounded-lg overflow-hidden"
      style={{ height: viewHeight }}
    >
      {/* Trail line segments */}
      {sampled.length > 1 &&
        sampled.slice(0, -1).map((pt, i) => {
          const next = sampled[i + 1];
          const dx = next.x - pt.x;
          const dy = next.y - pt.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <View
              key={`line-${i}`}
              className="absolute bg-canopy/50"
              style={{
                left: pt.x,
                top: pt.y - 0.75,
                width: length,
                height: 2,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}

      {/* Dots along the trail */}
      {sampled.map((pt, i) => (
        <View
          key={i}
          className={`absolute rounded-full ${
            i === 0
              ? 'bg-white border-2 border-canopy'
              : i === sampled.length - 1
                ? 'bg-canopy'
                : 'bg-canopy/60'
          }`}
          style={{
            left: pt.x - (i === 0 || i === sampled.length - 1 ? 4 : 1.5),
            top: pt.y - (i === 0 || i === sampled.length - 1 ? 4 : 1.5),
            width: i === 0 || i === sampled.length - 1 ? 8 : 3,
            height: i === 0 || i === sampled.length - 1 ? 8 : 3,
          }}
        />
      ))}

      {/* Start label */}
      {sampled.length > 0 && (
        <View
          className="absolute"
          style={{ left: sampled[0].x - 16, top: sampled[0].y + 6 }}
        >
          <Text className="text-canopy text-[9px] font-semibold">START</Text>
        </View>
      )}

      {/* End label */}
      {sampled.length > 1 && (
        <View
          className="absolute"
          style={{
            left: sampled[sampled.length - 1].x - 12,
            top: sampled[sampled.length - 1].y + 6,
          }}
        >
          <Text className="text-canopy text-[9px] font-semibold">END</Text>
        </View>
      )}
    </View>
  );
}
