import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Plus,
  Trash2,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Mountain,
  DollarSign,
  Shield,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FilterChip } from '@/components/ui/FilterChip';
import { ActivityIcon } from '@/components/ui/ActivityIcon';
import { AccommodationLinks } from '@/components/ui/AccommodationLinks';
import { useTripContext } from '@/lib/trip-context';
import { MOCK_REGIONS, MOCK_TRAILS } from '@/lib/mock-data';
import { ACTIVITY_TYPES } from '@cairn/shared';
import { encodeTripState } from '@/lib/trip-share';
import { estimateTripCost } from '@/lib/trip-cost';
import {
  generateSuggestions,
  SUGGESTION_CATEGORY_ORDER,
  SUGGESTION_CATEGORY_LABELS,
} from '@/lib/trip-suggestions';
import type { TripStep, TripDayItem } from '@/lib/trip-types';

const STEPS: { key: TripStep; label: string; number: number }[] = [
  { key: 'region', label: 'Region', number: 1 },
  { key: 'activities', label: 'Activities', number: 2 },
  { key: 'itinerary', label: 'Itinerary', number: 3 },
  { key: 'summary', label: 'Summary', number: 4 },
];

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', emoji: '\u{1F305}' },
  { value: 'midday', label: 'Midday', emoji: '\u2600\uFE0F' },
  { value: 'afternoon', label: 'Afternoon', emoji: '\u{1F324}\uFE0F' },
  { value: 'evening', label: 'Evening', emoji: '\u{1F307}' },
] as const;

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

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

const UNIT_LABELS: Record<string, string> = {
  per_person: '/person',
  per_group: '/group',
  flat: '',
};

