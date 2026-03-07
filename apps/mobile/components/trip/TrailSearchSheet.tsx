import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Search,
  Mountain,
  TrendingUp,
  MapPin,
} from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import { FilterChip } from '@/components/ui/FilterChip';
import { searchTrailsNear, searchTrailsForTrip, type TripTrailResult } from '@/lib/api';
import type { Trail } from '@cairn/shared';
import type { TripDayItem } from '@/lib/trip-types';

const DIFFICULTY_LABELS: Record<string, string> = {
  green: 'Easy',
  blue: 'Intermediate',
  black: 'Advanced',
  double_black: 'Expert',
  proline: 'Pro Line',
};

const DIFFICULTY_BADGE_VARIANT: Record<string, 'green' | 'blue' | 'black' | 'red' | 'default'> = {
  green: 'green',
  blue: 'blue',
  black: 'black',
  double_black: 'black',
  proline: 'red',
};

interface TrailSearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrail: (item: TripDayItem) => void;
  regionName: string | null;
  regionLat?: number | null;
  regionLng?: number | null;
  selectedActivities: string[];
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

function formatElevation(meters: number): string {
  const feet = meters * 3.281;
  return `${Math.round(feet).toLocaleString()} ft`;
}

export function TrailSearchSheet({
  visible,
  onClose,
  onSelectTrail,
  regionName,
  regionLat,
  regionLng,
  selectedActivities,
}: TrailSearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<(Trail | TripTrailResult)[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(selectedActivities);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setActiveFilters(selectedActivities);
      loadInitialTrails();
    }
  }, [visible]);

  const loadInitialTrails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchTrailsForTrip({
        query: '',
        lat: regionLat ?? undefined,
        lng: regionLng ?? undefined,
        radiusKm: 50,
        activityTypes: selectedActivities.length > 0 ? selectedActivities : undefined,
        limit: 30,
      });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [regionName, regionLat, regionLng, selectedActivities]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => performSearch(text, activeFilters), 300);
  };

  const performSearch = async (query: string, filters: string[]) => {
    setLoading(true);
    try {
      const data = await searchTrailsForTrip({
        query,
        lat: regionLat ?? undefined,
        lng: regionLng ?? undefined,
        radiusKm: 50,
        activityTypes: filters.length > 0 ? filters : undefined,
        limit: 30,
      });
      setResults(data);
    } catch {
      // Keep current results
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (slug: string) => {
    const newFilters = activeFilters.includes(slug)
      ? activeFilters.filter((f) => f !== slug)
      : [...activeFilters, slug];
    setActiveFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };

  const handleSelectTrail = (trail: Trail) => {
    const item: TripDayItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'trail',
      trailId: trail.id,
      trailName: trail.name,
      customTitle: null,
      customActivityType: null,
      notes: '',
      timeSlot: null,
    };
    onSelectTrail(item);
    onClose();
  };

  const renderTrailItem = ({ item }: { item: Trail }) => {
    const diffLabel = DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty;
    const diffVariant = DIFFICULTY_BADGE_VARIANT[item.difficulty] ?? 'default';

    return (
      <Pressable
        onPress={() => handleSelectTrail(item)}
        className="bg-cairn-card border border-cairn-border rounded-xl p-3 mb-2 mx-4 active:bg-cairn-card-hover"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-slate-100 font-semibold text-sm" numberOfLines={1}>
              {item.name}
            </Text>
            {item.city && (
              <View className="flex-row items-center mt-0.5">
                <MapPin size={10} color="#64748b" />
                <Text className="text-slate-500 text-[10px] ml-0.5">
                  {item.city}{item.state_province ? `, ${item.state_province}` : ''}
                </Text>
              </View>
            )}
          </View>
          <Badge label={diffLabel} variant={diffVariant} />
        </View>

        <View className="flex-row items-center gap-3 mt-2">
          <View className="flex-row items-center">
            <Mountain size={12} color="#10B981" />
            <Text className="text-slate-400 text-xs ml-1">
              {formatDistance(item.distance_meters)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TrendingUp size={12} color="#10B981" />
            <Text className="text-slate-400 text-xs ml-1">
              {formatElevation(item.elevation_gain_meters)}
            </Text>
          </View>
          {item.rating > 0 && (
            <Text className="text-amber-400 text-xs">
              {'\u2605'} {item.rating.toFixed(1)}
            </Text>
          )}
        </View>

        {item.activity_types.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {item.activity_types.slice(0, 3).map((at) => (
              <View
                key={at}
                className="bg-cairn-elevated rounded-full px-2 py-0.5"
              >
                <Text className="text-slate-500 text-[9px]">{at}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
          <View className="flex-1">
            <Text className="text-slate-100 font-semibold text-base">
              Add Trail
            </Text>
            {regionName && (
              <Text className="text-slate-500 text-xs">
                Searching in {regionName}
              </Text>
            )}
          </View>
          <Pressable
            onPress={onClose}
            className="h-8 w-8 rounded-full bg-cairn-card items-center justify-center"
          >
            <X size={18} color="#94a3b8" />
          </Pressable>
        </View>

        {/* Search bar */}
        <View className="px-4 pt-3 pb-2">
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-3 h-11">
            <Search size={16} color="#64748b" />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search trails..."
              placeholderTextColor="#475569"
              style={searchStyles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Activity type filter chips */}
        {selectedActivities.length > 0 && (
          <View className="px-4 pb-2">
            <View className="flex-row flex-wrap gap-1.5">
              {selectedActivities.map((slug) => (
                <FilterChip
                  key={slug}
                  label={slug}
                  selected={activeFilters.includes(slug)}
                  onPress={() => toggleFilter(slug)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#10B981" />
            <Text className="text-slate-500 text-xs mt-2">Searching trails...</Text>
          </View>
        ) : results.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Mountain size={32} color="#475569" />
            <Text className="text-slate-400 text-sm font-semibold mt-3">
              No trails found
            </Text>
            <Text className="text-slate-500 text-xs text-center mt-1">
              Try a different search term or adjust your filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={results as any[]}
            renderItem={renderTrailItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const searchStyles = StyleSheet.create({
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#f1f5f9',
  },
});
