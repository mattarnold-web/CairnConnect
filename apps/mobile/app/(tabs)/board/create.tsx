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
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_TYPES } from '@cairn/shared';
import { createActivityPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const POST_TYPES = [
  { slug: 'im_going', label: "I'm Going", emoji: '\u{1F7E2}' },
  { slug: 'open_permit', label: 'Open Permit', emoji: '\u{1F3AB}' },
  { slug: 'lfg', label: 'LFG', emoji: '\u{1F7E3}' },
];

const SKILL_LEVELS = [
  { slug: 'beginner', label: 'Beginner' },
  { slug: 'intermediate', label: 'Intermediate' },
  { slug: 'advanced', label: 'Advanced' },
  { slug: 'expert', label: 'Expert' },
];

export default function CreatePostScreen() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [postType, setPostType] = useState('im_going');
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [locationName, setLocationName] = useState('');

  // ── Optional details (expandable) ──
  const [showDetails, setShowDetails] = useState(false);
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [maxParticipants, setMaxParticipants] = useState('4');
  const [costPerPerson, setCostPerPerson] = useState('');
  const [hasPermit, setHasPermit] = useState(false);
  const [permitType, setPermitType] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGPSFill = () => {
    setLocationName('Moab, UT');
    Alert.alert('Location Set', 'GPS location auto-filled to Moab, UT');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!activityType) newErrors.activityType = 'Select an activity type';
    if (!locationName.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Missing Fields', 'Please fill in the required fields');
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

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
        <Pressable onPress={() => router.back()} className="p-1 mr-3">
          <ArrowLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Text className="text-slate-100 font-bold text-lg flex-1">
          New Post
        </Text>
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
          {/* ── 1. Post Type (chip row) ── */}
          <View className="flex-row gap-2 mt-4 mb-4">
            {POST_TYPES.map((pt) => (
              <Pressable
                key={pt.slug}
                onPress={() => setPostType(pt.slug)}
                className={`flex-row items-center rounded-xl px-3 py-2 border ${
                  postType === pt.slug
                    ? 'bg-canopy/15 border-canopy/30'
                    : 'bg-cairn-card border-cairn-border'
                }`}
              >
                <Text className="mr-1.5">{pt.emoji}</Text>
                <Text
                  className={`text-xs font-medium ${
                    postType === pt.slug ? 'text-canopy' : 'text-slate-400'
                  }`}
                >
                  {pt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── 2. Activity Type ── */}
          {errors.activityType && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.activityType}
            </Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row">
              {ACTIVITY_TYPES.slice(0, 10).map((at) => (
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

          {/* ── 3. Title ── */}
          {errors.title && (
            <Text className="text-red-400 text-xs mb-1">{errors.title}</Text>
          )}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What's the plan? (e.g. Morning ride at Slickrock)"
            placeholderTextColor="#475569"
            style={[
              styles.input,
              { marginBottom: 12 },
              errors.title ? styles.inputError : styles.inputBorder,
            ]}
          />

          {/* ── 4. Date ── */}
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 mb-3">
            <Calendar size={16} color="#64748b" />
            <TextInput
              value={activityDate}
              onChangeText={setActivityDate}
              placeholder="When? (YYYY-MM-DD)"
              placeholderTextColor="#475569"
              style={styles.inputInline}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* ── 5. Location ── */}
          {errors.location && (
            <Text className="text-red-400 text-xs mb-1">
              {errors.location}
            </Text>
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
                placeholder="Where? (e.g. Moab, UT)"
                placeholderTextColor="#475569"
                style={styles.inputInline}
              />
            </View>
            <Pressable
              onPress={handleGPSFill}
              className="h-12 w-12 bg-canopy/20 border border-canopy/30 rounded-xl items-center justify-center"
            >
              <Navigation size={18} color="#10B981" />
            </Pressable>
          </View>

          {/* ── Expandable Details ── */}
          <Pressable
            onPress={() => setShowDetails((prev) => !prev)}
            className="flex-row items-center justify-center bg-cairn-card border border-cairn-border rounded-xl py-3 mb-4"
          >
            <Text className="text-slate-400 text-sm font-medium mr-2">
              {showDetails ? 'Hide details' : 'Add details'}
            </Text>
            {showDetails ? (
              <ChevronUp size={16} color="#64748b" />
            ) : (
              <ChevronDown size={16} color="#64748b" />
            )}
          </Pressable>

          {showDetails && (
            <View className="mb-4">
              {/* Description */}
              <Text className="text-slate-300 text-sm font-semibold mb-1.5">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Share more about the plan..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={3}
                style={[styles.textArea, styles.inputBorder]}
                textAlignVertical="top"
              />

              {/* Skill level */}
              <Text className="text-slate-300 text-sm font-semibold mb-2 mt-3">
                Skill Level
              </Text>
              <View className="flex-row flex-wrap mb-3">
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
              <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 mb-3">
                <Users size={16} color="#64748b" />
                <TextInput
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  placeholder="4"
                  placeholderTextColor="#475569"
                  keyboardType="number-pad"
                  style={styles.inputInline}
                />
              </View>

              {/* Cost */}
              <Text className="text-slate-300 text-sm font-semibold mb-1.5">
                Cost Per Person
              </Text>
              <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-4 mb-3">
                <DollarSign size={16} color="#64748b" />
                <TextInput
                  value={costPerPerson}
                  onChangeText={setCostPerPerson}
                  placeholder="0.00"
                  placeholderTextColor="#475569"
                  keyboardType="decimal-pad"
                  style={styles.inputInline}
                />
              </View>

              {/* Permit */}
              <Card className="mb-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Shield size={16} color="#f59e0b" />
                    <Text className="text-slate-300 text-sm font-semibold ml-2">
                      Has Permit
                    </Text>
                  </View>
                  <Switch
                    value={hasPermit}
                    onValueChange={setHasPermit}
                    trackColor={{ false: '#1E3A5F', true: '#10B981' }}
                    thumbColor="white"
                  />
                </View>
                {hasPermit && (
                  <TextInput
                    value={permitType}
                    onChangeText={setPermitType}
                    placeholder="Permit type (e.g. River Permit)"
                    placeholderTextColor="#475569"
                    style={[styles.inputSmall, styles.inputBorder, { marginTop: 12 }]}
                  />
                )}
              </Card>
            </View>
          )}

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

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#112240',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#f1f5f9',
  },
  inputInline: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#f1f5f9',
  },
  inputSmall: {
    backgroundColor: '#0B1A2B',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#f1f5f9',
  },
  textArea: {
    backgroundColor: '#112240',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#f1f5f9',
    minHeight: 80,
    marginBottom: 8,
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
