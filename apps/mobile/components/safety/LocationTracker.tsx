import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MapPin, Navigation, StopCircle, Battery, Crosshair } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { getCurrentLocation, watchLocation } from '@/lib/location';
import type { LocationSubscription, LocationObject } from 'expo-location';

interface LocationTrackerProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
  onStop?: () => void;
}

export function LocationTracker({ onLocationUpdate, onStop }: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [tracking, setTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [backgroundActive, setBackgroundActive] = useState(false);
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Get initial location on mount
    getCurrentLocation().then((loc) => {
      if (loc) setLocation(loc);
    });

    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (tracking) {
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tracking]);

  const startTracking = async () => {
    startTimeRef.current = Date.now();
    setTracking(true);
    setElapsed(0);
    setBackgroundActive(true);

    try {
      const sub = await watchLocation((loc) => {
        setLocation(loc);
        onLocationUpdate?.(loc.coords.latitude, loc.coords.longitude);
      });
      subscriptionRef.current = sub;
    } catch {
      setTracking(false);
      setBackgroundActive(false);
    }
  };

  const stopTracking = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setTracking(false);
    setBackgroundActive(false);
    startTimeRef.current = null;
    onStop?.();
  };

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;
  const accuracy = location?.coords.accuracy;

  return (
    <Card>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="h-8 w-8 rounded-lg bg-canopy/20 items-center justify-center mr-2">
            <Navigation size={16} color="#10B981" />
          </View>
          <Text className="text-slate-100 font-semibold text-sm">
            Location Tracker
          </Text>
        </View>
        {tracking && (
          <View className="flex-row items-center">
            <View className="h-2 w-2 rounded-full bg-canopy mr-1.5 animate-pulse" />
            <Text className="text-canopy text-xs font-medium">Live</Text>
          </View>
        )}
      </View>

      {/* Coordinates */}
      <View className="bg-cairn-bg rounded-xl p-3 mb-3">
        <View className="flex-row items-center mb-1">
          <Crosshair size={12} color="#64748b" />
          <Text className="text-slate-500 text-xs ml-1.5">Coordinates</Text>
        </View>
        <Text className="text-slate-200 font-mono text-sm">
          {lat != null && lng != null
            ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            : 'Acquiring...'}
        </Text>
        {accuracy != null && (
          <Text className="text-slate-500 text-xs mt-1">
            Accuracy: {accuracy < 10 ? 'Excellent' : accuracy < 30 ? 'Good' : 'Fair'} ({Math.round(accuracy)}m)
          </Text>
        )}
      </View>

      {/* Elapsed time */}
      {tracking && (
        <View className="bg-cairn-bg rounded-xl p-3 mb-3">
          <Text className="text-slate-500 text-xs mb-1">Elapsed Time</Text>
          <Text className="text-slate-100 font-mono text-lg font-bold">
            {formatElapsed(elapsed)}
          </Text>
        </View>
      )}

      {/* Background tracking indicator */}
      {backgroundActive && (
        <View className="flex-row items-center bg-canopy/10 rounded-lg px-3 py-2 mb-3">
          <Battery size={14} color="#10B981" />
          <Text className="text-canopy text-xs ml-2">
            Battery-efficient background tracking active
          </Text>
        </View>
      )}

      {/* Controls */}
      {!tracking ? (
        <Pressable
          onPress={startTracking}
          className="bg-canopy rounded-xl py-3 items-center active:bg-canopy-dark"
        >
          <View className="flex-row items-center">
            <MapPin size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">
              Start Tracking
            </Text>
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={stopTracking}
          className="bg-red-600 rounded-xl py-3 items-center active:bg-red-700"
        >
          <View className="flex-row items-center">
            <StopCircle size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">
              Stop Tracking
            </Text>
          </View>
        </Pressable>
      )}
    </Card>
  );
}
