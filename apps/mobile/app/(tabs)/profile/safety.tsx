import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  Shield,
  MapPin,
  Navigation,
  AlertTriangle,
  Heart,
  Share2,
  Info,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmergencyContact } from '@/components/safety/EmergencyContact';
import { LocationShareButton } from '@/components/safety/LocationShareButton';
import { getCurrentLocation, generateMapsUrl } from '@/lib/location';

export default function SafetyCenterScreen() {
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const sosTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for SOS button
  useEffect(() => {
    if (sosActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sosActive, pulseAnim]);

  const fetchLocation = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setCurrentCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch {
      // Location unavailable
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleSOSPress = () => {
    if (sosActive) {
      // Cancel SOS
      if (sosTimerRef.current) clearInterval(sosTimerRef.current);
      setSosActive(false);
      setSosCountdown(3);
      return;
    }

    setSosActive(true);
    setSosCountdown(3);
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);

    sosTimerRef.current = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          if (sosTimerRef.current) clearInterval(sosTimerRef.current);
          // Trigger emergency call
          Linking.openURL('tel:911');
          setSosActive(false);
          return 3;
        }
        Vibration.vibrate(200);
        return prev - 1;
      });
    }, 1000);
  };

  const handleImSafe = () => {
    Alert.alert(
      "I'm Safe",
      'This will send a message to your emergency contacts letting them know you are safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Sent!', 'Your emergency contacts have been notified.');
          },
        },
      ],
    );
  };

  const handleShareLocation = async () => {
    if (!currentCoords) {
      Alert.alert('Location Unavailable', 'Please enable location services.');
      return;
    }
    const url = generateMapsUrl(currentCoords.lat, currentCoords.lng);
    try {
      await Linking.openURL(
        `sms:?body=My current location: ${url}`,
      );
    } catch {
      Alert.alert('Error', 'Could not open messaging app.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-cairn-card items-center justify-center mr-3"
        >
          <ArrowLeft size={20} color="#e2e8f0" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-slate-100 font-bold text-xl">
            Safety Center
          </Text>
        </View>
        <Shield size={20} color="#ef4444" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SOS Button ── */}
        <View className="items-center mb-6">
          <Text className="text-slate-400 text-xs mb-3">
            Hold to call emergency services
          </Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleSOSPress}
              className={`w-32 h-32 rounded-full items-center justify-center ${
                sosActive ? 'bg-red-700' : 'bg-red-600'
              }`}
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {sosActive ? (
                <View className="items-center">
                  <Text className="text-white font-bold text-3xl">
                    {sosCountdown}
                  </Text>
                  <Text className="text-red-200 text-xs mt-1">
                    Tap to cancel
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Phone size={28} color="white" />
                  <Text className="text-white font-bold text-lg mt-1">SOS</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </View>

        {/* ── I'm Safe button ── */}
        <Pressable
          onPress={handleImSafe}
          className="bg-emerald-600/20 border border-emerald-500/40 rounded-2xl p-4 mb-4 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
            <Heart size={20} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-emerald-400 font-semibold text-base">
              I'm Safe
            </Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Notify your emergency contacts
            </Text>
          </View>
        </Pressable>

        {/* ── Emergency Contacts ── */}
        <Text className="text-slate-100 font-semibold text-lg mb-3">
          Emergency Contacts
        </Text>
        <View className="mb-4">
          <EmergencyContact />
        </View>

        {/* ── Current Location ── */}
        <Text className="text-slate-100 font-semibold text-lg mb-3">
          Current Location
        </Text>
        <Card className="mb-4">
          {currentCoords ? (
            <View>
              <View className="flex-row items-center mb-2">
                <MapPin size={14} color="#10B981" />
                <Text className="text-slate-300 text-sm ml-2">
                  {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    const url = generateMapsUrl(
                      currentCoords.lat,
                      currentCoords.lng,
                    );
                    Linking.openURL(url);
                  }}
                  className="flex-row items-center bg-cairn-elevated rounded-lg px-3 py-2"
                >
                  <Navigation size={12} color="#10B981" />
                  <Text className="text-canopy text-xs font-medium ml-1.5">
                    Open in Maps
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleShareLocation}
                  className="flex-row items-center bg-cairn-elevated rounded-lg px-3 py-2"
                >
                  <Share2 size={12} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs font-medium ml-1.5">
                    Share Location
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center">
              <MapPin size={14} color="#64748b" />
              <Text className="text-slate-500 text-sm ml-2">
                {loadingLocation
                  ? 'Getting location...'
                  : 'Location unavailable'}
              </Text>
            </View>
          )}
        </Card>

        {/* ── Share Live Location ── */}
        <Text className="text-slate-100 font-semibold text-lg mb-3">
          Live Location Sharing
        </Text>
        <View className="mb-4">
          <LocationShareButton />
        </View>

        {/* ── Emergency Info ── */}
        <Text className="text-slate-100 font-semibold text-lg mb-3">
          Emergency Resources
        </Text>
        <Card className="mb-3">
          <Pressable
            onPress={() => Linking.openURL('tel:911')}
            className="flex-row items-center"
          >
            <View className="w-9 h-9 rounded-full bg-red-500/20 items-center justify-center mr-3">
              <Phone size={16} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-medium text-sm">
                Emergency Services
              </Text>
              <Text className="text-slate-500 text-xs">911</Text>
            </View>
          </Pressable>
        </Card>
        <Card className="mb-3">
          <Pressable
            onPress={() => Linking.openURL('tel:+18007554000')}
            className="flex-row items-center"
          >
            <View className="w-9 h-9 rounded-full bg-amber-500/20 items-center justify-center mr-3">
              <AlertTriangle size={16} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-medium text-sm">
                Poison Control
              </Text>
              <Text className="text-slate-500 text-xs">1-800-755-4000</Text>
            </View>
          </Pressable>
        </Card>
        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center mr-3">
              <Info size={16} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-100 font-medium text-sm">
                Safety Tips
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Always tell someone your plan. Carry extra water and layers.
                Know before you go.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
