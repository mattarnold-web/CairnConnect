/**
 * AccommodationLinks
 *
 * Displays booking platform links as tappable cards. Optionally shows
 * date picker inputs for checkin/checkout. Each card opens the URL
 * via Linking.openURL().
 *
 * Supports a `compact` mode for embedding in detail screens.
 */

import { useState } from 'react';
import { View, Text, Pressable, Linking, TextInput, StyleSheet } from 'react-native';
import { Bed, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react-native';
import { clsx } from 'clsx';
import {
  getAccommodationLinks,
  type AccommodationLink,
} from '@/lib/accommodations';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AccommodationLinksProps {
  locationName: string;
  lat: number;
  lng: number;
  checkin?: string;
  checkout?: string;
  guests?: number;
  /** Compact mode hides the date inputs and uses smaller cards */
  compact?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AccommodationLinks({
  locationName,
  lat,
  lng,
  checkin: initialCheckin,
  checkout: initialCheckout,
  guests = 2,
  compact = false,
  className,
}: AccommodationLinksProps) {
  const [checkin, setCheckin] = useState(initialCheckin ?? '');
  const [checkout, setCheckout] = useState(initialCheckout ?? '');
  const [expanded, setExpanded] = useState(!compact);

  const links: AccommodationLink[] = getAccommodationLinks({
    locationName,
    lat,
    lng,
    checkin: checkin || undefined,
    checkout: checkout || undefined,
    guests,
  });

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      // silently fail if the URL cannot be opened
    });
  };

  return (
    <View className={clsx('', className)}>
      {/* Header */}
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between mb-3"
      >
        <View className="flex-row items-center">
          <Bed size={18} color="#10B981" />
          <Text className="text-slate-100 font-semibold text-base ml-2">
            Find Stays
          </Text>
          <Text className="text-slate-500 text-xs ml-2">
            {locationName}
          </Text>
        </View>
        {compact && (
          expanded ? (
            <ChevronUp size={16} color="#64748b" />
          ) : (
            <ChevronDown size={16} color="#64748b" />
          )
        )}
      </Pressable>

      {expanded && (
        <>
          {/* Date inputs (hidden in compact mode) */}
          {!compact && (
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Calendar size={12} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1">Check-in</Text>
                </View>
                <TextInput
                  value={checkin}
                  onChangeText={setCheckin}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#475569"
                  style={accommodationStyles.dateInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Calendar size={12} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1">Check-out</Text>
                </View>
                <TextInput
                  value={checkout}
                  onChangeText={setCheckout}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#475569"
                  style={accommodationStyles.dateInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}

          {/* Platform cards */}
          <View className={compact ? 'flex-row flex-wrap gap-2' : 'gap-2'}>
            {links.map((link) => (
              <Pressable
                key={link.platform}
                onPress={() => handleOpenLink(link.url)}
                className={clsx(
                  'bg-cairn-card border border-cairn-border rounded-xl active:opacity-70',
                  compact ? 'flex-row items-center px-3 py-2.5' : 'flex-row items-center px-4 py-3.5',
                )}
                style={compact ? { minWidth: '47%' } : undefined}
              >
                <Text className={compact ? 'text-base mr-2' : 'text-xl mr-3'}>
                  {link.icon}
                </Text>
                <View className="flex-1">
                  <Text
                    className={clsx(
                      'font-medium',
                      compact ? 'text-slate-200 text-xs' : 'text-slate-100 text-sm',
                    )}
                  >
                    {link.name}
                  </Text>
                  {!compact && (
                    <Text className="text-slate-500 text-xs mt-0.5">
                      Search available stays
                    </Text>
                  )}
                </View>
                <ExternalLink
                  size={compact ? 12 : 14}
                  color="#64748b"
                />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const accommodationStyles = StyleSheet.create({
  dateInput: {
    backgroundColor: '#112240',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#f1f5f9',
  },
});
