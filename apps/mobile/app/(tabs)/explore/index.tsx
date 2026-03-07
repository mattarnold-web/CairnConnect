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
import { Map as MapIcon, Navigation, Layers, Compass, Bed, Search as SearchIcon, Store } from 'lucide-react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { SearchBar } from '@/components/ui/SearchBar';
import { TrailCard } from '@/components/trail/TrailCard';
import { BusinessCard } from '@/components/business/BusinessCard';
import { MapPin } from '@/components/ui/MapPin';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchTrails, fetchBusinesses, autocompleteLocations } from '@/lib/api';
import type { AutocompleteResult } from '@/lib/api';
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
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  // Autocomplete effect
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }
    let cancelled = false;
    autocompleteLocations(debouncedSearch, regionLat, regionLng, 6)
      .then((results) => {
        if (!cancelled) {
          setAutocompleteResults(results);
          setShowAutocomplete(results.length > 0);
        }
      })
      .catch(() => {
        if (!cancelled) setAutocompleteResults([]);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch, regionLat, regionLng]);

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
          activeTab === 'trails' ? (
            <EmptyState
              icon={MapIcon}
              title="No trails found"
              description="Try adjusting your search or filters to discover trails in this area."
              actionLabel={selectedActivity || debouncedSearch ? 'Clear Filters' : undefined}
              onAction={selectedActivity || debouncedSearch ? () => { setSelectedActivity(null); setSearch(''); } : undefined}
            />
          ) : (
            <EmptyState
              icon={Store}
              title="No businesses found"
              description="Try expanding your search area to find local outdoor businesses."
              actionLabel={selectedActivity || debouncedSearch ? 'Clear Filters' : undefined}
              onAction={selectedActivity || debouncedSearch ? () => { setSelectedActivity(null); setSearch(''); } : undefined}
            />
          )
        }
      />
    );
  }, [activeTab, trails, businesses, isLoading, handleTrailPress, handleBusinessPress, selectedActivity, debouncedSearch]);

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

        {/* Autocomplete dropdown */}
        {showAutocomplete && (
          <View className="mx-4 mb-2 bg-cairn-card border border-cairn-border rounded-xl overflow-hidden">
            {autocompleteResults.map((result, i) => (
              <Pressable
                key={`${result.entity_type}-${result.id}`}
                onPress={() => {
                  if (result.entity_type === 'trail') {
                    router.push(`/(tabs)/explore/trail/${result.slug}`);
                  } else {
                    router.push(`/(tabs)/explore/business/${result.slug}`);
                  }
                  setShowAutocomplete(false);
                  setSearch('');
                }}
                className={`px-3 py-2.5 flex-row items-center ${
                  i < autocompleteResults.length - 1 ? 'border-b border-cairn-border/50' : ''
                }`}
              >
                <Text className="text-sm mr-2">
                  {result.entity_type === 'trail' ? '🥾' : '🏪'}
                </Text>
                <View className="flex-1">
                  <Text className="text-slate-200 text-sm" numberOfLines={1}>
                    {result.name}
                  </Text>
                  {result.city && (
                    <Text className="text-slate-500 text-xs">
                      {result.city}{result.state_province ? `, ${result.state_province}` : ''}
                    </Text>
                  )}
                </View>
                <Text className="text-slate-600 text-[10px] uppercase">
                  {result.entity_type}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

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
