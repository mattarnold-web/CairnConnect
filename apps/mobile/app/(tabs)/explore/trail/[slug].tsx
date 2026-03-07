import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator } from 'react-native';
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
} from 'lucide-react-native';
import { DifficultyBadge, ConditionBadge } from '@/components/ui/Badge';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BusinessCard } from '@/components/business/BusinessCard';
import { AccommodationLinks } from '@/components/ui/AccommodationLinks';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { WriteReviewSheet } from '@/components/reviews/WriteReviewSheet';
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

export default function TrailDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const fmt = useFormat();
  const { dispatch: tripDispatch } = useTripContext();

  const [trail, setTrail] = useState<Trail | null>(null);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<Business[]>([]);
  const [trailReviews, setTrailReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);

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
      <SafeAreaView className="flex-1 bg-cairn-bg items-center justify-center" edges={['top']}>
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

          {/* Stats grid */}
          <Card className="mb-4">
            <View className="flex-row flex-wrap">
              {/* Distance */}
              <View className="w-1/2 items-center pb-3">
                <View className="flex-row items-center mb-1">
                  <Ruler size={14} color="#10B981" />
                  <Text className="text-slate-500 text-xs ml-1">Distance</Text>
                </View>
                <Text className="text-slate-100 font-bold text-lg">
                  {fmt.distance(trail.distance_meters)}
                </Text>
              </View>

              {/* Elevation */}
              <View className="w-1/2 items-center pb-3">
                <View className="flex-row items-center mb-1">
                  <TrendingUp size={14} color="#10B981" />
                  <Text className="text-slate-500 text-xs ml-1">Elevation Gain</Text>
                </View>
                <Text className="text-slate-100 font-bold text-lg">
                  {fmt.elevation(trail.elevation_gain_meters)}
                </Text>
              </View>

              {/* Duration */}
              <View className="w-1/2 items-center pt-3 border-t border-cairn-border/50">
                <View className="flex-row items-center mb-1">
                  <Clock size={14} color="#10B981" />
                  <Text className="text-slate-500 text-xs ml-1">Est. Duration</Text>
                </View>
                <Text className="text-slate-100 font-bold text-lg">
                  {(trail as any).estimated_duration_minutes
                    ? formatDurationMinutes((trail as any).estimated_duration_minutes)
                    : '--'}
                </Text>
              </View>

              {/* Trail type */}
              <View className="w-1/2 items-center pt-3 border-t border-cairn-border/50">
                <View className="flex-row items-center mb-1">
                  <Mountain size={14} color="#10B981" />
                  <Text className="text-slate-500 text-xs ml-1">Type</Text>
                </View>
                <Text className="text-slate-100 font-bold text-sm capitalize">
                  {trail.trail_type.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          </Card>

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

          {/* Start Recording button */}
          <Pressable
            onPress={handleStartRecording}
            className="bg-cairn-card border border-canopy/40 rounded-xl p-4 mb-4 flex-row items-center"
          >
            <View className="w-10 h-10 rounded-full bg-canopy/20 items-center justify-center mr-3">
              <Play size={18} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-semibold text-sm">
                Start Recording
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Track your activity on this trail
              </Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </Pressable>

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
              <Pressable
                onPress={() => setWriteReviewVisible(true)}
                className="bg-canopy/15 border border-canopy/30 rounded-lg px-3 py-1.5"
              >
                <Text className="text-canopy text-xs font-semibold">
                  Write Review
                </Text>
              </Pressable>
            </View>

            {/* Summary with breakdown bars */}
            {trail.review_count > 0 && (
              <ReviewSummary
                rating={trail.rating}
                reviewCount={trail.review_count}
                reviews={trailReviews}
              />
            )}

            {/* Individual reviews */}
            {trailReviews.length > 0 ? (
              trailReviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <Card className="mb-3">
                <View className="items-center py-4">
                  <Star size={24} color="#F4A261" />
                  <Text className="text-slate-100 font-medium text-sm mt-2">
                    No reviews yet
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    Be the first to share your experience!
                  </Text>
                </View>
              </Card>
            )}

            {/* Write Review button */}
            <Pressable
              onPress={() => setShowWriteReview(true)}
              className="bg-canopy/10 border border-canopy/30 rounded-xl py-3 items-center mb-2"
            >
              <Text className="text-canopy font-semibold text-sm">Write a Review</Text>
            </Pressable>
          </View>

          {/* Bottom spacer for floating button */}
          <View className="h-28" />
        </View>
      </ScrollView>

      {/* Bottom floating action buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-cairn-bg/95 border-t border-cairn-border px-4 pt-3 pb-8">
        <View className="flex-row gap-3">
          <Button
            onPress={handleStartRecording}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            <View className="flex-row items-center justify-center">
              <Play size={16} color="#10B981" />
              <Text className="text-canopy font-semibold text-sm ml-2">
                Record
              </Text>
            </View>
          </Button>
          <Button onPress={handleAddToTrip} size="lg" className="flex-[2]">
            <View className="flex-row items-center justify-center">
              <Plus size={18} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Add to Trip
              </Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Write Review Sheet */}
      {trail && (
        <WriteReviewSheet
          entityType="trail"
          entityId={trail.id}
          entityName={trail.name}
          visible={showWriteReview}
          onClose={() => setShowWriteReview(false)}
          onSubmitted={async () => {
            const reviews = await fetchTrailReviews(trail.id);
            setTrailReviews(reviews);
          }}
        />
      )}
    </SafeAreaView>
  );
}
