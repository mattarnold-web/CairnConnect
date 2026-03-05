import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, Linking, ActivityIndicator, StyleSheet } from 'react-native';
import * as SMS from 'expo-sms';
import { Phone, MessageCircle, UserPlus, X, Shield } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/lib/storage';
import { getCurrentLocation, generateMapsUrl } from '@/lib/location';

const EMERGENCY_CONTACT_KEY = 'cairn-emergency-contact';

export interface EmergencyContactData {
  name: string;
  phone: string;
}

interface EmergencyContactProps {
  onContactChange?: (contact: EmergencyContactData | null) => void;
}

export function EmergencyContact({ onContactChange }: EmergencyContactProps) {
  const [contact, setContact] = useState<EmergencyContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadFromStorage<EmergencyContactData>(EMERGENCY_CONTACT_KEY).then((saved) => {
      if (saved) {
        setContact(saved);
        setName(saved.name);
        setPhone(saved.phone);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      Alert.alert('Missing Info', 'Please enter both name and phone number.');
      return;
    }

    const data: EmergencyContactData = { name: trimmedName, phone: trimmedPhone };
    await saveToStorage(EMERGENCY_CONTACT_KEY, data);
    setContact(data);
    setEditing(false);
    onContactChange?.(data);
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Emergency Contact?',
      'Are you sure you want to remove your emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFromStorage(EMERGENCY_CONTACT_KEY);
            setContact(null);
            setName('');
            setPhone('');
            setEditing(false);
            onContactChange?.(null);
          },
        },
      ],
    );
  };

  const handleCall = () => {
    if (!contact) return;
    Linking.openURL(`tel:${contact.phone}`);
  };

  const handleSms = async () => {
    if (!contact) return;
    setSending(true);
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS Unavailable', 'SMS is not available on this device.');
        return;
      }

      const location = await getCurrentLocation();
      let message = 'I need help. ';
      if (location) {
        const { latitude, longitude } = location.coords;
        const mapsUrl = generateMapsUrl(latitude, longitude);
        message += `I'm at [${latitude.toFixed(6)}, ${longitude.toFixed(6)}] - View on Maps: ${mapsUrl}`;
      } else {
        message += 'Unable to determine my location.';
      }

      await SMS.sendSMSAsync([contact.phone], message);
    } catch {
      Alert.alert('Error', 'Could not send SMS. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <View className="items-center py-4">
          <ActivityIndicator color="#10B981" />
        </View>
      </Card>
    );
  }

  // Setup form when no contact is saved or editing
  if (!contact || editing) {
    return (
      <Card>
        <View className="flex-row items-center mb-4">
          <View className="h-8 w-8 rounded-lg bg-red-500/20 items-center justify-center mr-2">
            <Shield size={16} color="#ef4444" />
          </View>
          <Text className="text-slate-100 font-semibold text-sm flex-1">
            Emergency Contact
          </Text>
          {editing && contact && (
            <Pressable onPress={() => setEditing(false)} className="p-1">
              <X size={18} color="#64748b" />
            </Pressable>
          )}
        </View>

        <View className="mb-3">
          <Text className="text-slate-400 text-xs mb-1.5">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Contact name"
            placeholderTextColor="#475569"
            style={emergencyStyles.input}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-xs mb-1.5">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#475569"
            keyboardType="phone-pad"
            style={emergencyStyles.input}
          />
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button onPress={handleSave} size="md">
              Save Contact
            </Button>
          </View>
          {editing && contact && (
            <Button onPress={handleRemove} variant="destructive" size="md">
              Remove
            </Button>
          )}
        </View>
      </Card>
    );
  }

  // Display saved contact with quick actions
  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="h-8 w-8 rounded-lg bg-red-500/20 items-center justify-center mr-2">
            <Shield size={16} color="#ef4444" />
          </View>
          <Text className="text-slate-100 font-semibold text-sm">
            Emergency Contact
          </Text>
        </View>
        <Pressable
          onPress={() => setEditing(true)}
          className="px-2 py-1"
        >
          <Text className="text-canopy text-xs font-medium">Edit</Text>
        </Pressable>
      </View>

      <View className="bg-cairn-bg rounded-xl p-3 mb-3">
        <Text className="text-slate-200 font-medium text-sm">{contact.name}</Text>
        <Text className="text-slate-400 text-xs mt-0.5">{contact.phone}</Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={handleCall}
          className="flex-1 flex-row items-center justify-center bg-canopy rounded-xl py-2.5 active:bg-canopy-dark"
        >
          <Phone size={14} color="white" />
          <Text className="text-white text-xs font-semibold ml-1.5">Call</Text>
        </Pressable>

        <Pressable
          onPress={handleSms}
          disabled={sending}
          className="flex-1 flex-row items-center justify-center bg-amber-600 rounded-xl py-2.5 active:bg-amber-700"
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MessageCircle size={14} color="white" />
              <Text className="text-white text-xs font-semibold ml-1.5">
                SMS + Location
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

const emergencyStyles = StyleSheet.create({
  input: {
    backgroundColor: '#0B1A2B',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f1f5f9',
    fontSize: 14,
  },
});
