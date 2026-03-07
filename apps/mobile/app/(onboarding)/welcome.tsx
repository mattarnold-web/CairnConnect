import { View, Text, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Route, Compass, Users, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEATURES = [
  {
    icon: MapPin,
    color: '#10B981',
    title: 'Discover Trails',
    desc: '19,000+ trails across 13 global adventure regions',
  },
  {
    icon: Route,
    color: '#3b82f6',
    title: 'Plan Trips',
    desc: 'Build itineraries with trails, lodging, and local gear shops',
  },
  {
    icon: Compass,
    color: '#f59e0b',
    title: 'Live Conditions',
    desc: 'Real-time weather, trail conditions, and difficulty ratings',
  },
  {
    icon: Users,
    color: '#a855f7',
    title: 'Community',
    desc: 'Find adventure partners and share trip reports',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>CairnConnect</Text>
          <Text style={styles.tagline}>
            Your outdoor adventure companion.{'\n'}Discover, plan, and share.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '20' }]}>
                <f.icon size={22} color={f.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '19K+', label: 'Trails' },
            { value: '13', label: 'Regions' },
            { value: '200+', label: 'Businesses' },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={() => router.push('/(onboarding)/interests')}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <ChevronRight size={20} color="white" />
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)/home')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2B' },
  scroll: { paddingHorizontal: 24, paddingBottom: 8 },
  hero: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 20 },
  appName: { color: '#e2e8f0', fontSize: 30, fontWeight: '700', marginTop: 16 },
  tagline: { color: '#94a3b8', fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  features: { gap: 12, marginBottom: 24 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F2338', borderColor: '#1E3A5F', borderWidth: 1,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  featureText: { flex: 1 },
  featureTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '600' },
  featureDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#0F2338', borderColor: '#1E3A5F', borderWidth: 1,
    borderRadius: 16, paddingVertical: 16, marginBottom: 8,
  },
  stat: { alignItems: 'center' },
  statValue: { color: '#10B981', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 2 },
  cta: { paddingHorizontal: 24, paddingTop: 12 },
  primaryBtn: {
    backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnPressed: { backgroundColor: '#059669' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '600', marginRight: 6 },
  skipBtn: { paddingVertical: 12 },
  skipText: { color: '#64748b', textAlign: 'center', fontSize: 14 },
});

