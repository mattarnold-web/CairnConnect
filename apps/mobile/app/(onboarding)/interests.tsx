import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVITY_TYPES, ACTIVITY_CATEGORIES } from '@cairn/shared';

const ONBOARDING_KEY = '@cairn/onboarding_completed';
const PREFERENCES_KEY = '@cairn/preferences';

export default function InterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleActivity = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    if (selected.size === 0) return;

    try {
      // Save selected interests
      await AsyncStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({ interests: Array.from(selected) }),
      );

      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Storage error — proceed anyway
    }

    // Navigate to main app and reset the navigation stack
    router.replace('/(tabs)/explore');
  };

  const canContinue = selected.size >= 1;

  // Group activities by category
  const groupedActivities = ACTIVITY_CATEGORIES.map((category) => ({
    ...category,
    activities: ACTIVITY_TYPES.filter((a) => a.category === category.slug),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>What do you enjoy?</Text>
        <Text style={styles.subtitle}>Select your favorite activities</Text>
      </View>

      {/* Activity grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedActivities.map((group) => (
          <View key={group.slug} style={styles.categorySection}>
            <Text style={styles.categoryLabel}>
              {group.emoji} {group.label}
            </Text>
            <View style={styles.activitiesGrid}>
              {group.activities.map((activity) => {
                const isSelected = selected.has(activity.slug);
                return (
                  <Pressable
                    key={activity.slug}
                    onPress={() => toggleActivity(activity.slug)}
                    style={[
                      styles.activityChip,
                      isSelected && styles.activityChipSelected,
                    ]}
                  >
                    <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                    <Text
                      style={[
                        styles.activityLabel,
                        isSelected && styles.activityLabelSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {activity.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Bottom spacer for scroll */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom section */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.selectionCount}>
          {selected.size === 0
            ? 'Select at least 1 activity'
            : `${selected.size} selected`}
        </Text>

        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
            pressed && canContinue && styles.continueButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,
              !canContinue && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2B',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F2337',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E3A5F',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activityChipSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B9811A',
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  activityLabelSelected: {
    color: '#10B981',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#0B1A2B',
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  selectionCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: '#1E3A5F',
  },
  continueButtonPressed: {
    backgroundColor: '#059669',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#64748b',
  },
});
