import { useState } from 'react';
import { View, Text, Pressable, Share, Alert, ActivityIndicator } from 'react-native';
import * as SMS from 'expo-sms';
import { Share2, MessageCircle } from 'lucide-react-native';
import { getCurrentLocation, generateMapsUrl, generateShareText } from '@/lib/location';
import { loadFromStorage } from '@/lib/storage';

const EMERGENCY_CONTACT_KEY = 'cairn-emergency-contact';

interface EmergencyContactData {
  name: string;
  phone: string;
}

interface LocationShareButtonProps {
  compact?: boolean;
}

export function LocationShareButton({ compact = false }: LocationShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Location Unavailable', 'Unable to get your current location. Check your location permissions.');
        return;
      }

      const { latitude, longitude } = location.coords;
      const shareText = generateShareText(latitude, longitude);

      await Share.share({
        message: shareText,
        title: 'My Current Location',
      });
    } catch (error) {
      if ((error as Error)?.message !== 'User did not share') {
        Alert.alert('Error', 'Could not share your location. Please try again.');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleSmsEmergency = async () => {
    setSharing(true);
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS Unavailable', 'SMS is not available on this device.');
        return;
      }

      const contact = await loadFromStorage<EmergencyContactData>(EMERGENCY_CONTACT_KEY);
      if (!contact) {
        Alert.alert(
          'No Emergency Contact',
          'Set up an emergency contact in Settings first.',
        );
        return;
      }

      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Location Unavailable', 'Unable to get your current location.');
        return;
      }

      const { latitude, longitude } = location.coords;
      const mapsUrl = generateMapsUrl(latitude, longitude);
      const message = `I'm at [${latitude.toFixed(6)}, ${longitude.toFixed(6)}] - View on Maps: ${mapsUrl}`;

      await SMS.sendSMSAsync([contact.phone], message);
    } catch {
      Alert.alert('Error', 'Could not send SMS. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  if (compact) {
    return (
      <View className="flex-row gap-2">
        <Pressable
          onPress={handleShare}
          disabled={sharing}
          className="flex-1 flex-row items-center justify-center bg-canopy rounded-xl py-2.5 active:bg-canopy-dark"
        >
          {sharing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Share2 size={14} color="white" />
              <Text className="text-white text-xs font-semibold ml-1.5">
                Share
              </Text>
            </>
          )}
        </Pressable>
        <Pressable
          onPress={handleSmsEmergency}
          disabled={sharing}
          className="flex-1 flex-row items-center justify-center bg-amber-600 rounded-xl py-2.5 active:bg-amber-700"
        >
          <MessageCircle size={14} color="white" />
          <Text className="text-white text-xs font-semibold ml-1.5">
            SMS Contact
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Pressable
        onPress={handleShare}
        disabled={sharing}
        className="flex-row items-center justify-center bg-canopy rounded-xl py-3.5 active:bg-canopy-dark"
      >
        {sharing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Share2 size={18} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">
              Share My Location
            </Text>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={handleSmsEmergency}
        disabled={sharing}
        className="flex-row items-center justify-center bg-amber-600 rounded-xl py-3.5 active:bg-amber-700"
      >
        <MessageCircle size={18} color="white" />
        <Text className="text-white font-semibold text-sm ml-2">
          SMS Emergency Contact
        </Text>
      </Pressable>
    </View>
  );
}
