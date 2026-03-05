/**
 * Region Explorer Screen
 *
 * Shows all available regions as browsable cards with search/filter,
 * trail/business counts, top activities, and "Find Stays" integration.
 */

import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Mountain,
  Store,
  Compass,
  Bed,
} from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { Card } from '@/components/ui/Card';
import { AccommodationLinks } from '@/components/ui/AccommodationLinks';
import { getPopularRegions, type Region } from '@/lib/discovery';
import { ACTIVITY_TYPES } from '@cairn/shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map of activity slugs to emoji (for quick lookups) */
const ACTIVITY_EMOJI_MAP = Object.fromEntries(
  ACTIVITY_TYPES.map((a) => [a.slug, a.emoji]),
);

/** Country flag helper (US, Canada, etc.) */
function countryFlag(country: string): string {
  switch (country) {
    case 'United States':
      return '\uD83C\uDDFA\uD83C\uDDF8';
    case 'Canada':
      return '\uD83C\uDDE8\uD83C\uDDE6';
    case 'Italy':
      return '\uD83C\uDDEE\uD83C\uDDF9';
    case 'France':
      return '\uD83C\uDDEB\uD83C\uDDF7';
    case 'New Zealand':
      return '\uD83C\uDDF3\uD83C\uDDFF';
    case 'Australia':
      return '\uD83C\uDDE6\uD83C\uDDFA';
    default:
      return '\uD83C\uDF0D';
  }
}

/** Unique countries from the regions list for filtering */
function getCountryOptions(regions: Region[]): string[] {
  const set = new Set(regions.map((r) => r.country));
  return Array.from(set).sort();
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function RegionsScreen() {
  const allRegions = useMemo(() => getPopularRegions(), []);
  const countries = useMemo(() => getCountryOptions(allRegions), [allRegions]);

  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showAccommodationsFor, setShowAccommodationsFor] = useState<string | null>(null);

  // Filter regions
  const filteredRegions = useMemo(() => {
    let list = allRegions;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.topActivities.some((a) => a.toLowerCase().includes(q)),
      );
    }

    if (selectedCountry) {
      list = list.filter((r) => r.country === selectedCountry);
    }

    return list;
  }, [allRegions, search, selectedCountry]);

  const handleRegionPress = useCallback(
    (region: Region) => {
      // Navigate back to explore with the region's coordinates.
      // The explore screen will pick up these params and re-center.
      router.push({
        pathname: '/(tabs)/explore',
        params: {
          regionName: region.name,
          lat: String(region.lat),
          lng: String(region.lng),
          radiusKm: String(region.radiusKm),
        },
      });
    },
    [],
  );

  const toggleAccommodations = useCallback((regionName: string) => {
    setShowAccommodationsFor((prev) =>
      prev === regionName ? null : regionName,
    );
  }, []);

  const countryFilterData = useMemo(
    () => [
      { value: null as string | null, label: 'All Countries' },
      ...countries.map((c) => ({ value: c as string | null, label: c })),
    ],
    [countries],
  );

  const renderRegionCard = useCallback(
    ({ item: region }: { item: Region }) => {
      const isAccommodationsVisible = showAccommodationsFor === region.name;

      return (
        <Pressable
          onPress={() => handleRegionPress(region)}
          className="mx-4 mb-3"
        >
          <Card>
            {/* Region header */}
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg mr-1.5">
                    {countryFlag(region.country)}
                  </Text>
                  <Text className="text-slate-100 font-bold text-base">
                    {region.name}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={11} color="#64748b" />
                  <Text className="text-slate-500 text-xs ml-1">
                    {region.country}
                  </Text>
                </View>
              </View>

              {/* Explore arrow */}
              <View className="bg-canopy/15 rounded-full p-2">
                <Compass size={18} color="#10B981" />
              </View>
            </View>

            {/* Description */}
            <Text className="text-slate-400 text-sm leading-5 mb-3" numberOfLines={2}>
              {region.description}
            </Text>

            {/* Top activities */}
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {region.topActivities.slice(0, 5).map((slug) => (
                <View
                  key={slug}
                  className="bg-cairn-bg rounded-full px-2 py-1 flex-row items-center"
                >
                  <Text className="text-xs mr-1">
                    {ACTIVITY_EMOJI_MAP[slug] ?? '\u26F0\uFE0F'}
                  </Text>
                  <Text className="text-slate-400 text-[10px]">
                    {ACTIVITY_TYPES.find((a) => a.slug === slug)?.label ?? slug}
                  </Text>
                </View>
              ))}
            </View>

            {/* Stats + Accommodations button row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center">
                  <Mountain size={12} color="#10B981" />
                  <Text className="text-slate-500 text-xs ml-1">
                    {region.radiusKm}km radius
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => toggleAccommodations(region.name)}
                className="flex-row items-center bg-cairn-bg rounded-lg px-2.5 py-1.5"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bed size={12} color="#10B981" />
                <Text className="text-canopy text-xs font-medium ml-1">
                  Find Stays
                </Text>
              </Pressable>
            </View>

            {/* Inline accommodation links */}
            {isAccommodationsVisible && (
              <View className="mt-3 pt-3 border-t border-cairn-border">
                <AccommodationLinks
                  locationName={region.name}
                  lat={region.lat}
                  lng={region.lng}
                  compact
                />
              </View>
            )}
          </Card>
        </Pressable>
      );
    },
    [handleRegionPress, showAccommodationsFor, toggleAccommodations],
  );

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-cairn-card items-center justify-center mr-3"
        >
          <ArrowLeft size={20} color="#e2e8f0" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-slate-100 font-bold text-lg">
            Explore Regions
          </Text>
          <Text className="text-slate-500 text-xs">
            {filteredRegions.length} destinations
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View className="px-4 py-2">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search regions, activities..."
        />
      </View>

      {/* Country filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={countryFilterData}
        keyExtractor={(item) => item.label}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            selected={selectedCountry === item.value}
            onPress={() =>
              setSelectedCountry(
                item.value === selectedCountry ? null : item.value,
              )
            }
          />
        )}
      />

      {/* Regions list */}
      <FlatList
        data={filteredRegions}
        keyExtractor={(item) => item.name}
        renderItem={renderRegionCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-slate-500 text-sm">
              No regions match your search
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
