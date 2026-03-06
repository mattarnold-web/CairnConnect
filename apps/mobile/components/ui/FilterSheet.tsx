import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { X, SlidersHorizontal } from 'lucide-react-native';
import { FilterChip } from './FilterChip';
import { Button } from './Button';
import { ACTIVITY_TYPES } from '@cairn/shared';

const DIFFICULTY_OPTIONS = [
  { slug: 'green', label: 'Easy', emoji: '\u{1F7E2}' },
  { slug: 'blue', label: 'Moderate', emoji: '\u{1F535}' },
  { slug: 'black', label: 'Hard', emoji: '\u26AB' },
  { slug: 'double_black', label: 'Expert', emoji: '\u{25AA}\u{FE0F}\u{25AA}\u{FE0F}' },
];

export interface FilterState {
  activityTypes: string[];
  difficulty: string | null;
}

interface FilterSheetProps {
  visible: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

export function FilterSheet({
  visible,
  filters,
  onApply,
  onClose,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleOpen = useCallback(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleActivity = (slug: string) => {
    setLocalFilters((prev) => {
      const has = prev.activityTypes.includes(slug);
      return {
        ...prev,
        activityTypes: has
          ? prev.activityTypes.filter((s) => s !== slug)
          : [...prev.activityTypes, slug],
      };
    });
  };

  const setDifficulty = (slug: string | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty === slug ? null : slug,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const empty: FilterState = { activityTypes: [], difficulty: null };
    setLocalFilters(empty);
    onApply(empty);
    onClose();
  };

  const activeCount =
    localFilters.activityTypes.length + (localFilters.difficulty ? 1 : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onShow={handleOpen}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Sheet */}
        <View className="bg-cairn-bg border-t border-cairn-border rounded-t-3xl px-4 pt-4 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-slate-100 font-bold text-lg">Filters</Text>
            <Pressable onPress={onClose} className="p-1">
              <X size={20} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Activity Types */}
          <Text className="text-slate-300 font-semibold text-sm mb-3">
            Activity Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {ACTIVITY_TYPES.slice(0, 10).map((at) => (
              <FilterChip
                key={at.slug}
                label={at.label}
                emoji={at.emoji}
                selected={localFilters.activityTypes.includes(at.slug)}
                onPress={() => toggleActivity(at.slug)}
              />
            ))}
          </View>

          {/* Difficulty */}
          <Text className="text-slate-300 font-semibold text-sm mb-3">
            Difficulty
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {DIFFICULTY_OPTIONS.map((d) => (
              <FilterChip
                key={d.slug}
                label={d.label}
                emoji={d.emoji}
                selected={localFilters.difficulty === d.slug}
                onPress={() => setDifficulty(d.slug)}
              />
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              onPress={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button size="lg" onPress={handleApply} className="flex-1">
              {`Apply${activeCount > 0 ? ` (${activeCount})` : ''}`}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Small trigger button for the filter sheet */
export function FilterButton({
  activeCount,
  onPress,
}: {
  activeCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-xl px-3 py-2 border ${
        activeCount > 0
          ? 'bg-canopy/15 border-canopy/30'
          : 'bg-cairn-card border-cairn-border'
      }`}
    >
      <SlidersHorizontal
        size={14}
        color={activeCount > 0 ? '#10B981' : '#64748b'}
      />
      <Text
        className={`text-xs font-medium ml-1.5 ${
          activeCount > 0 ? 'text-canopy' : 'text-slate-400'
        }`}
      >
        Filter{activeCount > 0 ? ` (${activeCount})` : ''}
      </Text>
    </Pressable>
  );
}