export default function TripScreen() {
  const { state, dispatch } = useTripContext();
  const currentStepIndex = STEPS.findIndex((s) => s.key === state.currentStep);
  const [addingToDayId, setAddingToDayId] = useState<string | null>(null);
  const [customActivityTitle, setCustomActivityTitle] = useState('');
  const [expandedDayId, setExpandedDayId] = useState<string | null>(state.days[0]?.id ?? null);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      dispatch({ type: 'SET_STEP', step: STEPS[currentStepIndex + 1].key });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      dispatch({ type: 'SET_STEP', step: STEPS[currentStepIndex - 1].key });
    }
  };

  const handleShare = async () => {
    const encoded = encodeTripState(state);
    await Share.share({
      message: `Check out my trip on Cairn Connect!\n\ncairnconnect://trip?code=${encoded}`,
    });
  };

  // Trail suggestions based on region and selected activities
  const trailSuggestions = useMemo(() => {
    if (!state.region) return [];
    return MOCK_TRAILS.filter((trail) => {
      // Match region by city name
      if (trail.city.toLowerCase() !== state.region!.name.toLowerCase()) return false;
      // If activities selected, match at least one
      if (state.selectedActivities.length > 0) {
        return trail.activity_types.some((at: string) =>
          state.selectedActivities.includes(at),
        );
      }
      return true;
    });
  }, [state.region, state.selectedActivities]);

  // Smart suggestions
  const smartSuggestions = useMemo(() => generateSuggestions(state), [state]);

  // Cost estimate
  const costEstimate = useMemo(() => estimateTripCost(state), [state]);

  // Trip stats for summary
  const tripStats = useMemo(() => {
    let totalTrails = 0;
    let totalDistance = 0;
    let totalElevation = 0;
    let totalDuration = 0;

    for (const day of state.days) {
      for (const item of day.items) {
        if (item.type === 'trail' && item.trailId) {
          const trail = MOCK_TRAILS.find((t) => t.id === item.trailId);
          if (trail) {
            totalTrails++;
            totalDistance += trail.distance_meters;
            totalElevation += trail.elevation_gain_meters;
            totalDuration += trail.estimated_duration_minutes ?? 0;
          }
        }
      }
    }

    return { totalTrails, totalDistance, totalElevation, totalDuration };
  }, [state.days]);

  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  };

  const formatElevation = (meters: number) => {
    const feet = meters * 3.281;
    return `${Math.round(feet).toLocaleString()} ft`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const addTrailToDay = (dayId: string, trail: (typeof MOCK_TRAILS)[number]) => {
    const item: TripDayItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'trail',
      trailId: trail.id,
      customTitle: null,
      customActivityType: null,
      notes: '',
      timeSlot: null,
    };
    dispatch({ type: 'ADD_ITEM_TO_DAY', dayId, item });
    setAddingToDayId(null);
  };

  const addCustomActivity = (dayId: string) => {
    if (!customActivityTitle.trim()) return;
    const item: TripDayItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'custom',
      trailId: null,
      customTitle: customActivityTitle.trim(),
      customActivityType: state.selectedActivities[0] ?? 'hiking',
      notes: '',
      timeSlot: null,
    };
    dispatch({ type: 'ADD_ITEM_TO_DAY', dayId, item });
    setCustomActivityTitle('');
    setAddingToDayId(null);
  };

  const hasAnyItems = state.days.some((d) => d.items.length > 0);

  // Group suggestions by category for summary
  const groupedSuggestions = useMemo(() => {
    return SUGGESTION_CATEGORY_ORDER.map((category) => ({
      category,
      label: SUGGESTION_CATEGORY_LABELS[category],
      items: smartSuggestions.filter((s) => s.category === category),
    })).filter((g) => g.items.length > 0);
  }, [smartSuggestions]);

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-slate-100 font-bold text-2xl">Trip Planner</Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          Plan your perfect outdoor adventure
        </Text>
      </View>

      {/* Step indicator */}
      <View className="flex-row px-4 mb-4 mt-1">
        {STEPS.map((step, i) => (
          <View key={step.key} className="flex-row items-center flex-1">
            <View className="items-center">
              <View
                className={`h-8 w-8 rounded-full items-center justify-center ${
                  i === currentStepIndex
                    ? 'bg-canopy'
                    : i < currentStepIndex
                      ? 'bg-canopy/20'
                      : 'bg-cairn-elevated'
                }`}
              >
                {i < currentStepIndex ? (
                  <Check size={14} color="#10B981" />
                ) : (
                  <Text
                    className={`text-xs font-bold ${
                      i <= currentStepIndex ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                className={`text-[10px] font-medium mt-1 ${
                  i === currentStepIndex
                    ? 'text-canopy'
                    : i < currentStepIndex
                      ? 'text-canopy/70'
                      : 'text-slate-500'
                }`}
              >
                {step.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View
                className={`flex-1 h-0.5 mx-1 mt-[-12px] ${
                  i < currentStepIndex ? 'bg-canopy/30' : 'bg-cairn-border'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        {/* ============================================================ */}
        {/* Step 1: Region */}
        {/* ============================================================ */}
        {state.currentStep === 'region' && (
          <View>
            <Text className="text-slate-100 font-semibold text-lg mb-1">
              Choose a Region
            </Text>
            <Text className="text-slate-500 text-sm mb-4">
              Select where you want to explore
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {MOCK_REGIONS.map((region) => (
                <Pressable
                  key={region.slug}
                  onPress={() => {
                    dispatch({ type: 'SET_REGION', region });
                    handleNext();
                  }}
                  className={`bg-cairn-card border rounded-2xl p-4 w-[47%] active:bg-cairn-card-hover ${
                    state.region?.slug === region.slug
                      ? 'border-canopy'
                      : 'border-cairn-border'
                  }`}
                >
                  <Text className="text-3xl mb-2">{region.coverEmoji}</Text>
                  <Text className="text-slate-100 font-semibold text-sm">
                    {region.name}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    {region.state_province}, {region.country}
                  </Text>
                  {region.hasData ? (
                    <View className="flex-row items-center mt-2 gap-2">
                      <View className="flex-row items-center">
                        <Mountain size={10} color="#10B981" />
                        <Text className="text-canopy text-[10px] font-medium ml-0.5">
                          {region.trailCount} trails
                        </Text>
                      </View>
                      <Text className="text-slate-600 text-[10px]">{'\u2022'}</Text>
                      <Text className="text-slate-500 text-[10px]">
                        {region.businessCount} biz
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-slate-600 text-[10px] mt-2 italic">
                      Coming soon
                    </Text>
                  )}
                  {region.description && (
                    <Text
                      className="text-slate-500 text-[10px] mt-1 leading-3"
                      numberOfLines={2}
                    >
                      {region.description}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* Step 2: Activities */}
        {/* ============================================================ */}
        {state.currentStep === 'activities' && (
          <View>
            <Text className="text-slate-100 font-semibold text-lg mb-1">
              What activities are you planning?
            </Text>
            <Text className="text-slate-500 text-sm mb-4">
              Select one or more activities
              {state.selectedActivities.length > 0 && (
                <Text className="text-canopy">
                  {' '}{'\u2022'} {state.selectedActivities.length} selected
                </Text>
              )}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {ACTIVITY_TYPES.map((at) => {
                const isSelected = state.selectedActivities.includes(at.slug);
                return (
                  <Pressable
                    key={at.slug}
                    onPress={() =>
                      dispatch({ type: 'TOGGLE_ACTIVITY', activitySlug: at.slug })
                    }
                    className={`bg-cairn-card border rounded-2xl p-3 items-center w-[30%] ${
                      isSelected
                        ? 'border-canopy bg-canopy/10'
                        : 'border-cairn-border'
                    }`}
                  >
                    <Text className="text-2xl">{at.emoji}</Text>
                    <Text
                      className={`text-xs text-center mt-1 font-medium ${
                        isSelected ? 'text-canopy' : 'text-slate-300'
                      }`}
                      numberOfLines={1}
                    >
                      {at.label}
                    </Text>
                    {isSelected && (
                      <View className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-canopy items-center justify-center">
                        <Check size={10} color="white" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ============================================================ */}
        {/* Step 3: Itinerary */}
        {/* ============================================================ */}
        {state.currentStep === 'itinerary' && (
          <View>
            <Text className="text-slate-100 font-semibold text-lg mb-1">
              Build Your Itinerary
            </Text>
            <Text className="text-slate-500 text-sm mb-4">
              {state.region?.name ? `Plan your ${state.region.name} trip` : 'Add activities to your days'}
            </Text>

            {/* Trip name and date row */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">Trip Name</Text>
                <TextInput
                  value={state.tripName}
                  onChangeText={(name) => dispatch({ type: 'SET_TRIP_NAME', name })}
                  placeholder={`My ${state.region?.name ?? ''} Trip`}
                  placeholderTextColor="#475569"
                  className="bg-cairn-card border border-cairn-border rounded-xl h-10 px-3 text-sm text-slate-100"
                />
              </View>
              <View className="w-32">
                <Text className="text-slate-400 text-xs mb-1">Start Date</Text>
                <TextInput
                  value={state.startDate ?? ''}
                  onChangeText={(date) => {
                    if (date) dispatch({ type: 'SET_START_DATE', date });
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#475569"
                  className="bg-cairn-card border border-cairn-border rounded-xl h-10 px-3 text-sm text-slate-100"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* Day cards */}
            {state.days.map((day) => {
              const isExpanded = expandedDayId === day.id;
              return (
                <Card key={day.id} className="mb-3">
                  {/* Day header */}
                  <Pressable
                    onPress={() => setExpandedDayId(isExpanded ? null : day.id)}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="h-6 w-6 rounded-full bg-canopy/20 items-center justify-center mr-2">
                        <Text className="text-canopy text-xs font-bold">{day.dayNumber}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-100 font-semibold text-sm">
                          Day {day.dayNumber}
                          {day.label ? ` \u2014 ${day.label}` : ''}
                        </Text>
                        {day.date && (
                          <Text className="text-slate-500 text-[10px]">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-slate-500 text-xs">
                          {day.items.length} activit{day.items.length === 1 ? 'y' : 'ies'}
                        </Text>
                        {state.days.length > 1 && (
                          <Pressable
                            onPress={() =>
                              dispatch({ type: 'REMOVE_DAY', dayId: day.id })
                            }
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </Pressable>
                        )}
                        {isExpanded ? (
                          <ChevronUp size={16} color="#64748b" />
                        ) : (
                          <ChevronDown size={16} color="#64748b" />
                        )}
                      </View>
                    </View>
                  </Pressable>

                  {/* Day label input */}
                  {isExpanded && (
                    <View className="mt-3">
                      <TextInput
                        value={day.label}
                        onChangeText={(label) =>
                          dispatch({ type: 'UPDATE_DAY_LABEL', dayId: day.id, label })
                        }
                        placeholder="Label this day (optional)..."
                        placeholderTextColor="#475569"
                        className="bg-cairn-bg border border-cairn-border rounded-lg h-8 px-3 text-xs text-slate-300 mb-3"
                      />

                      {/* Time slot sections */}
                      {TIME_SLOTS.map((slot) => {
                        const slotItems = day.items.filter(
                          (item) => item.timeSlot === slot.value,
                        );
                        const unslottedItems =
                          slot.value === 'morning'
                            ? day.items.filter((item) => !item.timeSlot)
                            : [];
                        const allItems = [...slotItems, ...unslottedItems];

                        return (
                          <View key={slot.value} className="mb-3">
                            <View className="flex-row items-center mb-1.5">
                              <Text className="text-sm mr-1">{slot.emoji}</Text>
                              <Text className="text-slate-400 text-xs font-medium">
                                {slot.label}
                              </Text>
                            </View>
                            {allItems.length > 0 ? (
                              allItems.map((item) => {
                                const trail =
                                  item.type === 'trail'
                                    ? MOCK_TRAILS.find((t) => t.id === item.trailId)
                                    : null;
                                return (
                                  <View
                                    key={item.id}
                                    className="flex-row items-center justify-between py-2 px-2 bg-cairn-bg/50 rounded-lg mb-1"
                                  >
                                    <View className="flex-1 mr-2">
                                      <Text className="text-slate-300 text-sm" numberOfLines={1}>
                                        {trail?.name ?? item.customTitle ?? 'Activity'}
                                      </Text>
                                      {trail && (
                                        <View className="flex-row items-center gap-2 mt-0.5">
                                          <Badge
                                            label={DIFFICULTY_LABELS[trail.difficulty] ?? trail.difficulty}
                                            variant={DIFFICULTY_BADGE_VARIANT[trail.difficulty] ?? 'default'}
                                          />
                                          <Text className="text-slate-500 text-[10px]">
                                            {formatDistance(trail.distance_meters)}
                                          </Text>
                                        </View>
                                      )}
                                    </View>
                                    {/* Time slot picker */}
                                    <View className="flex-row items-center gap-1">
                                      {!item.timeSlot && (
                                        <Pressable
                                          onPress={() =>
                                            dispatch({
                                              type: 'UPDATE_ITEM_TIME_SLOT',
                                              dayId: day.id,
                                              itemId: item.id,
                                              timeSlot: slot.value as TripDayItem['timeSlot'],
                                            })
                                          }
                                          className="bg-canopy/10 rounded px-1.5 py-0.5"
                                        >
                                          <Text className="text-canopy text-[10px]">Set</Text>
                                        </Pressable>
                                      )}
                                      <Pressable
                                        onPress={() =>
                                          dispatch({
                                            type: 'REMOVE_ITEM_FROM_DAY',
                                            dayId: day.id,
                                            itemId: item.id,
                                          })
                                        }
                                      >
                                        <Trash2 size={12} color="#64748b" />
                                      </Pressable>
                                    </View>
                                  </View>
                                );
                              })
                            ) : (
                              <Text className="text-slate-600 text-[10px] italic px-2 py-1">
                                No activities
                              </Text>
                            )}
                          </View>
                        );
                      })}

                      {/* Add activity section */}
                      {addingToDayId === day.id ? (
                        <View className="mt-2 border-t border-cairn-border pt-3">
                          {/* Trail suggestions */}
                          {trailSuggestions.length > 0 && (
                            <View className="mb-3">
                              <Text className="text-slate-400 text-xs font-medium mb-2">
                                Trail Suggestions
                              </Text>
                              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-2">
                                  {trailSuggestions.map((trail) => (
                                    <Pressable
                                      key={trail.id}
                                      onPress={() => addTrailToDay(day.id, trail)}
                                      className="bg-cairn-bg border border-cairn-border rounded-xl p-3 w-40"
                                    >
                                      <Text className="text-slate-200 text-xs font-semibold" numberOfLines={1}>
                                        {trail.name}
                                      </Text>
                                      <View className="flex-row items-center gap-1 mt-1">
                                        <Badge
                                          label={DIFFICULTY_LABELS[trail.difficulty] ?? trail.difficulty}
                                          variant={DIFFICULTY_BADGE_VARIANT[trail.difficulty] ?? 'default'}
                                        />
                                      </View>
                                      <View className="flex-row items-center gap-2 mt-1">
                                        <Text className="text-slate-500 text-[10px]">
                                          {formatDistance(trail.distance_meters)}
                                        </Text>
                                        <Text className="text-slate-600 text-[10px]">{'\u2022'}</Text>
                                        <Text className="text-slate-500 text-[10px]">
                                          {formatDuration(trail.estimated_duration_minutes)}
                                        </Text>
                                      </View>
                                    </Pressable>
                                  ))}
                                </View>
                              </ScrollView>
                            </View>
                          )}

                          {/* Custom activity */}
                          <Text className="text-slate-400 text-xs font-medium mb-1">
                            Or add a custom activity
                          </Text>
                          <View className="flex-row gap-2">
                            <TextInput
                              value={customActivityTitle}
                              onChangeText={setCustomActivityTitle}
                              placeholder="e.g., Lunch at Red Rock Bakery"
                              placeholderTextColor="#475569"
                              className="flex-1 bg-cairn-bg border border-cairn-border rounded-lg h-9 px-3 text-xs text-slate-100"
                              onSubmitEditing={() => addCustomActivity(day.id)}
                              returnKeyType="done"
                            />
                            <Pressable
                              onPress={() => addCustomActivity(day.id)}
                              className="h-9 px-3 bg-canopy rounded-lg items-center justify-center"
                            >
                              <Text className="text-white text-xs font-medium">Add</Text>
                            </Pressable>
                          </View>
                          <Pressable
                            onPress={() => {
                              setAddingToDayId(null);
                              setCustomActivityTitle('');
                            }}
                            className="mt-2 items-center"
                          >
                            <Text className="text-slate-500 text-xs">Cancel</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => setAddingToDayId(day.id)}
                          className="flex-row items-center justify-center mt-2 py-2 bg-canopy/5 border border-dashed border-canopy/30 rounded-xl"
                        >
                          <Plus size={14} color="#10B981" />
                          <Text className="text-canopy text-xs font-medium ml-1">
                            Add Activity
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </Card>
              );
            })}

            {/* Add day button */}
            <Pressable
              onPress={() => dispatch({ type: 'ADD_DAY' })}
              className="flex-row items-center justify-center py-3 mb-4"
            >
              <Plus size={16} color="#10B981" />
              <Text className="text-canopy text-sm font-medium ml-1">Add Day</Text>
            </Pressable>

            {/* Smart suggestions */}
            {smartSuggestions.length > 0 && (
              <View className="mb-4">
                <Text className="text-slate-100 font-semibold text-sm mb-2">
                  Smart Suggestions
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {smartSuggestions.slice(0, 5).map((suggestion) => (
                      <Card key={suggestion.id} className="w-56">
                        <View className="flex-row items-start">
                          <Text className="text-lg mr-2">{suggestion.emoji}</Text>
                          <View className="flex-1">
                            <Text className="text-slate-200 text-xs font-semibold" numberOfLines={1}>
                              {suggestion.title}
                            </Text>
                            <Text className="text-slate-500 text-[10px]" numberOfLines={1}>
                              {suggestion.subtitle}
                            </Text>
                            <Text className="text-slate-400 text-[10px] mt-1" numberOfLines={2}>
                              {suggestion.reason}
                            </Text>
                            {suggestion.specialOffer && (
                              <View className="mt-1 bg-amber-500/10 rounded px-1.5 py-0.5 self-start">
                                <Text className="text-amber-400 text-[9px] font-medium">
                                  {suggestion.specialOffer}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* ============================================================ */}
        {/* Step 4: Summary */}
        {/* ============================================================ */}
        {state.currentStep === 'summary' && (
          <View>
            {/* Trip name */}
            <TextInput
              value={state.tripName}
              onChangeText={(name) => dispatch({ type: 'SET_TRIP_NAME', name })}
              placeholder={`My ${state.region?.name ?? ''} Trip`}
              placeholderTextColor="#475569"
              className="bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 text-base text-slate-100 font-semibold mb-4"
            />

            {/* Destination */}
            {state.region && (
              <Card className="mb-3">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{state.region.coverEmoji}</Text>
                  <View>
                    <Text className="text-slate-500 text-xs">Destination</Text>
                    <Text className="text-slate-100 font-semibold">
                      {state.region.name}
                    </Text>
                    <Text className="text-slate-500 text-xs">
                      {state.region.state_province}, {state.region.country}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Activities */}
            <Card className="mb-3">
              <Text className="text-slate-500 text-xs mb-2">Activities</Text>
              <View className="flex-row flex-wrap gap-2">
                {state.selectedActivities.map((slug) => {
                  const at = ACTIVITY_TYPES.find((a) => a.slug === slug);
                  return (
                    <View
                      key={slug}
                      className="flex-row items-center bg-cairn-elevated rounded-full px-2.5 py-1"
                    >
                      <Text className="text-sm mr-1">{at?.emoji}</Text>
                      <Text className="text-slate-300 text-xs">{at?.label}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Stats grid */}
            <View className="flex-row gap-3 mb-3">
              <Card className="flex-1">
                <Text className="text-canopy font-bold text-lg">{state.days.length}</Text>
                <Text className="text-slate-500 text-[10px]">Trip Days</Text>
              </Card>
              <Card className="flex-1">
                <Text className="text-canopy font-bold text-lg">{tripStats.totalTrails}</Text>
                <Text className="text-slate-500 text-[10px]">Trails</Text>
              </Card>
              {tripStats.totalDistance > 0 && (
                <Card className="flex-1">
                  <Text className="text-canopy font-bold text-lg">
                    {formatDistance(tripStats.totalDistance)}
                  </Text>
                  <Text className="text-slate-500 text-[10px]">Distance</Text>
                </Card>
              )}
            </View>

            {tripStats.totalElevation > 0 && (
              <View className="flex-row gap-3 mb-3">
                <Card className="flex-1">
                  <Text className="text-canopy font-bold text-lg">
                    {formatElevation(tripStats.totalElevation)}
                  </Text>
                  <Text className="text-slate-500 text-[10px]">Elevation Gain</Text>
                </Card>
                {tripStats.totalDuration > 0 && (
                  <Card className="flex-1">
                    <Text className="text-canopy font-bold text-lg">
                      {formatDuration(tripStats.totalDuration)}
                    </Text>
                    <Text className="text-slate-500 text-[10px]">Est. Time</Text>
                  </Card>
                )}
              </View>
            )}

            {/* Day-by-day breakdown */}
            <Text className="text-slate-100 font-semibold text-sm mb-2">Day-by-Day</Text>
            {state.days.map((day) => (
              <Card key={day.id} className="mb-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-slate-100 font-semibold text-sm">
                    Day {day.dayNumber}
                    {day.label && (
                      <Text className="text-slate-400 font-normal"> \u2014 {day.label}</Text>
                    )}
                  </Text>
                  {day.date && (
                    <Text className="text-slate-500 text-xs">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </View>

                {day.items.length === 0 ? (
                  <Text className="text-slate-500 text-xs italic">No activities planned</Text>
                ) : (
                  <View className="gap-2">
                    {day.items.map((item) => {
                      if (item.type === 'trail' && item.trailId) {
                        const trail = MOCK_TRAILS.find((t) => t.id === item.trailId);
                        if (!trail) return null;
                        return (
                          <View
                            key={item.id}
                            className="flex-row items-start gap-2 p-2 bg-cairn-bg/50 rounded-lg"
                          >
                            <View
                              className="h-2.5 w-2.5 rounded-full mt-1.5"
                              style={{
                                backgroundColor:
                                  trail.difficulty === 'green'
                                    ? '#10B981'
                                    : trail.difficulty === 'blue'
                                      ? '#3B82F6'
                                      : trail.difficulty === 'double_black'
                                        ? '#111827'
                                        : trail.difficulty === 'proline'
                                          ? '#7C3AED'
                                          : '#6B7280',
                              }}
                            />
                            <View className="flex-1">
                              <Text className="text-slate-200 text-xs font-medium">
                                {trail.name}
                              </Text>
                              <View className="flex-row items-center gap-1 mt-0.5">
                                <Text className="text-slate-500 text-[10px]">
                                  {DIFFICULTY_LABELS[trail.difficulty]}
                                </Text>
                                <Text className="text-slate-600 text-[10px]">{'\u2022'}</Text>
                                <Text className="text-slate-500 text-[10px]">
                                  {formatDistance(trail.distance_meters)}
                                </Text>
                                {item.timeSlot && (
                                  <>
                                    <Text className="text-slate-600 text-[10px]">{'\u2022'}</Text>
                                    <Text className="text-canopy text-[10px]">
                                      {TIME_SLOT_LABELS[item.timeSlot]}
                                    </Text>
                                  </>
                                )}
                              </View>
                              {item.notes ? (
                                <Text className="text-slate-400 text-[10px] italic mt-0.5">
                                  {item.notes}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      }

                      if (item.type === 'custom') {
                        return (
                          <View
                            key={item.id}
                            className="flex-row items-start gap-2 p-2 bg-cairn-bg/50 rounded-lg"
                          >
                            <ActivityIcon
                              activitySlug={item.customActivityType || ''}
                              size="sm"
                            />
                            <View className="flex-1">
                              <Text className="text-slate-200 text-xs font-medium">
                                {item.customTitle || 'Custom Activity'}
                              </Text>
                              {item.timeSlot && (
                                <Text className="text-canopy text-[10px] mt-0.5">
                                  {TIME_SLOT_LABELS[item.timeSlot]}
                                </Text>
                              )}
                              {item.notes ? (
                                <Text className="text-slate-400 text-[10px] italic mt-0.5">
                                  {item.notes}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      }

                      return null;
                    })}
                  </View>
                )}
              </Card>
            ))}

            {/* Cost breakdown */}
            {(costEstimate.items.length > 0 || costEstimate.permitCosts > 0) && (
              <Card className="mb-3">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="h-7 w-7 rounded-lg bg-canopy/15 items-center justify-center">
                    <DollarSign size={14} color="#10B981" />
                  </View>
                  <Text className="text-slate-100 font-semibold text-sm">
                    Estimated Costs
                  </Text>
                </View>

                {/* Group by category */}
                {(() => {
                  const grouped = new Map<string, typeof costEstimate.items>();
                  for (const item of costEstimate.items) {
                    const existing = grouped.get(item.category) || [];
                    existing.push(item);
                    grouped.set(item.category, existing);
                  }
                  return Array.from(grouped.entries()).map(([category, items]) => (
                    <View key={category} className="mb-2">
                      <Text className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                        {category}
                      </Text>
                      {items.map((item, i) => (
                        <View key={i} className="flex-row items-center justify-between py-0.5">
                          <Text className="text-slate-300 text-xs flex-1" numberOfLines={1}>
                            {item.label}
                          </Text>
                          <Text className="text-slate-400 text-xs ml-2">
                            ${item.min}-${item.max}
                            <Text className="text-slate-500 text-[10px]">
                              {UNIT_LABELS[item.unit] || ''}
                            </Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  ));
                })()}

                {costEstimate.permitCosts > 0 && (
                  <View className="mb-2">
                    <Text className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      Permits
                    </Text>
                    <View className="flex-row items-center justify-between py-0.5">
                      <Text className="text-slate-300 text-xs">Trail Permits</Text>
                      <Text className="text-slate-400 text-xs">${costEstimate.permitCosts}</Text>
                    </View>
                  </View>
                )}

                <View className="border-t border-cairn-border mt-2 pt-2 flex-row items-center justify-between">
                  <Text className="text-slate-100 font-semibold text-sm">
                    Estimated Total
                  </Text>
                  <Text className="text-canopy font-bold text-base">
                    ${costEstimate.totalMin}-${costEstimate.totalMax}
                  </Text>
                </View>

                <Text className="text-slate-600 text-[9px] mt-2">
                  Estimates based on typical pricing. Actual costs may vary.
                </Text>
              </Card>
            )}

            {/* Permit alerts */}
            {smartSuggestions.some((s) => s.category === 'permit_alert') && (
              <Card className="mb-3 border-amber-500/30">
                <View className="flex-row items-center mb-2">
                  <Shield size={16} color="#f59e0b" />
                  <Text className="text-amber-400 font-semibold text-sm ml-2">
                    Permit Alerts
                  </Text>
                </View>
                {smartSuggestions
                  .filter((s) => s.category === 'permit_alert')
                  .map((s) => (
                    <View key={s.id} className="mb-1.5">
                      <Text className="text-slate-300 text-xs font-medium">{s.title}</Text>
                      <Text className="text-slate-500 text-[10px]">{s.reason}</Text>
                    </View>
                  ))}
              </Card>
            )}

            {/* Recommended services */}
            {groupedSuggestions.filter((g) => g.category !== 'permit_alert').length > 0 && (
              <View className="mb-3">
                <Text className="text-slate-100 font-semibold text-sm mb-2">
                  Recommended Services
                </Text>
                {groupedSuggestions
                  .filter((g) => g.category !== 'permit_alert')
                  .map((group) => (
                    <View key={group.category} className="mb-3">
                      <Text className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                        {group.label}
                      </Text>
                      {group.items.map((suggestion) => (
                        <View
                          key={suggestion.id}
                          className="flex-row items-start bg-cairn-card border border-cairn-border rounded-xl p-3 mb-1.5"
                        >
                          <Text className="text-lg mr-2">{suggestion.emoji}</Text>
                          <View className="flex-1">
                            <Text className="text-slate-200 text-xs font-semibold">
                              {suggestion.title}
                            </Text>
                            <Text className="text-slate-500 text-[10px]">
                              {suggestion.subtitle}
                            </Text>
                            {suggestion.specialOffer && (
                              <View className="mt-1 bg-amber-500/10 rounded px-1.5 py-0.5 self-start">
                                <Text className="text-amber-400 text-[9px] font-medium">
                                  {suggestion.specialOffer}
                                </Text>
                              </View>
                            )}
                          </View>
                          {suggestion.isSpotlight && (
                            <Badge label="Spotlight" variant="gold" />
                          )}
                        </View>
                      ))}
                    </View>
                  ))}
              </View>
            )}

            {/* Accommodation Links */}
            {state.region && (
              <View className="mb-3">
                <AccommodationLinks
                  locationName={`${state.region.name}, ${state.region.state_province}`}
                  lat={0}
                  lng={0}
                  checkin={state.startDate ?? undefined}
                  checkout={
                    state.startDate && state.days.length > 0
                      ? (() => {
                          const d = new Date(state.startDate);
                          d.setDate(d.getDate() + state.days.length);
                          return d.toISOString().split('T')[0];
                        })()
                      : undefined
                  }
                  guests={2}
                />
              </View>
            )}

            {/* Share + Reset */}
            <Button onPress={handleShare} variant="secondary" size="lg" className="mb-3">
              <View className="flex-row items-center">
                <Share2 size={18} color="#e2e8f0" />
                <Text className="text-slate-300 font-semibold text-base ml-2">
                  Share Trip
                </Text>
              </View>
            </Button>

            <Pressable
              onPress={() => {
                Alert.alert('Start Over', 'This will clear your current trip. Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Start Over',
                    style: 'destructive',
                    onPress: () => dispatch({ type: 'RESET' }),
                  },
                ]);
              }}
              className="flex-row items-center justify-center py-3"
            >
              <RotateCcw size={14} color="#ef4444" />
              <Text className="text-red-400 text-sm ml-1.5">Start Over</Text>
            </Pressable>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Navigation buttons */}
      <View className="px-4 pb-8 pt-3 flex-row gap-3 border-t border-cairn-border">
        {currentStepIndex > 0 && (
          <Button variant="secondary" size="lg" onPress={handleBack} className="flex-1">
            Back
          </Button>
        )}
        {currentStepIndex < STEPS.length - 1 && (
          <Button
            size="lg"
            onPress={handleNext}
            disabled={
              (state.currentStep === 'region' && !state.region) ||
              (state.currentStep === 'activities' && state.selectedActivities.length === 0) ||
              (state.currentStep === 'itinerary' && !hasAnyItems)
            }
            className="flex-1"
          >
            {state.currentStep === 'itinerary' ? 'View Summary' : 'Next'}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
