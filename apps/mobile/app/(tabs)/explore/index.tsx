import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin as MapPinIcon, Store, SlidersHorizontal, X } from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { TrailCard } from '@/components/trail/TrailCard';
import { BusinessCard } from '@/components/business/BusinessCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchTrails, fetchBusinesses, autocompleteLocations } from '@/lib/api';
import type { AutocompleteResult } from '@/lib/api';
import { ACTIVITY_TYPES } from '@cairn/shared';
import type { Trail, Business } from '@cairn/shared';

type TabType = 'trails' | 'businesses';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ regionName?: string; lat?: string; lng?: string }>();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('trails');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const regionLat = params.lat ? parseFloat(params.lat) : 38.5733;
  const regionLng = params.lng ? parseFloat(params.lng) : -109.5498;

  const [trails, setTrails] = useState<Trail[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingTrails, setLoadingTrails] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const debouncedSearch = useDebouncedValue(search, 300);

  const activityFilterData = useMemo(
    () => [
      { slug: null as string | null, emoji: '🌍', label: 'All' },
      ...ACTIVITY_TYPES.slice(0, 8).map((a) => ({ slug: a.slug, emoji: a.emoji, label: a.label })),
    ],
    [],
  );

  // ── Data fetching ─────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoadingTrails(true);
    fetchTrails({
      search: debouncedSearch || undefined,
      activityTypes: selectedActivity ? [selectedActivity] : undefined,
    })
      .then((data) => { if (!cancelled) setTrails(data); })
      .catch(() => { if (!cancelled) setTrails([]); })
      .finally(() => { if (!cancelled) setLoadingTrails(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedActivity]);

  useEffect(() => {
    let cancelled = false;
    setLoadingBusinesses(true);
    fetchBusinesses({
      search: debouncedSearch || undefined,
      activityTypes: selectedActivity ? [selectedActivity] : undefined,
    })
      .then((data) => { if (!cancelled) setBusinesses(data); })
      .catch(() => { if (!cancelled) setBusinesses([]); })
      .finally(() => { if (!cancelled) setLoadingBusinesses(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedActivity]);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }
    let cancelled = false;
    autocompleteLocations(debouncedSearch, regionLat, regionLng, 6)
      .then((results) => {
        if (!cancelled) { setAutocompleteResults(results); setShowAutocomplete(results.length > 0); }
      })
      .catch(() => { if (!cancelled) setAutocompleteResults([]); });
    return () => { cancelled = true; };
  }, [debouncedSearch, regionLat, regionLng]);

  const isLoading = activeTab === 'trails' ? loadingTrails : loadingBusinesses;
  const currentData = activeTab === 'trails' ? trails : businesses;
  const hasActiveFilters = !!selectedActivity || !!debouncedSearch;

  const handleTrailPress = useCallback((trail: Trail) => {
    router.push(`/(tabs)/explore/trail/${trail.slug}`);
  }, []);

  const handleBusinessPress = useCallback((business: Business) => {
    router.push(`/(tabs)/explore/business/${business.slug}`);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedActivity(null);
    setSearch('');
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [t, b] = await Promise.all([
        fetchTrails({ search: debouncedSearch || undefined, activityTypes: selectedActivity ? [selectedActivity] : undefined }),
        fetchBusinesses({ search: debouncedSearch || undefined, activityTypes: selectedActivity ? [selectedActivity] : undefined }),
      ]);
      setTrails(t);
      setBusinesses(b);
    } catch { /* keep existing */ }
    finally { setRefreshing(false); }
  }, [debouncedSearch, selectedActivity]);

  // ── Render ────────────────────────────────────────────────────────

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (activeTab === 'trails') {
      return <TrailCard trail={item} onPress={() => handleTrailPress(item)} />;
    }
    return <BusinessCard business={item} onPress={() => handleBusinessPress(item)} />;
  }, [activeTab, handleTrailPress, handleBusinessPress]);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* ── Search Bar ── */}
      <View className="px-4 pt-3 pb-2">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search trails, businesses, cities..."
        />
      </View>

      {/* ── Autocomplete Dropdown ── */}
      {showAutocomplete && (
        <View className="mx-4 mb-2 bg-cairn-card border border-cairn-border rounded-xl overflow-hidden z-10">
          {autocompleteResults.map((result, i) => (
            <Pressable
              key={`${result.entity_type}-${result.id}`}
              onPress={() => {
                const route = result.entity_type === 'trail'
                  ? `/(tabs)/explore/trail/${result.slug}`
                  : `/(tabs)/explore/business/${result.slug}`;
                router.push(route);
                setShowAutocomplete(false);
                setSearch('');
              }}
              className={`px-4 py-3 flex-row items-center ${
                i < autocompleteResults.length - 1 ? 'border-b border-cairn-border/30' : ''
              }`}
            >
              <Text className="text-base mr-3">
                {result.entity_type === 'trail' ? '🥾' : '🏪'}
              </Text>
              <View className="flex-1">
                <Text className="text-slate-200 text-sm font-medium" numberOfLines={1}>
                  {result.name}
                </Text>
                {result.city && (
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {result.city}{result.state_province ? `, ${result.state_province}` : ''}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Activity Chips ── */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={activityFilterData}
        keyExtractor={(item) => item.slug ?? 'all'}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedActivity(item.slug === selectedActivity ? null : item.slug)}
            className={`flex-row items-center px-3 py-1.5 rounded-full border ${
              selectedActivity === item.slug
                ? 'bg-canopy/20 border-canopy'
                : 'bg-cairn-card border-cairn-border'
            }`}
          >
            <Text className="text-xs mr-1">{item.emoji}</Text>
            <Text className={`text-xs font-medium ${
              selectedActivity === item.slug ? 'text-canopy' : 'text-slate-400'
            }`}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {/* ── Tabs ── */}
      <View className="flex-row mx-4 mb-2 bg-cairn-card rounded-xl p-1">
        {(['trails', 'businesses'] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === tab ? 'bg-canopy/20' : ''
            }`}
          >
            <Text className={`text-xs font-semibold ${
              activeTab === tab ? 'text-canopy' : 'text-slate-500'
            }`}>
              {tab === 'trails' ? `Trails (${trails.length})` : `Businesses (${businesses.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Active Filter Badge ── */}
      {hasActiveFilters && (
        <Pressable onPress={clearFilters} className="flex-row items-center mx-4 mb-2">
          <View className="flex-row items-center bg-canopy/10 px-3 py-1.5 rounded-full">
            <Text className="text-canopy text-xs mr-1">
              {selectedActivity ? ACTIVITY_TYPES.find((a) => a.slug === selectedActivity)?.label : debouncedSearch}
            </Text>
            <X size={12} color="#10B981" />
          </View>
        </Pressable>
      )}

      {/* ── Results ── */}
      {isLoading ? (
        <View className="px-4 pt-2">
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'trails' ? MapPinIcon : Store}
              title={activeTab === 'trails' ? 'No trails found' : 'No businesses found'}
              description={hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Pull to refresh or search for a location.'}
              actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
