import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Share2,
  Plus,
  Clock,
  TrendingUp,
  Ruler,
  Mountain,
  Play,
  ChevronRight,
  AlertTriangle,
  Navigation,
  Bookmark,
  User,
  Image as ImageIcon,
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { DifficultyBadge, ConditionBadge } from '@/components/ui/Badge';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BusinessCard } from '@/components/business/BusinessCard';
import { AccommodationLinks } from '@/components/ui/AccommodationLinks';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import {
  fetchTrailBySlug,
  fetchTrailReviews,
  fetchNearbyBusinessesForTrail,
} from '@/lib/api';
import type { Review } from '@/lib/api';
import type { Trail, Business } from '@cairn/shared';
import { useFormat, formatDurationMinutes } from '@/lib/use-format';
import { useTripContext } from '@/lib/trip-context';

const TRAIL_EMOJI_MAP: Record<string, string> = {
  mtb: '\u{1F6B5}',
  hiking: '\u{1F3D4}\uFE0F',
  trail_running: '\u{1F3C3}',
  climbing: '\u{1F9D7}',
};

const DIFFICULTY_COLOR_MAP: Record<string, string[]> = {
  green: ['#065F46', '#064E3B'],
  blue: ['#1E40AF', '#1E3A5F'],
  black: ['#1E293B', '#0F172A'],
  double_black: ['#0F172A', '#020617'],
  proline: ['#7F1D1D', '#450A0A'],
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Generate a plausible elevation profile curve from trail metadata */
function generateElevationProfile(
  gain: number,
  loss: number,
  minElev: number | null,
  maxElev: number | null,
  points: number = 40,
): number[] {
  const base = minElev ?? 1800;
  const peak = maxElev ?? base + gain;
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    // Smooth bell-like curve peaking at ~40% of the trail
    const envelope = Math.sin(t * Math.PI) * 0.8 + Math.sin(t * Math.PI * 0.4) * 0.2;
    const noise = Math.sin(t * 17) * 0.03 + Math.sin(t * 31) * 0.02;
    data.push(base + (peak - base) * (envelope + noise));
  }
  return data;
}

