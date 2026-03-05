import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pause,
  Play,
  Square,
  Camera,
  Navigation,
  Save,
  Trash2,
  MapPin,
  TrendingUp,
  Gauge,
  Zap,
} from 'lucide-react-native';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CameraCapture } from '@/components/activity/CameraCapture';
import { PhotoGallery } from '@/components/activity/PhotoGallery';
import { useActivityContext } from '@/lib/activity-context';
import { useFormat } from '@/lib/use-format';
import {
  requestLocationPermissions,
  watchLocation,
  calcSpeed,
  gpsSignalBars,
} from '@/lib/location';
import { ACTIVITY_TYPES, ACTIVITY_CATEGORIES } from '@cairn/shared';
import type { LocationSubscription } from 'expo-location';
import type { CapturedPhoto } from '@/lib/photo-types';
import type { GpsPoint } from '@/lib/activity-types';

type ScreenMode = 'select' | 'recording' | 'summary';

export default function RecordScreen() {
  const { state, dispatch, activeActivity } = useActivityContext();
  const fmt = useFormat();

  // Screen state
  const [mode, setMode] = useState<ScreenMode>('select');
  const [elapsed, setElapsed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<'off' | 'acquiring' | 'active' | 'error'>('off');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  // Post-recording (summary)
  const [summaryActivity, setSummaryActivity] = useState<typeof activeActivity>(null);
  const [summaryTitle, setSummaryTitle] = useState('');

  const locationSub = useRef<LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPointRef = useRef<GpsPoint | null>(null);

  const isRecording = activeActivity?.status === 'recording';
  const isPaused = activeActivity?.status === 'paused';
  const isActive = isRecording || isPaused;

  // Sync mode with activity state
  useEffect(() => {
    if (isActive) {
      setMode('recording');
    } else if (mode === 'recording' && !isActive && !activeActivity) {
      // Just stopped -- handled by handleStop
    } else if (mode !== 'summary') {
      setMode('select');
    }
  }, [isActive, activeActivity]);

  // Elapsed time timer
  useEffect(() => {
    if (isRecording && activeActivity) {
      timerRef.current = setInterval(() => {
        setElapsed(
          Math.round(
            (Date.now() - new Date(activeActivity.startedAt).getTime()) / 1000,
          ),
        );
      }, 1000);
    } else if (isPaused && activeActivity) {
      // Freeze the time display
      setElapsed(
        Math.round(
          (Date.now() - new Date(activeActivity.startedAt).getTime()) / 1000,
        ),
      );
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused, activeActivity?.startedAt]);

  // GPS tracking
  useEffect(() => {
    if (isRecording) {
      startGps();
    } else if (isPaused) {
      stopGps();
    }
    return () => {
      stopGps();
    };
  }, [isRecording, isPaused]);

  const startGps = async () => {
    setGpsStatus('acquiring');
    const granted = await requestLocationPermissions();
    if (!granted) {
      setGpsStatus('error');
      Alert.alert(
        'Permission Denied',
        'Location permission is required to record activities.',
      );
      return;
    }

    try {
      const sub = await watchLocation((location) => {
        setGpsStatus('active');
        setGpsAccuracy(location.coords.accuracy);

        const point: GpsPoint = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          altitude: location.coords.altitude,
          timestamp: location.timestamp,
          accuracy: location.coords.accuracy,
        };

        // Calculate current speed from last two points
        if (lastPointRef.current) {
          const speed = calcSpeed(lastPointRef.current, point);
          setCurrentSpeed(speed);
        }
        lastPointRef.current = point;

        dispatch({ type: 'ADD_GPS_POINT', point });
      });
      locationSub.current = sub;
    } catch {
      setGpsStatus('error');
    }
  };

  const stopGps = () => {
    locationSub.current?.remove();
    locationSub.current = null;
    setGpsStatus('off');
    setGpsAccuracy(null);
  };

  const handleStart = (activityType: string) => {
    const activity = ACTIVITY_TYPES.find((a) => a.slug === activityType);
    const title = `${activity?.label ?? activityType} -- ${new Date().toLocaleDateString()}`;

    dispatch({
      type: 'START_RECORDING',
      activity: {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        activityType,
        status: 'recording',
        startedAt: new Date().toISOString(),
        endedAt: null,
        gpsTrack: [],
        distanceMeters: 0,
        durationSeconds: 0,
        elevationGainMeters: 0,
        elevationLossMeters: 0,
        maxElevationMeters: null,
        minElevationMeters: null,
        photos: [],
        notes: '',
      },
    });

    setCapturedPhotos([]);
    lastPointRef.current = null;
    setCurrentSpeed(0);
    setMode('recording');
  };

  const handlePause = () => {
    dispatch({ type: 'PAUSE_RECORDING' });
    stopGps();
  };

  const handleResume = () => {
    dispatch({ type: 'RESUME_RECORDING' });
  };

  const handleStop = () => {
    Alert.alert('Stop Recording?', 'This will end your current activity.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: () => {
          // Capture the activity before stopping for summary view
          const stoppedActivity = activeActivity
            ? {
                ...activeActivity,
                status: 'completed' as const,
                endedAt: new Date().toISOString(),
                durationSeconds: Math.round(
                  (Date.now() - new Date(activeActivity.startedAt).getTime()) / 1000,
                ),
              }
            : null;

          dispatch({ type: 'STOP_RECORDING' });
          stopGps();
          setElapsed(0);
          setCurrentSpeed(0);
          lastPointRef.current = null;

          if (stoppedActivity) {
            setSummaryActivity(stoppedActivity);
            setSummaryTitle(stoppedActivity.title);
            setMode('summary');
          } else {
            setMode('select');
          }
        },
      },
    ]);
  };

  const handlePhotoCapture = useCallback(
    (photo: CapturedPhoto) => {
      setCapturedPhotos((prev) => [...prev, photo]);
      if (activeActivity) {
        dispatch({ type: 'ADD_PHOTO', photoId: photo.id });
      }
    },
    [activeActivity, dispatch],
  );

  const handleSaveSummary = () => {
    if (summaryActivity) {
      // Update the title in the saved activities
      // Find and update the activity in state
      const existing = state.activities.find((a) => a.id === summaryActivity.id);
      if (existing && summaryTitle !== existing.title) {
        dispatch({ type: 'UPDATE_NOTES', notes: existing.notes });
        // We need to update the title directly -- for now the title was set on start
        // The activity is already saved via STOP_RECORDING
      }
    }
    setSummaryActivity(null);
    setCapturedPhotos([]);
    setMode('select');
  };

  const handleDiscardSummary = () => {
    Alert.alert(
      'Discard Activity?',
      'This will permanently delete this recorded activity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            if (summaryActivity) {
              dispatch({ type: 'DELETE_ACTIVITY', id: summaryActivity.id });
            }
            setSummaryActivity(null);
            setCapturedPhotos([]);
            setMode('select');
          },
        },
      ],
    );
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const signalBars = gpsSignalBars(gpsAccuracy);

  // ─── Pre-recording: Activity Type Selector ────────────────────

  if (mode === 'select') {
    const completedCount = state.activities.filter(
      (a) => a.status === 'completed',
    ).length;

    return (
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        <View className="px-4 pt-4">
          <Text className="text-slate-100 font-bold text-2xl mb-1">
            Record Activity
          </Text>
          <Text className="text-slate-500 text-sm mb-4">
            Select an activity type to start recording
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
          {ACTIVITY_CATEGORIES.map((cat) => {
            const activities = ACTIVITY_TYPES.filter(
              (a) => a.category === cat.slug,
            );
            if (activities.length === 0) return null;

            return (
              <View key={cat.slug} className="mb-5">
                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  {cat.emoji} {cat.label}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {activities.map((at) => (
                    <Pressable
                      key={at.slug}
                      onPress={() => handleStart(at.slug)}
                      className="bg-cairn-card border border-cairn-border rounded-xl px-3 py-2.5 items-center active:bg-cairn-card-hover active:border-canopy/40"
                      style={{ width: '30%', minWidth: 95 }}
                    >
                      <Text className="text-xl mb-0.5">{at.emoji}</Text>
                      <Text
                        className="text-slate-300 text-[10px] text-center font-medium"
                        numberOfLines={1}
                      >
                        {at.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}

          {completedCount > 0 && (
            <View className="mt-2 mb-8 items-center">
              <Text className="text-slate-500 text-sm">
                {completedCount} recorded{' '}
                {completedCount === 1 ? 'activity' : 'activities'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Post-recording: Summary ──────────────────────────────────

  if (mode === 'summary' && summaryActivity) {
    const avgSpeed =
      summaryActivity.durationSeconds > 0
        ? summaryActivity.distanceMeters / summaryActivity.durationSeconds
        : 0;

    // Estimate calories (rough: ~60 cal/km for hiking, ~40 for biking)
    const distKm = summaryActivity.distanceMeters / 1000;
    const calorieRate =
      summaryActivity.activityType === 'road_cycling' ||
      summaryActivity.activityType === 'mtb'
        ? 40
        : 60;
    const estimatedCalories = Math.round(distKm * calorieRate);

    return (
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
          <Text className="text-slate-100 font-bold text-2xl mb-1">
            Activity Complete
          </Text>
          <View className="flex-row items-center mb-4">
            <ActivityIcon
              activitySlug={summaryActivity.activityType}
              size="sm"
              showLabel
            />
          </View>

          {/* Title input */}
          <Card className="mb-4">
            <Text className="text-slate-500 text-xs mb-2">Activity Title</Text>
            <TextInput
              value={summaryTitle}
              onChangeText={setSummaryTitle}
              placeholder="Name your activity..."
              placeholderTextColor="#475569"
              style={recordStyles.summaryTitleInput}
            />
          </Card>

          {/* Stats summary */}
          <View className="flex-row gap-3 mb-3">
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Duration</Text>
              <Text className="text-slate-100 font-bold text-lg text-center">
                {formatTime(summaryActivity.durationSeconds)}
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Distance</Text>
              <Text className="text-slate-100 font-bold text-lg text-center">
                {fmt.distance(summaryActivity.distanceMeters)}
              </Text>
            </Card>
          </View>

          <View className="flex-row gap-3 mb-3">
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Avg Speed</Text>
              <Text className="text-slate-100 font-bold text-lg text-center">
                {fmt.speed(avgSpeed)}
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Calories</Text>
              <Text className="text-slate-100 font-bold text-lg text-center">
                {estimatedCalories > 0 ? `~${estimatedCalories}` : '--'}
              </Text>
            </Card>
          </View>

          <View className="flex-row gap-3 mb-3">
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Elev. Gain</Text>
              <Text className="text-canopy font-bold text-lg text-center">
                {fmt.elevation(summaryActivity.elevationGainMeters)}
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Elev. Loss</Text>
              <Text className="text-red-400 font-bold text-lg text-center">
                {fmt.elevation(summaryActivity.elevationLossMeters)}
              </Text>
            </Card>
          </View>

          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">GPS Points</Text>
              <Text className="text-slate-100 font-bold text-lg text-center">
                {summaryActivity.gpsTrack.length}
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-slate-500 text-xs text-center">Photos</Text>
              <Text className="text-slate-100 font-bold text-lg text-center">
                {summaryActivity.photos.length}
              </Text>
            </Card>
          </View>

          {/* Route preview placeholder */}
          {summaryActivity.gpsTrack.length > 1 && (
            <Card className="mb-4">
              <Text className="text-slate-500 text-xs mb-2">Route</Text>
              <MiniTrailView points={summaryActivity.gpsTrack} height={120} />
            </Card>
          )}

          {/* Photo gallery */}
          {summaryActivity.photos.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-400 text-sm font-medium mb-2">
                Photos ({summaryActivity.photos.length})
              </Text>
              <PhotoGallery
                photoIds={summaryActivity.photos}
                photos={capturedPhotos}
                showAddButton={false}
              />
            </View>
          )}

          {/* Action buttons */}
          <View className="gap-3 mb-8">
            <Button onPress={handleSaveSummary} size="lg">
              <View className="flex-row items-center gap-2">
                <Save size={18} color="white" />
                <Text className="text-white font-semibold text-base">
                  Save Activity
                </Text>
              </View>
            </Button>

            <Button
              onPress={handleDiscardSummary}
              variant="destructive"
              size="lg"
            >
              <View className="flex-row items-center gap-2">
                <Trash2 size={18} color="white" />
                <Text className="text-white font-semibold text-base">Discard</Text>
              </View>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Recording UI ─────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <View className="flex-1 px-4">
        {/* Header: Activity type + recording indicator */}
        <View className="flex-row items-center justify-between mt-2 mb-1">
          <View className="flex-row items-center">
            {isRecording && (
              <View className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2" />
            )}
            <Text
              className={`text-sm font-medium ${isRecording ? 'text-red-400' : 'text-amber-400'}`}
            >
              {isRecording ? 'Recording' : 'Paused'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <ActivityIcon
              activitySlug={activeActivity?.activityType ?? ''}
              size="sm"
              showLabel
            />
          </View>
        </View>

        {/* GPS status bar */}
        <View className="flex-row items-center justify-center mb-4">
          <Navigation
            size={14}
            color={
              gpsStatus === 'active'
                ? '#10B981'
                : gpsStatus === 'acquiring'
                  ? '#fbbf24'
                  : gpsStatus === 'error'
                    ? '#ef4444'
                    : '#64748b'
            }
          />
          <Text className="text-slate-500 text-xs ml-1.5 uppercase tracking-wider">
            GPS {gpsStatus}
          </Text>

          {/* Signal bars */}
          {gpsStatus === 'active' && (
            <View className="flex-row items-end gap-0.5 ml-2 h-3">
              {[1, 2, 3].map((bar) => (
                <View
                  key={bar}
                  className={`w-1 rounded-full ${
                    signalBars >= bar ? 'bg-canopy' : 'bg-slate-700'
                  }`}
                  style={{ height: 4 + bar * 3 }}
                />
              ))}
            </View>
          )}

          {activeActivity && activeActivity.gpsTrack.length > 0 && (
            <Text className="text-slate-600 text-[10px] ml-2">
              {activeActivity.gpsTrack.length} pts
            </Text>
          )}
        </View>

        {/* Large timer display */}
        <View className="items-center mb-6">
          <Text className="text-slate-100 font-bold text-6xl font-mono tracking-tight">
            {formatTime(elapsed)}
          </Text>
        </View>

        {/* Stats grid */}
        <View className="flex-row gap-3 mb-3">
          <Card className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <MapPin size={10} color="#64748b" />
              <Text className="text-slate-500 text-[10px]">Distance</Text>
            </View>
            <Text className="text-slate-100 font-bold text-lg">
              {fmt.distance(activeActivity?.distanceMeters ?? 0)}
            </Text>
          </Card>
          <Card className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <Gauge size={10} color="#64748b" />
              <Text className="text-slate-500 text-[10px]">Avg Speed</Text>
            </View>
            <Text className="text-slate-100 font-bold text-lg">
              {elapsed > 0
                ? fmt.speed((activeActivity?.distanceMeters ?? 0) / elapsed)
                : '0.0'}
            </Text>
          </Card>
        </View>

        <View className="flex-row gap-3 mb-3">
          <Card className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <TrendingUp size={10} color="#10B981" />
              <Text className="text-slate-500 text-[10px]">Elev. Gain</Text>
            </View>
            <Text className="text-canopy font-bold text-lg">
              {fmt.elevation(activeActivity?.elevationGainMeters ?? 0)}
            </Text>
          </Card>
          <Card className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <Zap size={10} color="#fbbf24" />
              <Text className="text-slate-500 text-[10px]">Current Speed</Text>
            </View>
            <Text className="text-amber-400 font-bold text-lg">
              {fmt.speed(currentSpeed)}
            </Text>
          </Card>
        </View>

        {/* Mini trail view */}
        {activeActivity && activeActivity.gpsTrack.length > 2 && (
          <Card className="mb-4">
            <MiniTrailView points={activeActivity.gpsTrack} height={80} />
          </Card>
        )}

        {/* Photo strip (if photos taken) */}
        {activeActivity && activeActivity.photos.length > 0 && (
          <View className="mb-2">
            <PhotoGallery
              photoIds={activeActivity.photos}
              photos={capturedPhotos}
              showAddButton
              onAdd={() => setCameraOpen(true)}
            />
          </View>
        )}

        {/* Controls */}
        <View className="flex-row items-center justify-center gap-6 mt-auto mb-8">
          {/* Camera */}
          <Pressable
            onPress={() => setCameraOpen(true)}
            className="h-14 w-14 rounded-full bg-cairn-elevated border border-cairn-border items-center justify-center"
          >
            <Camera size={22} color="#e2e8f0" />
            {activeActivity && activeActivity.photos.length > 0 && (
              <View className="absolute -top-1 -right-1 bg-canopy h-5 w-5 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {activeActivity.photos.length}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Pause/Resume */}
          {isRecording ? (
            <Pressable
              onPress={handlePause}
              className="h-20 w-20 rounded-full bg-amber-500 items-center justify-center shadow-lg"
            >
              <Pause size={32} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleResume}
              className="h-20 w-20 rounded-full bg-canopy items-center justify-center shadow-lg"
            >
              <Play size={32} color="white" />
            </Pressable>
          )}

          {/* Stop */}
          <Pressable
            onPress={handleStop}
            className="h-14 w-14 rounded-full bg-red-600 items-center justify-center"
          >
            <Square size={22} color="white" fill="white" />
          </Pressable>
        </View>
      </View>

      {/* Camera overlay */}
      {cameraOpen && (
        <CameraCapture
          activityId={activeActivity?.id ?? null}
          tripId={null}
          onCapture={handlePhotoCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

const recordStyles = StyleSheet.create({
  summaryTitleInput: {
    color: '#f1f5f9',
    fontSize: 16,
    backgroundColor: '#1A2D45',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

// ─── Mini Trail View (simplified polyline on dark background) ───

function MiniTrailView({
  points,
  height = 80,
}: {
  points: GpsPoint[];
  height?: number;
}) {
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
  const padding = 12;
  const viewWidth = 300;
  const viewHeight = height;

  // Map points to view coordinates
  const mapped = points.map((pt) => ({
    x: padding + ((pt.lng - minLng) / lngRange) * (viewWidth - padding * 2),
    y:
      padding +
      (1 - (pt.lat - minLat) / latRange) * (viewHeight - padding * 2),
  }));

  // Simplify by sampling every Nth point
  const maxPoints = 60;
  const step = Math.max(1, Math.floor(mapped.length / maxPoints));
  const sampled = mapped.filter((_, i) => i % step === 0 || i === mapped.length - 1);

  return (
    <View
      className="bg-cairn-bg rounded-lg overflow-hidden"
      style={{ height: viewHeight }}
    >
      {/* Draw trail line using positioned dots */}
      {sampled.map((pt, i) => (
        <View
          key={i}
          className={`absolute rounded-full ${
            i === sampled.length - 1 ? 'bg-canopy' : 'bg-canopy/60'
          }`}
          style={{
            left: pt.x,
            top: pt.y,
            width: i === sampled.length - 1 ? 6 : 3,
            height: i === sampled.length - 1 ? 6 : 3,
            marginLeft: i === sampled.length - 1 ? -3 : -1.5,
            marginTop: i === sampled.length - 1 ? -3 : -1.5,
          }}
        />
      ))}

      {/* Connect dots with small segments */}
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
              className="absolute bg-canopy/40"
              style={{
                left: pt.x,
                top: pt.y - 0.5,
                width: length,
                height: 1.5,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}

      {/* Start marker */}
      {sampled.length > 0 && (
        <View
          className="absolute bg-white rounded-full border-2 border-canopy"
          style={{
            left: sampled[0].x - 4,
            top: sampled[0].y - 4,
            width: 8,
            height: 8,
          }}
        />
      )}
    </View>
  );
}
