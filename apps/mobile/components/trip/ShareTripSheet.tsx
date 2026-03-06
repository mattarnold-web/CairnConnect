import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Copy,
  Share2,
  MessageSquare,
  Link,
  Mountain,
  Calendar,
  MapPin,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { encodeTripState } from '@/lib/trip-share';
import { MOCK_TRAILS } from '@/lib/mock-data';
import { ACTIVITY_TYPES } from '@cairn/shared';
import type { TripState } from '@/lib/trip-types';

interface ShareTripSheetProps {
  visible: boolean;
  onClose: () => void;
  tripState: TripState;
}

function formatDateNice(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function ShareTripSheet({
  visible,
  onClose,
  tripState,
}: ShareTripSheetProps) {
  const [copied, setCopied] = useState(false);

  const deepLink = useMemo(() => {
    const encoded = encodeTripState(tripState);
    return `cairnconnect://trip?code=${encoded}`;
  }, [tripState]);

  // Build a formatted text summary of the trip
  const tripSummary = useMemo(() => {
    const lines: string[] = [];
    const tripName = tripState.tripName || `My ${tripState.region?.name ?? ''} Trip`;

    lines.push(tripName);
    lines.push('');

    if (tripState.region) {
      lines.push(
        `Destination: ${tripState.region.name}, ${tripState.region.state_province}`,
      );
    }

    if (tripState.startDate) {
      const endDate = tripState.days[tripState.days.length - 1]?.date;
      lines.push(
        `Dates: ${formatDateNice(tripState.startDate)}${endDate ? ` - ${formatDateNice(endDate)}` : ''}`,
      );
    }

    lines.push(`Duration: ${tripState.days.length} day${tripState.days.length !== 1 ? 's' : ''}`);
    lines.push('');

    for (const day of tripState.days) {
      lines.push(
        `Day ${day.dayNumber}${day.label ? ` - ${day.label}` : ''}${day.date ? ` (${formatDateNice(day.date)})` : ''}`,
      );

      if (day.items.length === 0) {
        lines.push('  No activities planned');
      } else {
        for (const item of day.items) {
          if (item.type === 'trail' && item.trailId) {
            const trail = (MOCK_TRAILS as any[]).find(
              (t) => t.id === item.trailId,
            );
            if (trail) {
              const distance = (trail.distance_meters / 1609.34).toFixed(1);
              lines.push(`  - ${trail.name} (${distance} mi)`);
            }
          } else if (item.type === 'custom' && item.customTitle) {
            lines.push(`  - ${item.customTitle}`);
          }
        }
      }

      lines.push('');
    }

    lines.push('Planned with Cairn Go');
    return lines.join('\n');
  }, [tripState]);

  // Count trails
  const trailCount = useMemo(() => {
    let count = 0;
    for (const day of tripState.days) {
      for (const item of day.items) {
        if (item.type === 'trail') count++;
      }
    }
    return count;
  }, [tripState]);

  const handleCopyLink = async () => {
    try {
      // Use Share API to allow the user to copy the link
      await Share.share({
        message: deepLink,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User cancelled or error
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${tripSummary}\n\nOpen in app: ${deepLink}`,
      });
    } catch {
      // User cancelled or error
    }
  };

  const handleShareViaSMS = async () => {
    try {
      await Share.share({
        message: `Check out my trip plan on Cairn Go!\n\n${tripSummary}\n\n${deepLink}`,
      });
    } catch {
      // User cancelled or error
    }
  };

  const tripName = tripState.tripName || `My ${tripState.region?.name ?? ''} Trip`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
          <View className="flex-1">
            <Text className="text-slate-100 font-semibold text-base">
              Share Trip
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="h-8 w-8 rounded-full bg-cairn-card items-center justify-center"
          >
            <X size={18} color="#94a3b8" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          {/* Preview card */}
          <Card className="mb-4 border-canopy/30">
            <View className="flex-row items-center mb-3">
              {tripState.region && (
                <Text className="text-2xl mr-3">{tripState.region.coverEmoji}</Text>
              )}
              <View className="flex-1">
                <Text className="text-slate-100 font-bold text-lg" numberOfLines={1}>
                  {tripName}
                </Text>
                {tripState.region && (
                  <View className="flex-row items-center mt-0.5">
                    <MapPin size={10} color="#64748b" />
                    <Text className="text-slate-500 text-xs ml-0.5">
                      {tripState.region.name}, {tripState.region.state_province}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="flex-row items-center gap-3 mb-3">
              {tripState.startDate && (
                <View className="flex-row items-center">
                  <Calendar size={12} color="#10B981" />
                  <Text className="text-slate-400 text-xs ml-1">
                    {formatDateNice(tripState.startDate)}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center">
                <Text className="text-slate-500 text-xs">
                  {tripState.days.length} day{tripState.days.length !== 1 ? 's' : ''}
                </Text>
              </View>
              {trailCount > 0 && (
                <View className="flex-row items-center">
                  <Mountain size={12} color="#10B981" />
                  <Text className="text-slate-400 text-xs ml-1">
                    {trailCount} trail{trailCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Activity badges */}
            {tripState.selectedActivities.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5">
                {tripState.selectedActivities.map((slug) => {
                  const at = ACTIVITY_TYPES.find((a) => a.slug === slug);
                  return (
                    <View
                      key={slug}
                      className="flex-row items-center bg-cairn-elevated rounded-full px-2 py-0.5"
                    >
                      <Text className="text-xs mr-0.5">{at?.emoji}</Text>
                      <Text className="text-slate-400 text-[10px]">{at?.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Trip summary text */}
          <Card className="mb-4">
            <Text className="text-slate-500 text-xs font-medium mb-2">
              Trip Summary
            </Text>
            <Text className="text-slate-300 text-xs leading-5">
              {tripSummary}
            </Text>
          </Card>

          {/* Share actions */}
          <View className="gap-3">
            <Button
              variant="secondary"
              size="lg"
              onPress={handleCopyLink}
            >
              <View className="flex-row items-center">
                {copied ? (
                  <>
                    <Link size={18} color="#10B981" />
                    <Text className="text-canopy font-semibold text-base ml-2">
                      Copied!
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={18} color="#e2e8f0" />
                    <Text className="text-slate-300 font-semibold text-base ml-2">
                      Copy Link
                    </Text>
                  </>
                )}
              </View>
            </Button>

            <Button
              size="lg"
              onPress={handleShare}
            >
              <View className="flex-row items-center">
                <Share2 size={18} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Share
                </Text>
              </View>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onPress={handleShareViaSMS}
            >
              <View className="flex-row items-center">
                <MessageSquare size={18} color="#e2e8f0" />
                <Text className="text-slate-300 font-semibold text-base ml-2">
                  Share via Message
                </Text>
              </View>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
