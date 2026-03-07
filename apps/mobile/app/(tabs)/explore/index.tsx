import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin as MapPinIcon, Store, X } from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { TrailCard } from '@/components/trail/TrailCard';
import { BusinessCard } from '@/components/business/BusinessCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchTrails, fetchBusinesses, autocompleteLocations } from '@/lib/api';
import type { AutocompleteResult } from '@/lib/api';
import { ACTIVITY_TYPES } from '@cairn/shared';
import type { Trail, Business } from '@cairn/shared';

type TabType = 'all' | 'trails' | 'businesses';

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
  const [activeTab, setActiveTab] = useState<TabType>('all');
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

  const activityChips = useMemo(
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
    fetchTrails({ search: debouncedSearch || undefined, activityTypes: selectedActivity ? [selectedActivity] : undefined })
      .then((d) => { if (!cancelled) setTrails(d); })
      .catch(() => { if (!cancelled) setTrails([]); })
      .finally(() => { if (!cancelled) setLoadingTrails(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedActivity]);

  useEffect(() => {
    let cancelled = false;
    setLoadingBusinesses(true);
    fetchBusinesses({ search: debouncedSearch || undefined, activityTypes: selectedActivity ? [selectedActivity] : undefined })
      .then((d) => { if (!cancelled) setBusinesses(d); })
      .catch(() => { if (!cancelled) setBusinesses([]); })
      .finally(() => { if (!cancelled) setLoadingBusinesses(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedActivity]);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setAutocompleteResults([]); setShowAutocomplete(false); return;
    }
    let cancelled = false;
    autocompleteLocations(debouncedSearch, regionLat, regionLng, 6)
      .then((r) => { if (!cancelled) { setAutocompleteResults(r); setShowAutocomplete(r.length > 0); } })
      .catch(() => { if (!cancelled) setAutocompleteResults([]); });
    return () => { cancelled = true; };
  }, [debouncedSearch, regionLat, regionLng]);

  const isLoading = loadingTrails || loadingBusinesses;
  const hasActiveFilters = !!selectedActivity || !!debouncedSearch;

  // Combined results for "All" tab
  type ListItem = { kind: 'trail'; data: Trail } | { kind: 'business'; data: Business } | { kind: 'section'; title: string };
  const combinedData = useMemo((): ListItem[] => {
    if (activeTab === 'trails') return trails.map((t) => ({ kind: 'trail' as const, data: t }));
    if (activeTab === 'businesses') return businesses.map((b) => ({ kind: 'business' as const, data: b }));
    const items: ListItem[] = [];
    if (trails.length > 0) {
      items.push({ kind: 'section', title: `Trails (${trails.length})` });
      trails.slice(0, 20).forEach((t) => items.push({ kind: 'trail', data: t }));
    }
    if (businesses.length > 0) {
      items.push({ kind: 'section', title: `Businesses (${businesses.length})` });
      businesses.slice(0, 10).forEach((b) => items.push({ kind: 'business', data: b }));
    }
    return items;
  }, [activeTab, trails, businesses]);

  const clearFilters = useCallback(() => { setSelectedActivity(null); setSearch(''); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [t, b] = await Promise.all([
        fetchTrails({ search: debouncedSearch || undefined, activityTypes: selectedActivity ? [selectedActivity] : undefined }),
        fetchBusinesses({ search: debouncedSearch || undefined, activityTypes: selectedActivity ? [selectedActivity] : undefined }),
      ]);
      setTrails(t); setBusinesses(b);
    } catch {} finally { setRefreshing(false); }
  }, [debouncedSearch, selectedActivity]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.kind === 'section') {
      return <Text style={s.sectionHeader}>{item.title}</Text>;
    }
    if (item.kind === 'trail') {
      return <TrailCard trail={item.data as Trail} onPress={() => router.push(`/(tabs)/explore/trail/${(item.data as Trail).slug}`)} />;
    }
    return <BusinessCard business={item.data as Business} onPress={() => router.push(`/(tabs)/explore/business/${(item.data as Business).slug}`)} />;
  }, []);

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.kind === 'section') return `section-${item.title}`;
    return (item.data as any).id ?? `item-${index}`;
  }, []);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Search */}
      <View style={s.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search trails, businesses, cities..." />
      </View>

      {/* Autocomplete */}
      {showAutocomplete && (
        <View style={s.autocomplete}>
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
              style={[s.acItem, i < autocompleteResults.length - 1 && s.acItemBorder]}
            >
              <Text style={s.acEmoji}>{result.entity_type === 'trail' ? '🥾' : '🏪'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.acName} numberOfLines={1}>{result.name}</Text>
                {result.city && (
                  <Text style={s.acCity}>{result.city}{result.state_province ? `, ${result.state_province}` : ''}</Text>
                )}
              </View>
              <Text style={s.acType}>{result.entity_type}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Activity Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={activityChips}
        keyExtractor={(item) => item.slug ?? 'all'}
        contentContainerStyle={s.chipRow}
        renderItem={({ item }) => {
          const active = selectedActivity === item.slug;
          return (
            <Pressable
              onPress={() => setSelectedActivity(item.slug === selectedActivity ? null : item.slug)}
              style={[s.chip, active && s.chipActive]}
            >
              <Text style={s.chipEmoji}>{item.emoji}</Text>
              <Text style={[s.chipLabel, active && s.chipLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      {/* Tabs */}
      <View style={s.tabRow}>
        {(['all', 'trails', 'businesses'] as TabType[]).map((tab) => {
          const active = activeTab === tab;
          const label = tab === 'all' ? 'All' : tab === 'trails' ? `Trails (${trails.length})` : `Businesses (${businesses.length})`;
          return (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[s.tab, active && s.tabActive]}>
              <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Active filter badge */}
      {hasActiveFilters && (
        <Pressable onPress={clearFilters} style={s.filterBadgeWrap}>
          <View style={s.filterBadge}>
            <Text style={s.filterBadgeText}>
              {selectedActivity ? ACTIVITY_TYPES.find((a) => a.slug === selectedActivity)?.label : debouncedSearch}
            </Text>
            <X size={14} color="#10B981" />
          </View>
        </Pressable>
      )}

      {/* Results */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
        </View>
      ) : (
        <FlatList
          data={combinedData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'businesses' ? Store : MapPinIcon}
              title="No results found"
              description={hasActiveFilters ? 'Try adjusting your search or filters.' : 'Pull to refresh or search for a location.'}
              actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2B' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  autocomplete: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0F2338', borderColor: '#1E3A5F', borderWidth: 1, borderRadius: 14, overflow: 'hidden', zIndex: 10 },
  acItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  acItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(30,58,95,0.5)' },
  acEmoji: { fontSize: 18, marginRight: 12 },
  acName: { color: '#e2e8f0', fontSize: 14, fontWeight: '500' },
  acCity: { color: '#64748b', fontSize: 11, marginTop: 2 },
  acType: { color: '#475569', fontSize: 10, textTransform: 'uppercase', fontWeight: '600' },
  chipRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1,
    backgroundColor: '#0F2338', borderColor: '#1E3A5F',
  },
  chipActive: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: '#10B981' },
  chipEmoji: { fontSize: 18, marginRight: 8 },
  chipLabel: { fontSize: 14, fontWeight: '500', color: '#cbd5e1' },
  chipLabelActive: { color: '#10B981' },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, backgroundColor: '#0F2338', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(16,185,129,0.15)' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#10B981' },
  filterBadgeWrap: { paddingHorizontal: 16, marginBottom: 8 },
  filterBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' as const },
  filterBadgeText: { color: '#10B981', fontSize: 13, fontWeight: '500', marginRight: 8 },
  sectionHeader: { color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 8 },
});