import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
  Pressable,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Map, Users, Mountain } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  description: string;
  icon: typeof Map;
  iconColor: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: 'discover',
    title: 'Discover Trails',
    description:
      'Explore trails, local businesses, and hidden gems in your area. Filter by difficulty, distance, and activity type to find your perfect adventure.',
    icon: Map,
    iconColor: '#10B981',
  },
  {
    id: 'community',
    title: 'Join the Community',
    description:
      'Post activities on the community board, find adventure partners, and join group outings. Connect with outdoor enthusiasts near you.',
    icon: Users,
    iconColor: '#F4A261',
  },
  {
    id: 'journey',
    title: 'Track Your Journey',
    description:
      'Record your GPS tracks, plan multi-day trips, and build a history of your outdoor adventures. Share routes with friends.',
    icon: Mountain,
    iconColor: '#8B5CF6',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (activeIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    router.push('/(onboarding)/permissions');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/permissions');
  };

  const isLastPage = activeIndex === PAGES.length - 1;

  const renderPage = ({ item }: { item: OnboardingPage }) => {
    const IconComponent = item.icon;
    return (
      <View style={[styles.page, { width: SCREEN_WIDTH }]}>
        <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '1A' }]}>
          <IconComponent
            size={64}
            color={item.iconColor}
            strokeWidth={1.5}
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip button */}
      {!isLastPage && (
        <Pressable
          onPress={handleSkip}
          style={styles.skipButton}
          hitSlop={12}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Bottom section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {PAGES.map((page, index) => (
            <View
              key={page.id}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        {isLastPage ? (
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2B',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    alignItems: 'center',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#94a3b8',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    gap: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#10B981',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#1E3A5F',
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#059669',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
