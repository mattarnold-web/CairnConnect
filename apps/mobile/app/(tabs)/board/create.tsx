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
  StyleSheet,
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
  Hash,
  Users,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_TYPES } from '@cairn/shared';
import { createActivityPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const POST_TYPES = [
  { slug: 'im_going', label: "I'm Going", emoji: '\u{1F7E2}', description: 'You are going and inviting others' },
  { slug: 'open_permit', label: 'Open Permit', emoji: '\u{1F3AB}', description: 'You have permit slots to share' },
  { slug: 'lfg', label: 'LFG', emoji: '\u{1F7E3}', description: 'Looking for a group to join' },
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
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [postType, setPostType] = useState('im_going');
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [maxParticipants, setMaxParticipants] = useState('4');
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
    // Simulate GPS auto-fill
    setLocationName('Moab, UT');
    Alert.alert('Location Set', 'GPS location auto-filled to Moab, UT (Demo mode)');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!activityType) newErrors.activityType = 'Select an activity type';
    if (!locationName.trim()) newErrors.location = 'Location is required';
    if (postType === 'open_permit' && !permitType.trim()) {
      newErrors.permitType = 'Permit type is required for Open Permit posts';
    }
    if (maxParticipants && (isNaN(Number(maxParticipants)) || Number(maxParticipants) < 2)) {
      newErrors.maxParticipants = 'Must be at least 2';
    }
    if (costPerPerson && isNaN(Number(costPerPerson))) {
      newErrors.cost = 'Must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to create a post');
      return;
    }

    setSubmitting(true);
    try {
      await createActivityPost({
        post_type: postType,
        activity_type: activityType,
        title: title.trim(),
        description: description.trim() || undefined,
        location_name: locationName.trim(),
        activity_date: activityDate || undefined,
        skill_level: skillLevel,
        max_participants: maxParticipants ? Number(maxParticipants) : undefined,
        gear_required: gearRequired.length > 0 ? gearRequired : undefined,
        cost_per_person: costPerPerson ? Number(costPerPerson) : undefined,
        has_permit: hasPermit,
        permit_type: hasPermit ? permitType.trim() : undefined,
        permit_slots: hasPermit && permitSlots ? Number(permitSlots) : undefined,
      });
      Alert.alert('Success', 'Your post has been created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPostTypeConfig = POST_TYPES.find((pt) => pt.slug === postType);

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
          {/* Post type */}
          <Text className="text-slate-300 text-sm font-semibold mb-2 mt-4">
            Post Type
          </Text>
          <View className="gap-2 mb-1">
            {POST_TYPES.map((pt) => (
              <Pressable
                key={pt.slug}
                onPress={() => {
                  setPostType(pt.slug);
                  if (pt.slug === 'open_permit') setHasPermit(true);
                  else setHasPermit(false);
                }}
                className={`bg-cairn-card border rounded-xl p-3 flex-row items-center ${
                  postType === pt.slug ? 'border-canopy bg-canopy/5' : 'border-cairn-border'
                }`}
              >
                <Text className="text-lg mr-3">{pt.emoji}</Text>
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-sm ${
                      postType === pt.slug ? 'text-canopy' : 'text-slate-300'
                    }`}
                  >
                    {pt.label}
                  </Text>
                  <Text className="text-slate-500 text-xs">{pt.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Activity type */}
          <Text className="text-slate-300 text-sm font-semibold mb-2 mt-4">
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
            style={[
              createStyles.input,
              createStyles.inputFull,
              { marginBottom: 16 },
              errors.title ? createStyles.inputError : createStyles.inputBorder,
            ]}
          />

          {/* Description */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell others about your plans, experience level, what to expect..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={4}
            style={[createStyles.inputMultiline, createStyles.inputBorder]}
            textAlignVertical="top"
          />

          {/* Date */}
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
              style={createStyles.inputInline}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Location */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Location
          </Text>
          {errors.location && (
            <Text className="text-red-400 text-xs mb-1">{errors.location}</Text>
          )}
          <View className="flex-row gap-2 mb-4">
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
                style={createStyles.inputInline}
              />
            </View>
            <Pressable
              onPress={handleGPSFill}
              className="h-12 w-12 bg-canopy/20 border border-canopy/30 rounded-xl items-center justify-center"
            >
              <Navigation size={18} color="#10B981" />
            </Pressable>
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

          {/* Max participants */}
          <Text className="text-slate-300 text-sm font-semibold mb-1.5">
            Max Participants
          </Text>
          {errors.maxParticipants && (
            <Text className="text-red-400 text-xs mb-1">{errors.maxParticipants}</Text>
          )}
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 mb-4">
            <Users size={16} color="#64748b" />
            <TextInput
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              placeholder="4"
              placeholderTextColor="#475569"
              keyboardType="number-pad"
              style={createStyles.inputInline}
            />
          </View>

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
              style={[createStyles.input, createStyles.inputSmall, createStyles.inputBorder, { flex: 1 }]}
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
              style={createStyles.inputInline}
            />
            <Text className="text-slate-500 text-xs">per person</Text>
          </View>

          {/* Permit toggle and details */}
          <Card className="mb-4">
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
                  if (val && postType !== 'open_permit') {
                    // Auto-switch to open_permit if enabling permit
                  }
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
                    style={[
                      createStyles.inputPermit,
                      errors.permitType ? createStyles.inputError : createStyles.inputBorder,
                    ]}
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
                    style={[createStyles.inputPermit, createStyles.inputBorder]}
                  />
                </View>
              </View>
            )}
          </Card>

          {/* Submit */}
          <Button onPress={handleSubmit} size="lg" loading={submitting}>
            Create Post
          </Button>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = StyleSheet.create({
  input: {
    backgroundColor: '#112240',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#f1f5f9',
  },
  inputFull: {
    height: 48,
  },
  inputSmall: {
    height: 40,
    paddingHorizontal: 12,
  },
  inputMultiline: {
    backgroundColor: '#112240',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#f1f5f9',
    minHeight: 100,
    marginBottom: 16,
  },
  inputInline: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#f1f5f9',
  },
  inputPermit: {
    backgroundColor: '#0B1A2B',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#f1f5f9',
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
});
