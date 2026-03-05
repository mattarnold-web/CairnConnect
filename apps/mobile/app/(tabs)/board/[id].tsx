import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Shield,
  DollarSign,
  MessageCircle,
  Clock,
  Mail,
  Phone,
  UserCircle,
} from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { fetchActivityPostById } from '@/lib/api';
import { formatDate, timeUntil } from '@cairn/shared';
import type { ActivityPost } from '@cairn/shared';

const CONTACT_METHOD_LABELS: Record<string, { label: string; icon: typeof Mail }> = {
  in_app: { label: 'In-App Message', icon: MessageCircle },
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Phone', icon: Phone },
};

const POST_TYPE_CONFIG = {
  im_going: { label: "I'm Going", variant: 'green' as const, emoji: '\u{1F7E2}', description: 'The organizer is going and inviting others to join' },
  open_permit: { label: 'Open Permit', variant: 'amber' as const, emoji: '\u{1F3AB}', description: 'Permit slots available to share' },
  lfg: { label: 'Looking for Group', variant: 'purple' as const, emoji: '\u{1F7E3}', description: 'Looking for people to join' },
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<ActivityPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchActivityPostById(id);
        if (!cancelled) setPost(data);
      } catch {
        // Error handled by api fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
          <Pressable onPress={() => router.back()} className="p-1 mr-3">
            <ArrowLeft size={24} color="#e2e8f0" />
          </Pressable>
          <Skeleton width="60%" height={18} />
        </View>
        <View className="px-4 pt-4">
          <Skeleton width="40%" height={24} className="mb-3" />
          <Skeleton width="80%" height={28} className="mb-4" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-cairn-bg items-center justify-center">
        <Text className="text-slate-400 text-base mb-2">Post not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-canopy text-sm font-medium">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const spotsLeft = post.max_participants - post.current_participants;
  const config = POST_TYPE_CONFIG[post.post_type] ?? POST_TYPE_CONFIG.im_going;
  const isFull = spotsLeft <= 0;
  const contactConfig = CONTACT_METHOD_LABELS[post.contact_method] ?? CONTACT_METHOD_LABELS.in_app;
  const ContactIcon = contactConfig.icon;

  const handleJoin = () => {
    if (isFull) {
      Alert.alert('Activity Full', 'This activity has no spots remaining.');
      return;
    }
    Alert.alert('Join Activity', 'You have expressed interest in joining this activity! (Demo mode)', [
      { text: 'OK' },
    ]);
  };

  const handleMessage = () => {
    Alert.alert(
      'Message Organizer',
      `Send a message to ${post.user_display_name ?? 'the organizer'} via ${contactConfig.label}. (Demo mode)`,
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
        <Pressable onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Text className="text-slate-100 font-semibold text-base flex-1" numberOfLines={1}>
          {post.title}
        </Text>
        <Text className="text-slate-500 text-xs">{timeUntil(post.activity_date)}</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Post type badge and title */}
        <View className="px-4 pt-4">
          <Badge
            label={config.label}
            variant={config.variant}
            size="md"
          />

          <Text className="text-slate-100 font-bold text-2xl mt-3 mb-1">
            {post.title}
          </Text>

          <View className="flex-row items-center gap-3 mb-3">
            <ActivityIcon activitySlug={post.activity_type} size="md" showLabel />
            <Badge label={post.skill_level} />
          </View>
        </View>

        {/* Organizer info */}
        <Card className="mx-4 mb-3">
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-full bg-canopy/20 items-center justify-center mr-3">
              {post.user_avatar ? (
                <Text className="text-canopy font-bold text-sm">{post.user_avatar}</Text>
              ) : (
                <UserCircle size={20} color="#10B981" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-semibold text-sm">
                {post.user_display_name ?? 'Anonymous'}
              </Text>
              <Text className="text-slate-500 text-xs">Organizer</Text>
            </View>
            <Pressable
              onPress={handleMessage}
              className="flex-row items-center bg-cairn-elevated rounded-lg px-3 py-1.5"
            >
              <ContactIcon size={14} color="#10B981" />
              <Text className="text-canopy text-xs font-medium ml-1.5">Message</Text>
            </Pressable>
          </View>
        </Card>

        {/* Description */}
        {post.description && (
          <View className="px-4 mb-3">
            <Text className="text-slate-300 text-sm leading-6">
              {post.description}
            </Text>
          </View>
        )}

        {/* Details card */}
        <Card className="mx-4 mb-3">
          <Text className="text-slate-100 font-semibold text-sm mb-3">Details</Text>
          <View className="gap-3">
            <View className="flex-row items-center">
              <View className="h-7 w-7 rounded-lg bg-canopy/10 items-center justify-center mr-3">
                <Calendar size={14} color="#10B981" />
              </View>
              <View>
                <Text className="text-slate-300 text-sm">
                  {formatDate(post.activity_date)}
                </Text>
                {post.activity_end_date && (
                  <Text className="text-slate-500 text-xs">
                    to {formatDate(post.activity_end_date)}
                  </Text>
                )}
              </View>
            </View>

            {post.location_name && (
              <View className="flex-row items-center">
                <View className="h-7 w-7 rounded-lg bg-canopy/10 items-center justify-center mr-3">
                  <MapPin size={14} color="#10B981" />
                </View>
                <Text className="text-slate-300 text-sm flex-1">{post.location_name}</Text>
              </View>
            )}

            <View className="flex-row items-center">
              <View className="h-7 w-7 rounded-lg bg-canopy/10 items-center justify-center mr-3">
                <Users size={14} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-300 text-sm">
                  {post.current_participants}/{post.max_participants} participants
                </Text>
                {spotsLeft > 0 ? (
                  <Text className="text-canopy text-xs">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</Text>
                ) : (
                  <Text className="text-red-400 text-xs">Full</Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="h-7 w-7 rounded-lg bg-canopy/10 items-center justify-center mr-3">
                <ContactIcon size={14} color="#10B981" />
              </View>
              <Text className="text-slate-300 text-sm">Contact via {contactConfig.label}</Text>
            </View>
          </View>
        </Card>

        {/* Participants preview */}
        <Card className="mx-4 mb-3">
          <Text className="text-slate-100 font-semibold text-sm mb-3">Participants</Text>
          <View className="flex-row flex-wrap gap-2">
            {/* Organizer */}
            <View className="flex-row items-center bg-cairn-elevated rounded-full px-3 py-1.5">
              <View className="h-5 w-5 rounded-full bg-canopy/20 items-center justify-center mr-1.5">
                <Text className="text-canopy text-[10px] font-bold">
                  {post.user_avatar ?? '?'}
                </Text>
              </View>
              <Text className="text-slate-300 text-xs">{post.user_display_name ?? 'Organizer'}</Text>
            </View>
            {/* Other participants shown as count */}
            {post.current_participants > 1 && (
              <View className="flex-row items-center bg-cairn-elevated rounded-full px-3 py-1.5">
                <Users size={12} color="#64748b" />
                <Text className="text-slate-400 text-xs ml-1.5">
                  +{post.current_participants - 1} other{post.current_participants - 1 !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {/* Empty spots */}
            {spotsLeft > 0 && (
              <View className="flex-row items-center bg-cairn-elevated/50 border border-dashed border-cairn-border rounded-full px-3 py-1.5">
                <Text className="text-slate-500 text-xs">
                  {spotsLeft} open spot{spotsLeft !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Gear required */}
        {post.gear_required.length > 0 && (
          <Card className="mx-4 mb-3">
            <Text className="text-slate-100 font-semibold text-sm mb-2">
              Gear Required
            </Text>
            <View className="gap-1.5">
              {post.gear_required.map((gear, i) => (
                <View key={i} className="flex-row items-start">
                  <Text className="text-canopy text-sm mr-2">{'\u2022'}</Text>
                  <Text className="text-slate-400 text-sm flex-1">{gear}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Cost sharing info */}
        {post.cost_share != null && post.cost_share > 0 && (
          <Card className="mx-4 mb-3">
            <View className="flex-row items-center mb-1">
              <DollarSign size={16} color="#10B981" />
              <Text className="text-slate-100 font-semibold text-sm ml-1.5">
                Cost Share
              </Text>
            </View>
            <Text className="text-canopy font-bold text-xl">
              ${post.cost_share.toFixed(2)}
            </Text>
            <Text className="text-slate-500 text-xs">per person</Text>
          </Card>
        )}

        {/* Permit information */}
        {post.permit_required && (
          <Card className="mx-4 mb-3 border-amber-500/30">
            <View className="flex-row items-center mb-2">
              <Shield size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-semibold text-sm ml-2">
                Permit Information
              </Text>
            </View>
            {post.permit_type && (
              <Text className="text-slate-300 text-sm mb-1">
                {post.permit_type}
              </Text>
            )}
            {post.permit_slots_available != null && (
              <Text className="text-slate-400 text-sm">
                {post.permit_slots_available} permit slot{post.permit_slots_available !== 1 ? 's' : ''} available
              </Text>
            )}
          </Card>
        )}

        {/* Map placeholder */}
        {post.location_name && (
          <Card className="mx-4 mb-3">
            <View className="h-32 bg-cairn-elevated rounded-xl items-center justify-center">
              <MapPin size={24} color="#475569" />
              <Text className="text-slate-500 text-xs mt-2">
                Map view coming soon
              </Text>
              <Text className="text-slate-600 text-[10px] mt-0.5">
                {post.lat.toFixed(4)}, {post.lng.toFixed(4)}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-cairn-bg border-t border-cairn-border px-4 pt-3 pb-8">
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            size="lg"
            onPress={handleMessage}
            className="flex-1"
          >
            <View className="flex-row items-center">
              <MessageCircle size={18} color="#e2e8f0" />
              <Text className="text-slate-300 font-semibold text-base ml-2">Message</Text>
            </View>
          </Button>
          <Button
            size="lg"
            onPress={handleJoin}
            disabled={isFull}
            className="flex-1"
          >
            {isFull ? 'Activity Full' : 'Join Activity'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
