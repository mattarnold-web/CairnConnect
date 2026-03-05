import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Share2,
  Clock,
  DollarSign,
  ExternalLink,
  Instagram,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { SpotlightBadge } from '@/components/ui/SpotlightBadge';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { TrailCard } from '@/components/trail/TrailCard';
import { AccommodationLinks } from '@/components/ui/AccommodationLinks';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import {
  fetchBusinessBySlug,
  fetchBusinessReviews,
  fetchTrails,
} from '@/lib/api';
import type { Review } from '@/lib/api';
import { BUSINESS_CATEGORIES } from '@cairn/shared';
import type { Business, Trail } from '@cairn/shared';

const CATEGORY_GRADIENT_MAP: Record<string, string> = {
  bike_shop: '#92400E',
  gear_rental: '#78350F',
  guide_service: '#312E81',
  outfitter: '#134E4A',
  outdoor_gear_shop: '#365314',
  bike_shuttle: '#4C1D95',
  kayak_sup: '#164E63',
  trailhead_cafe: '#881337',
  adventure_hostel: '#831843',
  camping: '#14532D',
};

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedTrails, setRelatedTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const bizData = await fetchBusinessBySlug(slug);
        if (cancelled) return;
        setBusiness(bizData);

        if (bizData) {
          const [reviewData, trailData] = await Promise.all([
            fetchBusinessReviews(bizData.id),
            fetchTrails({
              activityTypes: bizData.activity_types,
              limit: 3,
            }),
          ]);
          if (cancelled) return;
          setReviews(reviewData);
          setRelatedTrails(trailData);
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

  if (!business) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg items-center justify-center">
        <Text className="text-slate-400">Business not found</Text>
      </SafeAreaView>
    );
  }

  const categoryInfo = BUSINESS_CATEGORIES.find((c) => c.value === business.category);

  const handleShare = async () => {
    await Share.share({
      message: `Check out ${business.name} on Cairn Connect!`,
    });
  };

  const coverColor = CATEGORY_GRADIENT_MAP[business.category] ?? '#1E3A5F';

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover image placeholder with gradient */}
        <View className="h-52 relative">
          <View
            className="absolute inset-0"
            style={{ backgroundColor: coverColor }}
          >
            {/* Decorative shapes */}
            <View
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: 70,
                backgroundColor: '#0B1A2B',
                borderTopLeftRadius: 160,
                borderTopRightRadius: 80,
                opacity: 0.7,
              }}
            />
          </View>

          {/* Category emoji */}
          <View className="absolute inset-0 items-center justify-center">
            <Text style={{ fontSize: 64, opacity: 0.25 }}>
              {categoryInfo?.icon ?? '\u{1F4CD}'}
            </Text>
          </View>

          {/* Spotlight shimmer effect */}
          {business.is_spotlight && (
            <View
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: '#F4A261' }}
            />
          )}

          {/* Bottom gradient overlay */}
          <View
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{ backgroundColor: 'transparent' }}
          >
            <View
              className="absolute inset-0"
              style={{ backgroundColor: '#0B1A2B', opacity: 0.85 }}
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
            <View className="flex-row items-center gap-2 mb-1">
              <Text
                className="text-white font-bold text-2xl flex-1"
                numberOfLines={2}
              >
                {business.name}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 pt-2">
          {/* Spotlight badge + category */}
          <View className="flex-row items-center gap-2 mb-2">
            {business.is_spotlight && (
              <SpotlightBadge tier={business.spotlight_tier} />
            )}
            <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-full px-2.5 py-1">
              <Text className="text-sm mr-1">{categoryInfo?.icon}</Text>
              <Text className="text-slate-400 text-xs">
                {categoryInfo?.label ?? business.category}
              </Text>
            </View>
          </View>

          {/* Location */}
          {business.city && (
            <View className="flex-row items-center mb-2">
              <MapPin size={14} color="#64748b" />
              <Text className="text-slate-500 text-sm ml-1">
                {business.address ?? `${business.city}, ${business.state_province}`}
              </Text>
            </View>
          )}

          {/* Rating */}
          <View className="flex-row items-center gap-1 mb-4">
            <Star size={14} color="#F4A261" fill="#F4A261" />
            <Text className="text-slate-300 text-sm">
              {business.rating.toFixed(1)} ({business.review_count} reviews)
            </Text>
            {(business as any).price_range && (
              <>
                <Text className="text-slate-600 mx-1">|</Text>
                <DollarSign size={12} color="#64748b" />
                <Text className="text-slate-500 text-xs">
                  ${(business as any).price_range.min} - ${(business as any).price_range.max}
                </Text>
              </>
            )}
          </View>

          {/* Special offer */}
          {business.special_offer && (
            <Card className="mb-4 border-spotlight-gold/30 bg-spotlight-gold/5">
              <View className="flex-row items-start">
                <Text className="text-xl mr-2">{'\u2728'}</Text>
                <View className="flex-1">
                  <Text className="text-spotlight-gold font-semibold text-sm mb-0.5">
                    Special Offer
                  </Text>
                  <Text className="text-slate-300 text-sm">
                    {business.special_offer}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Action buttons — matching mockup with Website, Directions, Call, Instagram */}
          <View className="flex-row gap-2 mb-4">
            {business.website_url && (
              <Pressable
                onPress={() => Linking.openURL(business.website_url!)}
                className="flex-1 bg-cairn-card border border-cairn-border rounded-xl py-3 items-center active:bg-cairn-card-hover"
              >
                <View className="w-10 h-10 rounded-full bg-canopy/15 items-center justify-center mb-1">
                  <Globe size={18} color="#10B981" />
                </View>
                <Text className="text-slate-300 text-[10px] font-medium">Website</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() =>
                Linking.openURL(
                  business.google_maps_url ??
                    `https://maps.google.com/?q=${encodeURIComponent(business.name)}`,
                )
              }
              className="flex-1 bg-cairn-card border border-cairn-border rounded-xl py-3 items-center active:bg-cairn-card-hover"
            >
              <View className="w-10 h-10 rounded-full bg-canopy/15 items-center justify-center mb-1">
                <Navigation size={18} color="#10B981" />
              </View>
              <Text className="text-slate-300 text-[10px] font-medium">Directions</Text>
            </Pressable>
            {business.phone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${business.phone}`)}
                className="flex-1 bg-cairn-card border border-cairn-border rounded-xl py-3 items-center active:bg-cairn-card-hover"
              >
                <View className="w-10 h-10 rounded-full bg-canopy/15 items-center justify-center mb-1">
                  <Phone size={18} color="#10B981" />
                </View>
                <Text className="text-slate-300 text-[10px] font-medium">Call</Text>
              </Pressable>
            )}
            {business.instagram_handle && (
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    `https://instagram.com/${business.instagram_handle!.replace('@', '')}`,
                  )
                }
                className="flex-1 bg-cairn-card border border-cairn-border rounded-xl py-3 items-center active:bg-cairn-card-hover"
              >
                <View className="w-10 h-10 rounded-full bg-canopy/15 items-center justify-center mb-1">
                  <Instagram size={18} color="#10B981" />
                </View>
                <Text className="text-slate-300 text-[10px] font-medium">Instagram</Text>
              </Pressable>
            )}
          </View>

          {/* Photos section — placeholder gallery matching mockup */}
          <View className="mb-4">
            <Text className="text-slate-100 font-semibold text-base mb-2">Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              {(business.photos && business.photos.length > 0
                ? business.photos.slice(0, 5)
                : ['placeholder1', 'placeholder2', 'placeholder3', 'placeholder4']
              ).map((photo, idx) => (
                <View
                  key={idx}
                  className="w-24 h-24 rounded-xl bg-cairn-elevated mr-2 items-center justify-center overflow-hidden"
                >
                  <Text style={{ fontSize: 28, opacity: 0.3 }}>
                    {categoryInfo?.icon ?? '\u{1F4F7}'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Business info card */}
          <Card className="mb-4">
            {/* Phone */}
            {business.phone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${business.phone}`)}
                className="flex-row items-center py-2.5 border-b border-cairn-border/50"
              >
                <Phone size={16} color="#64748b" />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  {business.phone}
                </Text>
                <ExternalLink size={14} color="#64748b" />
              </Pressable>
            )}

            {/* Website */}
            {business.website_url && (
              <Pressable
                onPress={() => Linking.openURL(business.website_url!)}
                className="flex-row items-center py-2.5 border-b border-cairn-border/50"
              >
                <Globe size={16} color="#64748b" />
                <Text
                  className="text-canopy text-sm ml-3 flex-1"
                  numberOfLines={1}
                >
                  {business.website_url.replace(/^https?:\/\//, '')}
                </Text>
                <ExternalLink size={14} color="#64748b" />
              </Pressable>
            )}

            {/* Address */}
            {business.address && (
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    business.google_maps_url ??
                      `https://maps.google.com/?q=${encodeURIComponent(
                        `${business.address}, ${business.city}`,
                      )}`,
                  )
                }
                className="flex-row items-center py-2.5"
              >
                <MapPin size={16} color="#64748b" />
                <Text className="text-slate-300 text-sm ml-3 flex-1">
                  {business.address}, {business.city}, {business.state_province}
                </Text>
                <ExternalLink size={14} color="#64748b" />
              </Pressable>
            )}
          </Card>

          {/* Hours */}
          {business.hours && Object.keys(business.hours).length > 0 && (
            <Card className="mb-4">
              <View className="flex-row items-center mb-3">
                <Clock size={16} color="#10B981" />
                <Text className="text-slate-100 font-semibold text-sm ml-2">
                  Hours
                </Text>
              </View>
              {Object.entries(business.hours).map(([day, hours], index, arr) => (
                <View
                  key={day}
                  className={`flex-row justify-between py-2 ${
                    index < arr.length - 1 ? 'border-b border-cairn-border/30' : ''
                  }`}
                >
                  <Text className="text-slate-400 text-sm capitalize">
                    {day}
                  </Text>
                  <Text className="text-slate-300 text-sm">{hours}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Description */}
          {business.description && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-base mb-2">
                About
              </Text>
              <Text className="text-slate-400 text-sm leading-6">
                {business.description}
              </Text>
            </View>
          )}

          {/* Activity types */}
          {business.activity_types.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-base mb-2">
                Activities Supported
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {business.activity_types.map((at) => (
                  <View
                    key={at}
                    className="bg-cairn-card border border-cairn-border rounded-xl px-3 py-2 flex-row items-center"
                  >
                    <ActivityIcon activitySlug={at} size="sm" showLabel />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {business.tags && business.tags.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-base mb-2">
                Tags
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {business.tags.map((tag) => (
                  <View
                    key={tag}
                    className="bg-cairn-elevated/50 rounded-full px-2.5 py-1"
                  >
                    <Text className="text-slate-400 text-xs">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Related Trails */}
          {relatedTrails.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-100 font-semibold text-lg mb-3">
                Related Trails
              </Text>
              {relatedTrails.map((trail) => (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  onPress={() =>
                    router.push(`/(tabs)/explore/trail/${trail.slug}`)
                  }
                />
              ))}
            </View>
          )}

          {/* Reviews */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-slate-100 font-semibold text-lg">
                Reviews ({reviews.length})
              </Text>
              {business.review_count > 0 && (
                <View className="flex-row items-center">
                  <Star size={14} color="#F4A261" fill="#F4A261" />
                  <Text className="text-slate-300 text-sm ml-1 font-medium">
                    {business.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
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
                  No reviews yet. Be the first to review this business!
                </Text>
              </Card>
            )}
          </View>

          {/* Accommodation Links */}
          <View className="mb-4">
            <AccommodationLinks
              locationName={
                business.city
                  ? `${business.city}, ${business.state_province ?? ''}`
                  : business.name
              }
              lat={business.lat}
              lng={business.lng}
              compact
            />
          </View>

          {/* Bottom spacer */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
