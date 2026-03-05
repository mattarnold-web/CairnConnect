import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Users } from 'lucide-react-native';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { ActivityBoardCard } from '@/components/activity/ActivityBoardCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchActivityPosts } from '@/lib/api';
import { ACTIVITY_TYPES } from '@cairn/shared';
import type { ActivityPost } from '@cairn/shared';

const POST_TYPES = [
  { slug: null, label: 'All', emoji: '\u{1F30D}' },
  { slug: 'im_going', label: "I'm Going", emoji: '\u{1F7E2}' },
  { slug: 'open_permit', label: 'Open Permit', emoji: '\u{1F3AB}' },
  { slug: 'lfg', label: 'LFG', emoji: '\u{1F7E3}' },
];

const ACTIVITY_FILTERS = [
  { slug: null, label: 'All', emoji: undefined },
  { slug: 'mtb', label: 'MTB', emoji: '\u{1F6B5}' },
  { slug: 'hiking', label: 'Hiking', emoji: '\u{1F97E}' },
  { slug: 'climbing', label: 'Climbing', emoji: '\u{1F9D7}' },
  { slug: 'kayaking', label: 'Kayaking', emoji: '\u{1F6F6}' },
  { slug: 'trail_running', label: 'Trail Running', emoji: '\u{1F3C3}' },
];

const SKILL_LEVELS = [
  { slug: null, label: 'All Levels' },
  { slug: 'beginner', label: 'Beginner' },
  { slug: 'intermediate', label: 'Intermediate' },
  { slug: 'advanced', label: 'Advanced' },
  { slug: 'expert', label: 'Expert' },
];

/** Simple debounce hook */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function BoardScreen() {
  const [search, setSearch] = useState('');
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebouncedValue(search, 300);

  // Track whether we've done the initial load
  const isInitialLoad = useRef(true);

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchActivityPosts({
        activityType: selectedActivity ?? undefined,
        skillLevel: selectedSkill ?? undefined,
        postType: selectedPostType ?? undefined,
      });

      // Apply client-side search filter (search is not supported by RPC)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        setPosts(
          data.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              (p.description && p.description.toLowerCase().includes(q)) ||
              (p.location_name && p.location_name.toLowerCase().includes(q)),
          ),
        );
      } else {
        setPosts(data);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [debouncedSearch, selectedPostType, selectedActivity, selectedSkill]);

  // Fetch on mount and when filters change
  useEffect(() => {
    setLoading(true);
    loadPosts();
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const hasActiveFilters = selectedPostType || selectedActivity || selectedSkill || search;

  const clearFilters = () => {
    setSelectedPostType(null);
    setSelectedActivity(null);
    setSelectedSkill(null);
    setSearch('');
  };

  const renderHeader = () => (
    <View>
      {/* Post type filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={POST_TYPES}
        keyExtractor={(item) => item.slug ?? 'all'}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6 }}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            emoji={item.emoji}
            selected={selectedPostType === item.slug}
            onPress={() =>
              setSelectedPostType(
                item.slug === selectedPostType ? null : item.slug,
              )
            }
          />
        )}
      />

      {/* Activity type filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={ACTIVITY_FILTERS}
        keyExtractor={(item) => item.slug ?? 'all-activities'}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
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

      {/* Skill level filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SKILL_LEVELS}
        keyExtractor={(item) => item.slug ?? 'all-levels'}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            selected={selectedSkill === item.slug}
            onPress={() =>
              setSelectedSkill(
                item.slug === selectedSkill ? null : item.slug,
              )
            }
          />
        )}
      />

      {/* Results count */}
      <View className="flex-row items-center justify-between px-4 pb-2">
        <Text className="text-slate-500 text-xs">
          Showing {posts.length} activit{posts.length === 1 ? 'y' : 'ies'}
        </Text>
        {hasActiveFilters && (
          <Pressable onPress={clearFilters}>
            <Text className="text-canopy text-xs font-medium">Clear filters</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="px-4">
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-16 px-8">
        <View className="h-16 w-16 rounded-full bg-cairn-card border border-cairn-border items-center justify-center mb-4">
          <Users size={28} color="#475569" />
        </View>
        <Text className="text-slate-300 font-semibold text-base mb-1 text-center">
          No activities match your filters
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-4">
          Try adjusting your filters to see more results
        </Text>
        {hasActiveFilters && (
          <Pressable
            onPress={clearFilters}
            className="bg-cairn-card border border-cairn-border rounded-xl px-4 py-2"
          >
            <Text className="text-canopy text-sm font-medium">Clear all filters</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-slate-100 font-bold text-2xl">
              Activity Board
            </Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Find partners, share permits, join activities
            </Text>
          </View>
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search posts..."
        />
      </View>

      {/* Posts list with filters as header */}
      <FlatList
        data={loading ? [] : posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View className="px-4">
            <ActivityBoardCard
              post={item}
              onPress={() => router.push(`/(tabs)/board/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(tabs)/board/create')}
        className="absolute bottom-24 right-6 h-14 w-14 rounded-full bg-canopy items-center justify-center shadow-lg"
        style={{
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}
