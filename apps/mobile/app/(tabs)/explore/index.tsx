import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Map as MapIcon, Navigation, Layers, Compass, Bed, Search as SearchIcon } from 'lucide-react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { TrailCard } from '@/components/trail/TrailCard';
import { BusinessCard } from '@/components/business/BusinessCard';
import { AccommodationLinks } from '@/components/ui/AccommodationLinks';
import { MapPin } from '@/components/ui/MapPin';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchTrails, fetchBusinesses } from '@/lib/api';
import { exploreRegion } from '@/lib/discovery';
import { ACTIVITY_TYPES, BUSINESS_CATEGORIES } from '@cairn/shared';
import type { Trail, Business } from '@cairn/shared';

type TabType = 'trails' | 'businesses';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Normalize lat/lng to screen coordinates for the fake map
// All mock data is in the Moab area, so we use rough bounds
const MAP_BOUNDS = {
  minLat: 38.45,
  maxLat: 38.75,
  minLng: -109.80,
  maxLng: -109.30,
};

function latLngToXY(lat: number, lng: number, mapWidth: number, mapHeight: number) {
  const x =
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) *
    (mapWidth - 60) + 30;
  const y =
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
    (mapHeight - 60) + 30;
  return { x, y };
}

/** Simple debounce hook */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    regionName?: string;
    lat?: string;
    lng?: string;
    radiusKm?: string;
  }>();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('trails');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [showAccommodations, setShowAccommodations] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Region from navigation params (coming from regions screen)
  const regionName = params.regionName ?? 'Moab, Utah';
  const regionLat = params.lat ? parseFloat(params.lat) : 38.5733;
  const regionLng = params.lng ? parseFloat(params.lng) : -109.5498;

  // Data state
  const [trails, setTrails] = useState<Trail[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingTrails, setLoadingTrails] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const debouncedSearch = useDebouncedValue(search, 300);

  const snapPoints = useMemo(() => ['35%', '65%', '90%'], []);

  // Fetch trails when filters change
  useEffect(() => {
    let cancelled = false;
    setLoadingTrails(true);

    fetchTrails({
      search: debouncedSearch || undefined,
      activityTypes: selectedActivity ? [selectedActivity] : undefined,
    })
      .then((data) => {
        if (!cancelled) setTrails(data);
      })
      .catch(() => {
        if (!cancelled) setTrails([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTrails(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedActivity]);

  // Fetch businesses when filters change
  useEffect(() => {
    let cancelled = false;
    setLoadingBusinesses(true);

    fetchBusinesses({
      search: debouncedSearch || undefined,
      activityTypes: selectedActivity ? [selectedActivity] : undefined,
    })
      .then((data) => {
        if (!cancelled) setBusinesses(data);
      })
      .catch(() => {
        if (!cancelled) setBusinesses([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBusinesses(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedActivity]);

  const isLoading =
    activeTab === 'trails' ? loadingTrails : loadingBusinesses;

  const handleTrailPress = useCallback(
    (trail: Trail) => {
      router.push(`/(tabs)/explore/trail/${trail.slug}`);
    },
    [],
  );

  const handleBusinessPress = useCallback(
    (business: Business) => {
      router.push(`/(tabs)/explore/business/${business.slug}`);
    },
    [],
  );

  const handlePinPress = useCallback(
    (id: string) => {
      setSelectedPinId((prev) => (prev === id ? null : id));
      bottomSheetRef.current?.snapToIndex(1);
    },
    [],
  );

  const handleDiscoverArea = useCallback(async () => {
    setDiscovering(true);
    setDiscoveryMessage(null);
    try {
      const result = await exploreRegion(regionName, regionLat, regionLng);
      if (result.cached) {
        setDiscoveryMessage(
          `${regionName} already has ${result.trailsFound} trails and ${result.businessesFound} businesses.`,
        );
      } else {
        setDiscoveryMessage(
          `Discovered ${result.businessesFound} businesses in ${regionName}. Data has been cached for future visits.`,
        );
      }
    } catch {
      setDiscoveryMessage('Could not discover this area. Try again later.');
    } finally {
      setDiscovering(false);
    }
  }, [regionName, regionLat, regionLng]);

  /** Whether current results are sparse enough to suggest discovery */
  const hasSparseResults =
    !loadingTrails &&
    !loadingBusinesses &&
    trails.length + businesses.length < 3 &&
    debouncedSearch.length > 0;

  // Map area height
  const MAP_HEIGHT = 340;

  const activityFilterData = useMemo(
    () => [
      { slug: null as string | null, emoji: '\u{1F30D}', label: 'All' },
      ...ACTIVITY_TYPES.slice(0, 10),
    ],
    [],
  );

  const getCategoryInfo = useCallback(
    (category: string) => BUSINESS_CATEGORIES.find((c) => c.value === category),
    [],
  );

  type ListItem =
    | { type: 'trail'; data: Trail }
    | { type: 'business'; data: Business };

  const renderBottomSheetContent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
        </View>
      );
    }

    const items: ListItem[] =
      activeTab === 'trails'
        ? trails.map((t) => ({ type: 'trail' as const, data: t }))
        : businesses.map((b) => ({ type: 'business' as const, data: b }));

    return (
      <BottomSheetFlatList<ListItem>
        data={items}
        keyExtractor={(item: ListItem) => item.data.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }: { item: ListItem }) => {
          if (item.type === 'trail') {
            return (
              <TrailCard
                trail={item.data as Trail}
                onPress={() => handleTrailPress(item.data as Trail)}
              />
            );
          }
          return (
            <BusinessCard
              business={item.data as Business}
              onPress={() => handleBusinessPress(item.data as Business)}
            />
          );
        }}
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-8">
            No {activeTab} found
          </Text>
        }
      />
    );
  }, [activeTab, trails, businesses, isLoading, handleTrailPress, handleBusinessPress]);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Map placeholder area */}
      <View
        className="bg-cairn-bg relative overflow-hidden"
        style={{ height: MAP_HEIGHT }}
      >
        {/* Fake map background with grid lines */}
        <View className="absolute inset-0 bg-[#091422]">
          {/* Subtle grid lines to simulate map */}
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={`h-${i}`}
              className="absolute left-0 right-0 border-b border-cairn-border/20"
              style={{ top: (i + 1) * (MAP_HEIGHT / 9) }}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-r border-cairn-border/20"
              style={{ left: (i + 1) * (SCREEN_WIDTH / 7) }}
            />
          ))}

          {/* Road-like lines */}
          <View
            className="absolute bg-cairn-border/30"
            style={{
              top: MAP_HEIGHT * 0.3,
              left: 0,
              right: 0,
              height: 2,
              transform: [{ rotate: '-15deg' }],
            }}
          />
          <View
            className="absolute bg-cairn-border/30"
            style={{
              top: 0,
              bottom: 0,
              left: SCREEN_WIDTH * 0.45,
              width: 2,
            }}
          />
          <View
            className="absolute bg-blue-900/40"
            style={{
              top: MAP_HEIGHT * 0.5,
              left: 0,
              right: SCREEN_WIDTH * 0.3,
              height: 3,
              transform: [{ rotate: '-8deg' }],
            }}
          />

          {/* Region label */}
          <View
            className="absolute"
            style={{ top: 12, left: SCREEN_WIDTH * 0.35 }}
          >
            <Text className="text-slate-600/60 text-xs font-medium tracking-wider">
              MOAB, UTAH
            </Text>
          </View>
        </View>

        {/* Trail pins */}
        {trails.map((trail) => {
          const pos = latLngToXY(trail.lat, trail.lng, SCREEN_WIDTH, MAP_HEIGHT);
          const emoji =
            trail.activity_types[0] === 'mtb'
              ? '\u{1F6B5}'
              : trail.activity_types[0] === 'hiking'
                ? '\u{1F97E}'
                : '\u26F0\uFE0F';
          return (
            <View
              key={trail.id}
              className="absolute"
              style={{ left: pos.x - 14, top: pos.y - 18 }}
            >
              <MapPin
                type="trail"
                variant={trail.difficulty}
                emoji={emoji}
                size="sm"
                selected={selectedPinId === trail.id}
                onPress={() => handlePinPress(trail.id)}
              />
            </View>
          );
        })}

        {/* Business pins */}
        {businesses.map((biz) => {
          const cat = getCategoryInfo(biz.category);
          const pos = latLngToXY(biz.lat, biz.lng, SCREEN_WIDTH, MAP_HEIGHT);
          return (
            <View
              key={biz.id}
              className="absolute"
              style={{ left: pos.x - 14, top: pos.y - 18 }}
            >
              <MapPin
                type="business"
                variant={biz.category}
                emoji={cat?.icon ?? '\u{1F4CD}'}
                size="sm"
                selected={selectedPinId === biz.id}
                onPress={() => handlePinPress(biz.id)}
              />
            </View>
          );
        })}

        {/* Loading indicator on the map */}
        {(loadingTrails || loadingBusinesses) && (
          <View className="absolute left-3 top-3">
            <ActivityIndicator size="small" color="#10B981" />
          </View>
        )}

        {/* Map controls overlay */}
        <View className="absolute right-3 top-3">
          <View className="bg-cairn-card/90 border border-cairn-border rounded-xl overflow-hidden">
            <Pressable
              onPress={() => router.push('/(tabs)/explore/regions')}
              className="p-2.5 items-center justify-center border-b border-cairn-border/50"
            >
              <Compass size={18} color="#10B981" />
            </Pressable>
            <Pressable className="p-2.5 items-center justify-center border-b border-cairn-border/50">
              <Layers size={18} color="#94a3b8" />
            </Pressable>
            <Pressable className="p-2.5 items-center justify-center">
              <Navigation size={18} color="#94a3b8" />
            </Pressable>
          </View>
        </View>

        {/* Map status label */}
        <View className="absolute left-3 bottom-3">
          <View className="flex-row items-center bg-cairn-card/90 border border-cairn-border rounded-lg px-2.5 py-1.5">
            <MapIcon size={12} color="#10B981" />
            <Text className="text-slate-400 text-[10px] ml-1.5">
              {trails.length + businesses.length} locations
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: '#0B1A2B',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleIndicatorStyle={{ backgroundColor: '#1E3A5F', width: 40 }}
        style={{ zIndex: 10 }}
      >
        {/* Search + filters inside bottom sheet */}
        <View className="px-4 pt-1 pb-2">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search trails & businesses..."
          />
        </View>

        {/* Activity filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={activityFilterData}
          keyExtractor={(item) => item.slug ?? 'all'}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              emoji={item.emoji}
              selected={selectedActivity === item.slug}
              onPress={() =>
                setSelectedActivity(
                  item.slug === selectedActivity ? null : item.slug,
                )
              }
            />
          )}
        />

        {/* Regions + Accommodations row */}
        <View className="flex-row items-center gap-2 mx-4 mb-2">
          <Pressable
            onPress={() => router.push('/(tabs)/explore/regions')}
            className="flex-row items-center bg-canopy/15 border border-canopy/30 rounded-lg px-3 py-2"
          >
            <Compass size={14} color="#10B981" />
            <Text className="text-canopy text-xs font-semibold ml-1.5">Regions</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowAccommodations((prev) => !prev)}
            className={`flex-row items-center rounded-lg px-3 py-2 border ${
              showAccommodations
                ? 'bg-canopy/15 border-canopy/30'
                : 'bg-cairn-card border-cairn-border'
            }`}
          >
            <Bed size={14} color={showAccommodations ? '#10B981' : '#64748b'} />
            <Text
              className={`text-xs font-medium ml-1.5 ${
                showAccommodations ? 'text-canopy' : 'text-slate-400'
              }`}
            >
              Stays
            </Text>
          </Pressable>
        </View>

        {/* Tab switcher */}
        <View className="flex-row border-b border-cairn-border mx-4 mb-2">
          <Pressable
            onPress={() => setActiveTab('trails')}
            className={`flex-1 pb-3 items-center ${
              activeTab === 'trails' ? 'border-b-2 border-canopy' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'trails' ? 'text-canopy' : 'text-slate-500'
              }`}
            >
              Trails ({trails.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('businesses')}
            className={`flex-1 pb-3 items-center ${
              activeTab === 'businesses' ? 'border-b-2 border-canopy' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'businesses' ? 'text-canopy' : 'text-slate-500'
              }`}
            >
              Businesses ({businesses.length})
            </Text>
          </Pressable>
        </View>

        {/* Sparse results -- Discover this area prompt */}
        {hasSparseResults && (
          <View className="mx-4 mb-2">
            <Pressable
              onPress={handleDiscoverArea}
              disabled={discovering}
              className="bg-canopy/10 border border-canopy/30 rounded-xl p-3 flex-row items-center"
            >
              <View className="w-8 h-8 rounded-full bg-canopy/20 items-center justify-center mr-3">
                {discovering ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : (
                  <SearchIcon size={16} color="#10B981" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-canopy font-semibold text-sm">
                  Discover this area
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Search for businesses and trails nearby
                </Text>
              </View>
            </Pressable>
            {discoveryMessage && (
              <Text className="text-slate-400 text-xs mt-2 px-1">
                {discoveryMessage}
              </Text>
            )}
          </View>
        )}

        {/* Accommodations section */}
        {showAccommodations && (
          <View className="mx-4 mb-3">
            <AccommodationLinks
              locationName={debouncedSearch || regionName}
              lat={regionLat}
              lng={regionLng}
              compact
            />
          </View>
        )}

        {/* Content list */}
        {renderBottomSheetContent()}
      </BottomSheet>
    </SafeAreaView>
  );
}