/** SVG-based elevation profile chart matching the mockup style */
function ElevationProfile({ trail }: { trail: Trail }) {
  const chartWidth = SCREEN_WIDTH - 32; // px-4 padding
  const chartHeight = 140;
  const padding = { top: 10, bottom: 20, left: 0, right: 0 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const data = generateElevationProfile(
    trail.elevation_gain_meters,
    trail.elevation_loss_meters,
    trail.min_elevation_meters,
    trail.max_elevation_meters,
  );

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((val, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - ((val - minVal) / range) * innerH;
    return { x, y };
  });

  const linePath =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map((p, i) => {
        const prev = points[i];
        const cx = (prev.x + p.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(' ');

  const fillPath =
    linePath +
    ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <View className="mb-4">
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <SvgLinearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#10B981" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#10B981" stopOpacity="0.02" />
          </SvgLinearGradient>
        </Defs>
        <Path d={fillPath} fill="url(#elevFill)" />
        <Path d={linePath} stroke="#10B981" strokeWidth={2} fill="none" />
        {/* Peak marker dot */}
        {(() => {
          const peakIdx = data.indexOf(maxVal);
          const p = points[peakIdx];
          return (
            <Path
              d={`M ${p.x - 3} ${p.y} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
              fill="#10B981"
            />
          );
        })()}
      </Svg>
    </View>
  );
}

/** Mock recent activity items for the trail */
const MOCK_RECENT_ACTIVITY = [
  { id: '1', user: 'User A', action: 'started this trail', time: '2h ago' },
  { id: '2', user: 'User B', action: 'shared photos from this trail', time: '5h ago' },
];

export default function TrailDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const fmt = useFormat();
  const { dispatch: tripDispatch } = useTripContext();

  const [trail, setTrail] = useState<Trail | null>(null);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<Business[]>([]);
  const [trailReviews, setTrailReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const trailData = await fetchTrailBySlug(slug);
        if (cancelled) return;
        setTrail(trailData);

        if (trailData) {
          const [reviews, businesses] = await Promise.all([
            fetchTrailReviews(trailData.id),
            fetchNearbyBusinessesForTrail(
              trailData.id,
              trailData.activity_types,
            ),
          ]);
          if (cancelled) return;
          setTrailReviews(reviews);
          setNearbyBusinesses(businesses);
        }
      } catch {
        // Errors are handled by the api layer fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        <View className="px-4 pt-4">
          <View className="flex-row items-center mb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-cairn-card items-center justify-center mr-3"
            >
              <ArrowLeft size={20} color="#e2e8f0" />
            </Pressable>
            <Skeleton width="60%" height={24} />
          </View>
          <Skeleton width="100%" height={200} borderRadius={16} className="mb-4" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
        </View>
      </SafeAreaView>
    );
  }

  if (!trail) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg items-center justify-center">
        <Text className="text-slate-400">Trail not found</Text>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    await Share.share({
      message: `Check out ${trail.name} on Cairn Connect!`,
    });
  };

  const handleAddToTrip = () => {
    tripDispatch({
      type: 'ADD_ITEM_TO_DAY',
      dayId: 'day-1',
      item: {
        id: `item-${Date.now()}`,
        type: 'trail',
        trailId: trail.id,
        customTitle: null,
        customActivityType: null,
        notes: '',
        timeSlot: 'morning',
      },
    });
  };

  const handleStartRecording = () => {
    router.push('/(tabs)/record');
  };

  const primaryEmoji =
    TRAIL_EMOJI_MAP[trail.activity_types[0]] ?? '\u26F0\uFE0F';
  const gradientColors =
    DIFFICULTY_COLOR_MAP[trail.difficulty] ?? ['#1E3A5F', '#0B1A2B'];

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover image area with gradient */}
        <View className="h-56 relative">
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: gradientColors[0],
            }}
          >
            {/* Decorative mountain shapes */}
            <View
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: 80,
                backgroundColor: gradientColors[1],
                borderTopLeftRadius: 200,
                borderTopRightRadius: 120,
              }}
            />
            <View
              className="absolute bottom-0 right-0"
              style={{
                width: '60%',
                height: 60,
                backgroundColor: gradientColors[0],
                borderTopLeftRadius: 150,
                opacity: 0.6,
              }}
            />
          </View>

          {/* Large emoji */}
          <View className="absolute inset-0 items-center justify-center">
            <Text style={{ fontSize: 64, opacity: 0.3 }}>{primaryEmoji}</Text>
          </View>

          {/* Bottom gradient overlay */}
          <View
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              backgroundColor: 'transparent',
            }}
          >
            <View
              className="absolute inset-0"
              style={{
                backgroundColor: '#0B1A2B',
                opacity: 0.8,
              }}
            />
          </View>

          {/* Header controls */}
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 py-3">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-black/40 items-center justify-center"
            >
              <ArrowLeft size={20} color="#e2e8f0" />
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="w-9 h-9 rounded-full bg-black/40 items-center justify-center"
            >
              <Share2 size={18} color="#e2e8f0" />
            </Pressable>
          </View>

          {/* Title overlay at bottom */}
          <View className="absolute bottom-3 left-4 right-4">
            <Text className="text-white font-bold text-2xl" numberOfLines={2}>
              {trail.name}
            </Text>
          </View>
        </View>

        <View className="px-4 pt-2">
          {/* Location */}
          {trail.city && (
            <View className="flex-row items-center mb-3">
              <MapPin size={14} color="#64748b" />
              <Text className="text-slate-500 text-sm ml-1">
                {trail.city}, {trail.state_province}, {trail.country}
              </Text>
            </View>
          )}

          {/* Badges row */}
          <View className="flex-row items-center gap-2 mb-4 flex-wrap">
            <DifficultyBadge difficulty={trail.difficulty} />
            <ConditionBadge condition={trail.current_condition} />
            <View className="flex-row items-center">
              <Star size={14} color="#F4A261" fill="#F4A261" />
              <Text className="text-slate-300 text-sm ml-1">
                {trail.rating.toFixed(1)} ({trail.review_count})
              </Text>
            </View>
          </View>

          {/* Elevation Profile Chart */}
          <ElevationProfile trail={trail} />

          {/* Stats row — 3 columns matching mockup */}
          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1 items-center py-3">
              <Ruler size={16} color="#10B981" />
              <Text className="text-slate-100 font-bold text-base mt-1">
                {fmt.distance(trail.distance_meters)}
              </Text>
              <Text className="text-slate-500 text-[10px] mt-0.5">Distance</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <TrendingUp size={16} color="#10B981" />
              <Text className="text-slate-100 font-bold text-base mt-1">
                {fmt.elevation(trail.elevation_gain_meters)}
              </Text>
              <Text className="text-slate-500 text-[10px] mt-0.5">Elevation Gain</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Mountain size={16} color="#10B981" />
              <Text className="text-slate-100 font-bold text-sm mt-1 capitalize">
                {trail.difficulty === 'green'
                  ? 'Easy'
                  : trail.difficulty === 'blue'
                    ? 'Moderate'
                    : trail.difficulty === 'black'
                      ? 'Hard'
                      : trail.difficulty === 'double_black'
                        ? 'Expert'
                        : trail.difficulty}
              </Text>
              <Text className="text-slate-500 text-[10px] mt-0.5">Difficulty</Text>
            </Card>
          </View>

          {/* Start Navigation button — prominent green CTA matching mockup */}
          <Pressable
            onPress={() => {
              const url = `https://maps.google.com/?q=${trail.lat},${trail.lng}`;
              Linking.openURL(url);
            }}
            className="bg-canopy rounded-xl py-4 mb-4 items-center"
          >
            <View className="flex-row items-center">
              <Navigation size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Start Navigation
              </Text>
            </View>
          </Pressable>

          {/* Save Trail / Share — two side-by-side outline buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable className="flex-1 flex-row items-center justify-center bg-cairn-card border border-cairn-border rounded-xl py-3">
              <Bookmark size={16} color="#10B981" />
              <Text className="text-canopy font-semibold text-sm ml-2">Save Trail</Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="flex-1 flex-row items-center justify-center bg-cairn-card border border-cairn-border rounded-xl py-3"
            >
              <Share2 size={16} color="#10B981" />
              <Text className="text-canopy font-semibold text-sm ml-2">Share</Text>
            </Pressable>
          </View>

          {/* Condition details */}
          {trail.current_condition === 'caution' && (
            <Card className="mb-4 border-amber-500/30">
              <View className="flex-row items-center">
                <AlertTriangle size={16} color="#F59E0B" />
                <Text className="text-amber-400 font-medium text-sm ml-2">
                  Trail Caution
                </Text>
              </View>
              <Text className="text-slate-400 text-xs mt-1">
                Current conditions may require extra care. Check recent reports before heading out.
              </Text>
            </Card>
          )}

          {/* Activity types */}
          <Text className="text-slate-100 font-semibold text-base mb-2">
            Activities
          </Text>
          <View className="flex-row items-center gap-3 mb-4 flex-wrap">
            {trail.activity_types.map((at) => (
              <View
                key={at}
                className="bg-cairn-card border border-cairn-border rounded-xl px-3 py-2 flex-row items-center"
              >
                <ActivityIcon activitySlug={at} size="sm" showLabel />
              </View>
            ))}
          </View>

          {/* Description */}
          {trail.description && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-base mb-2">
                About
              </Text>
              <Text className="text-slate-400 text-sm leading-6">
                {trail.description}
              </Text>
            </View>
          )}

          {/* Best seasons */}
          {trail.best_seasons && trail.best_seasons.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-base mb-2">
                Best Seasons
              </Text>
              <View className="flex-row gap-2">
                {trail.best_seasons.map((season) => (
                  <View
                    key={season}
                    className="bg-cairn-card border border-cairn-border rounded-lg px-3 py-1.5"
                  >
                    <Text className="text-slate-300 text-xs capitalize">
                      {season === 'spring'
                        ? '\u{1F331} Spring'
                        : season === 'summer'
                          ? '\u2600\uFE0F Summer'
                          : season === 'fall'
                            ? '\u{1F341} Fall'
                            : '\u2744\uFE0F Winter'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Permit alert */}
          {trail.requires_permit && (
            <Card className="mb-4 border-amber-500/30">
              <View className="flex-row items-center">
                <Text className="text-lg mr-2">{'\u{1F3AB}'}</Text>
                <View className="flex-1">
                  <Text className="text-amber-400 font-medium text-sm">
                    Permit Required
                  </Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    A permit is required to access this trail. Check local regulations.
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Recent Activity section matching mockup */}
          <View className="mb-4">
            <Text className="text-slate-100 font-semibold text-base mb-3">
              Recent Activity
            </Text>
            {MOCK_RECENT_ACTIVITY.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center py-2.5 border-b border-cairn-border/30"
              >
                <View className="w-8 h-8 rounded-full bg-cairn-elevated items-center justify-center mr-3">
                  {item.action.includes('photo') ? (
                    <ImageIcon size={14} color="#94a3b8" />
                  ) : (
                    <User size={14} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-slate-300 text-sm">
                    <Text className="font-semibold">{item.user}</Text> {item.action}
                  </Text>
                </View>
                <Text className="text-slate-600 text-xs">{item.time}</Text>
              </View>
            ))}
          </View>

          {/* Nearby businesses */}
          {nearbyBusinesses.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-lg mb-3">
                Nearby Businesses
              </Text>
              {nearbyBusinesses.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  onPress={() =>
                    router.push(`/(tabs)/explore/business/${biz.slug}`)
                  }
                />
              ))}
            </View>
          )}

          {/* Accommodation Links */}
          <View className="mb-4">
            <AccommodationLinks
              locationName={
                trail.city
                  ? `${trail.city}, ${trail.state_province ?? ''}`
                  : trail.name
              }
              lat={trail.lat}
              lng={trail.lng}
              compact
            />
          </View>

          {/* Reviews */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-100 font-semibold text-lg">
                Reviews ({trailReviews.length})
              </Text>
              {trail.review_count > 0 && (
                <View className="flex-row items-center">
                  <Star size={14} color="#F4A261" fill="#F4A261" />
                  <Text className="text-slate-300 text-sm ml-1 font-medium">
                    {trail.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {trailReviews.length > 0 ? (
              trailReviews.slice(0, 3).map((review) => (
                <Card key={review.id} className="mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-cairn-elevated items-center justify-center mr-2">
                        <Text className="text-slate-300 text-xs font-semibold">
                          {review.author_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-slate-200 text-sm font-medium">
                          {review.author_name}
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              color="#F4A261"
                              fill={i < review.rating ? '#F4A261' : 'transparent'}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                  {review.title && (
                    <Text className="text-slate-200 font-medium text-sm mb-1">
                      {review.title}
                    </Text>
                  )}
                  {review.body && (
                    <Text className="text-slate-400 text-sm leading-5">
                      {review.body}
                    </Text>
                  )}
                </Card>
              ))
            ) : (
              <Card className="mb-3">
                <Text className="text-slate-500 text-sm text-center py-2">
                  No reviews yet. Be the first to review this trail!
                </Text>
              </Card>
            )}
          </View>

          {/* Bottom spacer for floating button */}
          <View className="h-28" />
        </View>
      </ScrollView>

      {/* Bottom floating action bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-cairn-bg/95 border-t border-cairn-border px-4 pt-3 pb-8">
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleStartRecording}
            className="flex-1 bg-cairn-card border border-cairn-border rounded-xl py-3.5 items-center flex-row justify-center"
          >
            <Play size={16} color="#10B981" />
            <Text className="text-canopy font-semibold text-sm ml-2">Record</Text>
          </Pressable>
          <Pressable
            onPress={handleAddToTrip}
            className="flex-[2] bg-canopy rounded-xl py-3.5 items-center flex-row justify-center"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-bold text-sm ml-2">Add to Trip</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
