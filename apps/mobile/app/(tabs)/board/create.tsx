import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Navigation,
  DollarSign,
  Shield,
  Users,
  Mountain,
  Ticket,
  Minus,
  Plus,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_TYPES } from '@cairn/shared';

const POST_TYPES = [
  {
    slug: 'lfg',
    label: 'Looking for Group',
    description: 'Find others to join your adventure',
    icon: Users,
    color: '#10B981',
    bgClass: 'bg-emerald-500/10',
    borderActive: 'border-emerald-500',
  },
  {
    slug: 'im_going',
    label: 'Join Me on Trail',
    description: 'You are going and inviting others',
    icon: Mountain,
    color: '#14B8A6',
    bgClass: 'bg-teal-500/10',
    borderActive: 'border-teal-500',
  },
  {
    slug: 'open_permit',
    label: 'Open Permit Seats',
    description: 'You have permit slots to share',
    icon: Ticket,
    color: '#F4A261',
    bgClass: 'bg-amber-500/10',
    borderActive: 'border-amber-500',
  },
];

const SKILL_LEVELS = [
  { slug: 'beginner', label: 'Beginner' },
  { slug: 'intermediate', label: 'Intermediate' },
  { slug: 'advanced', label: 'Advanced' },
  { slug: 'expert', label: 'Expert' },
];

const COMMON_GEAR = [
  'Helmet',
  'Water (3L+)',
  'Full-suspension bike',
  'Climbing shoes',
  'Harness',
  'Belay device',
  'PFD / Life jacket',
  'Dry bag',
  'Headlamp',
  'Trail runners',
  'Layers',
  'Sun protection',
  'First aid kit',
];

