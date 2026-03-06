import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Map as MapIcon,
  List,
  Navigation,
  Compass,
  Search as SearchIcon,
} from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { TrailCard } from '@/components/trail/TrailCard';
import { BusinessCard } from '@/components/business/BusinessCard';
import { MapPin } from '@/components/ui/MapPin';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  FilterSheet,
  FilterButton,
  type FilterState,
} from '@/components/ui/FilterSheet';
import { fetchTrails, fetchBusinesses } from '@/lib/api';
import { exploreRegion } from '@/lib/discovery';
import { BUSINESS_CATEGORIES } from '@cairn/shared';
import type { Trail, Business } from '@cairn/shared';

type ViewMode = 'map' | 'list';
type TabType = 'trails' | 'businesses';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Normalize lat/lng to screen coordinates for the placeholder map
const MAP_BOUNDS = {
  minLat: 38.45,
  maxLat: 38.75,
  minLng: -109.8,
  maxLng: -109.3,
};

function latLngToXY(
  lat: number,
  lng: number,
  mapWidth: number,
  mapHeight: number,
) {
  const x =
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) *
      (mapWidth - 60) +
    30;
  const y =
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
      (mapHeight - 60) +
    30;
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
  }>();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('trails');
  const [filters, setFilters] = useState<FilterState>({
    activityTypes: [],
    difficulty: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const regionName = params.regionName ?? 'Moab, Utah';
  const regionLat = params.lat ? parseFloat(params.lat) : 38.5733;
  const regionLng = params.lng ? parseFloat(params.lng) : -109.5498;

  const [trails, setTrails] = useState<Trail[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingTrails, setLoadingTrails] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const debouncedSearch = useDebouncedValue(search, 300);

  const activeFilterCount =
    filters.activityTypes.length + (filters.difficulty ? 1 : 0);

  // Fetch trails
  useEffect(() => {
    let cancelled = false;
    setLoadingTrails(true);

    fetchTrails({
      search: debouncedSearch || undefined,
      activityTypes:
        filters.activityTypes.length > 0 ? filters.activityTypes : undefined,
      difficulty: filters.difficulty ?? undefined,
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
  }, [debouncedSearch, filters]);

  // Fetch businesses
  useEffect(() => {
    let cancelled = false;
    setLoadingBusinesses(true);

    fetchBusinesses({
      search: debouncedSearch || undefined,
      activityTypes:
        filters.activityTypes.length > 0 ? filters.activityTypes : undefined,
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
  }, [debouncedSearch, filters]);

  const isLoading =
    activeTab === 'trails' ? loadingTrails : loadingBusinesses;

  const handleTrailPress = useCallback((trail: Trail) => {
    router.push(`/(tabs)/explore/trail/${trail.slug}`);
  }, []);

  const handleBusinessPress = useCallback((business: Business) => {
    router.push(`/(tabs)/explore/business/${business.slug}`);
  }, []);

  const handlePinPress = useCallback((id: string) => {
    setSelectedPinId((prev) => (prev === id ? null : id));
  }, []);

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
          `Discovered ${result.businessesFound} businesses in ${regionName}.`,
        );
      }
    } catch {
      setDiscoveryMessage('Could not discover this area. Try again later.');
    } finally {
      setDiscovering(false);
    }
  }, [regionName, regionLat, regionLng]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [t, b] = await Promise.all([
        fetchTrails({
          search: debouncedSearch || undefined,
          activityTypes:
            filters.activityTypes.length > 0
              ? filters.activityTypes
              : undefined,
          difficulty: filters.difficulty ?? undefined,
        }),
        fetchBusinesses({
          search: debouncedSearch || undefined,
          activityTypes:
            filters.activityTypes.length > 0
              ? filters.activityTypes
              : undefined,
        }),
      ]);
      setTrails(t);
      setBusinesses(b);
    } catch {
      // keep existing data
    } finally {
      setRefreshing(false);
    }
  }, [debouncedSearch, filters]);

  const getCategoryInfo = useCallback(
    (category: string) =>
      BUSINESS_CATEGORIES.find((c) => c.value === category),
    [],
  );

  const hasSparseResults =
    !loadingTrails &&
    !loadingBusinesses &&
    trails.length + businesses.length < 3 &&
    debouncedSearch.length > 0;

  // Map area — full height minus search bar area
  const MAP_HEIGHT = Dimensions.get('window').height - 200;

  // Find selected pin entity for popup card
  const selectedTrail = trails.find((t) => t.id === selectedPinId);
  const selectedBiz = businesses.find((b) => b.id === selectedPinId);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* ── Top bar: Search + Filter + Toggle ── */}
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search trails & businesses..."
            />
          </View>
          <FilterButton
            activeCount={activeFilterCount}
            onPress={() => setFilterVisible(true)}
          />
          <Pressable
            onPress={() =>
              setViewMode((m) => (m === 'map' ? 'list' : 'map'))
            }
            className="bg-cairn-card border border-cairn-border rounded-xl p-2.5"
          >
            {viewMode === 'map' ? (
              <List size={16} color="#94a3b8" />
            ) : (
              <MapIcon size={16} color="#94a3b8" />
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Tab switcher (both modes) ── */}
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

      {viewMode === 'map' ? (
        /* ── MAP MODE ── */
        <View className="flex-1 relative">
          {/* Map placeholder */}
          <View className="flex-1 bg-[#091422]">
            {/* Grid lines */}
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

            {/* Road lines */}
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
                {regionName.toUpperCase()}
              </Text>
            </View>

            {/* Trail pins */}
            {activeTab === 'trails' &&
              trails.map((trail) => {
                const pos = latLngToXY(
                  trail.lat,
                  trail.lng,
                  SCREEN_WIDTH,
                  MAP_HEIGHT,
                );
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
            {activeTab === 'businesses' &&
              businesses.map((biz) => {
                const cat = getCategoryInfo(biz.category);
                const pos = latLngToXY(
                  biz.lat,
                  biz.lng,
                  SCREEN_WIDTH,
                  MAP_HEIGHT,
                );
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

            {/* Loading spinner */}
            {isLoading && (
              <View className="absolute left-3 top-3">
                <ActivityIndicator size="small" color="#10B981" />
              </View>
            )}

            {/* Map controls */}
            <View className="absolute right-3 top-3">
              <View className="bg-cairn-card/90 border border-cairn-border rounded-xl overflow-hidden">
                <Pressable
                  onPress={() => router.push('/(tabs)/explore/regions')}
                  className="p-2.5 items-center justify-center border-b border-cairn-border/50"
                >
                  <Compass size={18} color="#10B981" />
                </Pressable>
                <Pressable className="p-2.5 items-center justify-center">
                  <Navigation size={18} color="#94a3b8" />
                </Pressable>
              </View>
            </View>

            {/* Location count */}
            <View className="absolute left-3 bottom-3">
              <View className="flex-row items-center bg-cairn-card/90 border border-cairn-border rounded-lg px-2.5 py-1.5">
                <MapIcon size={12} color="#10B981" />
                <Text className="text-slate-400 text-[10px] ml-1.5">
                  {trails.length + businesses.length} locations
                </Text>
              </View>
            </View>
          </View>

          {/* Popup card when a pin is tapped */}
          {selectedTrail && (
            <View className="absolute bottom-4 left-4 right-4">
              <TrailCard
                trail={selectedTrail}
                onPress={() => handleTrailPress(selectedTrail)}
              />
            </View>
          )}
          {selectedBiz && (
            <View className="absolute bottom-4 left-4 right-4">
              <BusinessCard
                business={selectedBiz}
                onPress={() => handleBusinessPress(selectedBiz)}
              />
            </View>
          )}
        </View>
      ) : (
        /* ── LIST MODE ── */
        <View className="flex-1">
          {/* Regions link */}
          <View className="flex-row items-center gap-2 mx-4 mb-2">
            <Pressable
              onPress={() => router.push('/(tabs)/explore/regions')}
              className="flex-row items-center bg-canopy/15 border border-canopy/30 rounded-lg px-3 py-2"
            >
              <Compass size={14} color="#10B981" />
              <Text className="text-canopy text-xs font-semibold ml-1.5">
                Regions
              </Text>
            </Pressable>
          </View>

          {/* Sparse results — Discover prompt */}
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
                    Search for trails and businesses nearby
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

          {/* Content list */}
          {isLoading ? (
            <View style={{ paddingHorizontal: 16 }}>
              <SkeletonCard className="mb-3" />
              <SkeletonCard className="mb-3" />
              <SkeletonCard className="mb-3" />
            </View>
          ) : activeTab === 'trails' ? (
            <FlatList
              data={trails}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 32,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#10B981"
                  colors={['#10B981']}
                />
              }
              renderItem={({ item }) => (
                <TrailCard
                  trail={item}
                  onPress={() => handleTrailPress(item)}
                />
              )}
              ListEmptyComponent={
                <Text className="text-slate-500 text-center mt-8">
                  No trails found
                </Text>
              }
            />
          ) : (
            <FlatList
              data={businesses}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 32,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#10B981"
                  colors={['#10B981']}
                />
              }
              renderItem={({ item }) => (
                <BusinessCard
                  business={item}
                  onPress={() => handleBusinessPress(item)}
                />
              )}
              ListEmptyComponent={
                <Text className="text-slate-500 text-center mt-8">
                  No businesses found
                </Text>
              }
            />
          )}
        </View>
      )}

      {/* Filter Sheet Modal */}
      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onApply={setFilters}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}