export default function CreatePostScreen() {
  const [postType, setPostType] = useState('lfg');
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [activityDate, setActivityDate] = useState('');
  const [gearRequired, setGearRequired] = useState<string[]>([]);
  const [customGear, setCustomGear] = useState('');
  const [costPerPerson, setCostPerPerson] = useState('');
  const [hasPermit, setHasPermit] = useState(false);
  const [permitType, setPermitType] = useState('');
  const [permitSlots, setPermitSlots] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleGearItem = (item: string) => {
    setGearRequired((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item],
    );
  };

  const addCustomGear = () => {
    const trimmed = customGear.trim();
    if (trimmed && !gearRequired.includes(trimmed)) {
      setGearRequired((prev) => [...prev, trimmed]);
      setCustomGear('');
    }
  };

  const handleGPSFill = () => {
    setLocationName('Moab, UT');
    Alert.alert('Location Set', 'GPS location auto-filled to Moab, UT (Demo mode)');
  };

  const incrementParticipants = () => {
    setMaxParticipants((prev) => Math.min(prev + 1, 50));
  };

  const decrementParticipants = () => {
    setMaxParticipants((prev) => Math.max(prev - 1, 2));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!activityType) newErrors.activityType = 'Select an activity type';
    if (!locationName.trim()) newErrors.location = 'Location is required';
    if (postType === 'open_permit' && !permitType.trim()) {
      newErrors.permitType = 'Permit type is required for Open Permit posts';
    }
    if (maxParticipants < 2) {
      newErrors.maxParticipants = 'Must be at least 2';
    }
    if (costPerPerson && isNaN(Number(costPerPerson))) {
      newErrors.cost = 'Must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields');
      return;
    }
    Alert.alert('Success', 'Post created! (Demo mode)', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
        <Pressable onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Text className="text-slate-100 font-bold text-lg flex-1">Create Post</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Post Type Selection */}
          <Text className="text-slate-300 text-sm font-semibold mb-2 mt-4">
            Post Type
          </Text>
          <View className="gap-2 mb-4">
            {POST_TYPES.map((pt) => {
              const isSelected = postType === pt.slug;
              const IconComp = pt.icon;
              return (
                <Pressable
                  key={pt.slug}
                  onPress={() => {
                    setPostType(pt.slug);
                    if (pt.slug === 'open_permit') setHasPermit(true);
                    else setHasPermit(false);
                  }}
                  className={`bg-cairn-card border rounded-2xl p-4 flex-row items-center ${
                    isSelected ? 'border-canopy bg-canopy/5' : 'border-cairn-border'
                  }`}
                >
                  <View
                    className="h-10 w-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: isSelected ? `${pt.color}20` : '#1E3A5F30' }}
                  >
                    <IconComp size={20} color={isSelected ? pt.color : '#64748b'} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold text-sm ${
                        isSelected ? 'text-canopy' : 'text-slate-300'
                      }`}
                    >
                      {pt.label}
                    </Text>
                    <Text className="text-slate-500 text-xs mt-0.5">{pt.description}</Text>
                  </View>
                  {isSelected && (
                    <View className="h-5 w-5 rounded-full bg-canopy items-center justify-center">
                      <View className="h-2 w-2 rounded-full bg-white" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Activity Type */}
          <Text className="text-slate-300 text-sm font-semibold mb-2">
            Activity Type
          </Text>
          {errors.activityType && (
            <Text className="text-red-400 text-xs mb-1">{errors.activityType}</Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row">
              {ACTIVITY_TYPES.slice(0, 14).map((at) => (
                <FilterChip
                  key={at.slug}
                  label={at.label}
                  emoji={at.emoji}
                  selected={activityType === at.slug}
                  onPress={() => setActivityType(at.slug)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Title */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">Title</Text>
          {errors.title && (
            <Text className="text-red-400 text-xs mb-1">{errors.title}</Text>
          )}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Morning ride at Slickrock"
            placeholderTextColor="#475569"
            className={`bg-cairn-card border rounded-xl h-12 px-4 text-sm text-slate-100 mb-4 ${
              errors.title ? 'border-red-500' : 'border-cairn-border'
            }`}
          />

          {/* Trail / Location with map hint */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Trail / Location
          </Text>
          {errors.location && (
            <Text className="text-red-400 text-xs mb-1">{errors.location}</Text>
          )}
          <View className="flex-row gap-2 mb-2">
            <View
              className={`flex-1 flex-row items-center bg-cairn-card border rounded-xl h-12 px-4 ${
                errors.location ? 'border-red-500' : 'border-cairn-border'
              }`}
            >
              <MapPin size={16} color="#64748b" />
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="e.g., Moab, UT"
                placeholderTextColor="#475569"
                className="flex-1 ml-2 text-sm text-slate-100"
              />
            </View>
            <Pressable
              onPress={handleGPSFill}
              className="h-12 w-12 bg-canopy/20 border border-canopy/30 rounded-xl items-center justify-center"
            >
              <Navigation size={18} color="#10B981" />
            </Pressable>
          </View>
          {/* Map preview placeholder */}
          {locationName.trim().length > 0 && (
            <View className="bg-cairn-card border border-cairn-border rounded-xl h-28 mb-4 items-center justify-center overflow-hidden">
              <MapPin size={24} color="#1E3A5F" />
              <Text className="text-slate-600 text-xs mt-1">{locationName}</Text>
              <Text className="text-slate-700 text-[10px] mt-0.5">Map preview</Text>
            </View>
          )}
          {!locationName.trim() && <View className="mb-4" />}

          {/* Activity Date */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Activity Date
          </Text>
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 mb-4">
            <Calendar size={16} color="#64748b" />
            <TextInput
              value={activityDate}
              onChangeText={setActivityDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#475569"
              className="flex-1 ml-2 text-sm text-slate-100"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Participants Counter */}
          <Text className="text-slate-300 text-sm font-semibold mb-2">
            Participants
          </Text>
          {errors.maxParticipants && (
            <Text className="text-red-400 text-xs mb-1">{errors.maxParticipants}</Text>
          )}
          <View className="bg-cairn-card border border-cairn-border rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Users size={18} color="#94a3b8" />
                <Text className="text-slate-300 text-sm ml-2">Max Participants</Text>
              </View>
              <View className="flex-row items-center">
                <Pressable
                  onPress={decrementParticipants}
                  className="h-9 w-9 rounded-xl bg-cairn-bg border border-cairn-border items-center justify-center active:bg-cairn-border"
                >
                  <Minus size={16} color={maxParticipants <= 2 ? '#334155' : '#e2e8f0'} />
                </Pressable>
                <Text className="text-slate-100 text-lg font-bold mx-5 min-w-[24px] text-center">
                  {maxParticipants}
                </Text>
                <Pressable
                  onPress={incrementParticipants}
                  className="h-9 w-9 rounded-xl bg-canopy/20 border border-canopy/30 items-center justify-center active:bg-canopy/30"
                >
                  <Plus size={16} color="#10B981" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Skill level */}
          <Text className="text-slate-300 text-sm font-semibold mb-2">
            Skill Level
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {SKILL_LEVELS.map((level) => (
              <FilterChip
                key={level.slug}
                label={level.label}
                selected={skillLevel === level.slug}
                onPress={() => setSkillLevel(level.slug)}
              />
            ))}
          </View>

          {/* Message / Description */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Message
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell others about your plans, experience level, what to expect..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={4}
            className="bg-cairn-card border border-cairn-border rounded-2xl p-4 text-sm text-slate-100 mb-4 min-h-[120px]"
            textAlignVertical="top"
          />

          {/* Gear required */}
          <Text className="text-slate-300 text-sm font-semibold mb-2">
            Gear Required
          </Text>
          <View className="flex-row flex-wrap mb-2">
            {COMMON_GEAR.map((gear) => (
              <FilterChip
                key={gear}
                label={gear}
                selected={gearRequired.includes(gear)}
                onPress={() => toggleGearItem(gear)}
              />
            ))}
          </View>
          <View className="flex-row gap-2 mb-4">
            <TextInput
              value={customGear}
              onChangeText={setCustomGear}
              placeholder="Add custom gear item..."
              placeholderTextColor="#475569"
              className="flex-1 bg-cairn-card border border-cairn-border rounded-xl h-10 px-3 text-sm text-slate-100"
              onSubmitEditing={addCustomGear}
              returnKeyType="done"
            />
            <Pressable
              onPress={addCustomGear}
              className="h-10 px-3 bg-cairn-card border border-cairn-border rounded-xl items-center justify-center"
            >
              <Text className="text-canopy text-sm font-medium">Add</Text>
            </Pressable>
          </View>
          {gearRequired.length > 0 && (
            <View className="mb-4">
              <Text className="text-slate-500 text-xs mb-1">
                Selected gear ({gearRequired.length}):
              </Text>
              <View className="flex-row flex-wrap gap-1">
                {gearRequired.map((gear) => (
                  <Pressable
                    key={gear}
                    onPress={() => toggleGearItem(gear)}
                    className="bg-canopy/10 border border-canopy/30 rounded-lg px-2 py-1"
                  >
                    <Text className="text-canopy text-xs">{gear} x</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Cost per person */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Cost Per Person (Optional)
          </Text>
          {errors.cost && (
            <Text className="text-red-400 text-xs mb-1">{errors.cost}</Text>
          )}
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 mb-4">
            <DollarSign size={16} color="#64748b" />
            <TextInput
              value={costPerPerson}
              onChangeText={setCostPerPerson}
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              className="flex-1 ml-2 text-sm text-slate-100"
            />
            <Text className="text-slate-500 text-xs">per person</Text>
          </View>

          {/* Permit toggle and details */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Shield size={16} color="#f59e0b" />
                <Text className="text-slate-300 text-sm font-semibold ml-2">
                  Permit Required
                </Text>
              </View>
              <Switch
                value={hasPermit}
                onValueChange={(val) => {
                  setHasPermit(val);
                }}
                trackColor={{ false: '#1E3A5F', true: '#10B981' }}
                thumbColor="white"
              />
            </View>

            {hasPermit && (
              <View className="mt-2 gap-3">
                <View>
                  <Text className="text-slate-400 text-xs mb-1">Permit Type</Text>
                  {errors.permitType && (
                    <Text className="text-red-400 text-xs mb-1">{errors.permitType}</Text>
                  )}
                  <TextInput
                    value={permitType}
                    onChangeText={setPermitType}
                    placeholder="e.g., Cataract Canyon River Permit"
                    placeholderTextColor="#475569"
                    className={`bg-cairn-bg border rounded-xl h-10 px-3 text-sm text-slate-100 ${
                      errors.permitType ? 'border-red-500' : 'border-cairn-border'
                    }`}
                  />
                </View>
                <View>
                  <Text className="text-slate-400 text-xs mb-1">Available Permit Slots</Text>
                  <TextInput
                    value={permitSlots}
                    onChangeText={setPermitSlots}
                    placeholder="2"
                    placeholderTextColor="#475569"
                    keyboardType="number-pad"
                    className="bg-cairn-bg border border-cairn-border rounded-xl h-10 px-3 text-sm text-slate-100"
                  />
                </View>
              </View>
            )}
          </Card>

          {/* Submit - Post to Board */}
          <Pressable
            onPress={handleSubmit}
            className="bg-canopy rounded-2xl py-4 flex-row items-center justify-center active:bg-canopy-dark mb-2"
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Post to Board</Text>
          </Pressable>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
