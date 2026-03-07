import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Vibration,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Shield,
  AlertTriangle,
  Share2,
  CheckCircle,
  Navigation,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const STORAGE_KEY = 'cairn-emergency-contacts';

export default function SafetyCenterScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const sosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [addingContact, setAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load contacts from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setContacts(JSON.parse(data));
    });
  }, []);

  // Save contacts
  const saveContacts = async (updated: EmergencyContact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Get current location
  const refreshLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is needed for safety features.',
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Alert.alert('Location Error', 'Could not get your current location.');
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  // SOS hold handler
  const startSOS = () => {
    setSosActive(true);
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    sosTimer.current = setTimeout(() => {
      // After 3 seconds, trigger emergency call
      Alert.alert(
        'Emergency Call',
        'Calling 911 now. Share your location with emergency contacts?',
        [
          {
            text: 'Call 911',
            onPress: () => {
              Linking.openURL('tel:911');
              shareLocationWithContacts();
            },
          },
          { text: 'Cancel', style: 'cancel', onPress: cancelSOS },
        ],
      );
    }, 3000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    if (sosTimer.current) clearTimeout(sosTimer.current);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const shareLocationWithContacts = async () => {
    if (!location) return;
    const message = `EMERGENCY: I need help! My current location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    for (const contact of contacts) {
      try {
        await Linking.openURL(
          `sms:${contact.phone}&body=${encodeURIComponent(message)}`,
        );
      } catch {
        // Continue with next contact
      }
    }
  };

  const handleImSafe = () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Contacts',
        'Add emergency contacts first to notify them.',
      );
      return;
    }
    Alert.alert(
      "I'm Safe",
      'Send a safety message to all emergency contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const message = `I'm safe! Current location: https://maps.google.com/?q=${location?.lat},${location?.lng}`;
            for (const contact of contacts) {
              try {
                await Linking.openURL(
                  `sms:${contact.phone}&body=${encodeURIComponent(message)}`,
                );
              } catch {
                // Continue with next contact
              }
            }
          },
        },
      ],
    );
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Missing Info', 'Please enter both name and phone number.');
      return;
    }
    const contact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
    };
    saveContacts([...contacts, contact]);
    setNewName('');
    setNewPhone('');
    setAddingContact(false);
  };

  const removeContact = (id: string) => {
    Alert.alert('Remove Contact', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => saveContacts(contacts.filter((c) => c.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#071019' }}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 12 }}
        >
          <ArrowLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Shield size={20} color="#10B981" />
        <Text style={styles.headerTitle}>Safety Center</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* SOS Button */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPressIn={startSOS}
              onPressOut={cancelSOS}
              style={[
                styles.sosButton,
                sosActive && styles.sosButtonActive,
              ]}
            >
              <AlertTriangle size={32} color="white" />
              <Text style={styles.sosText}>SOS</Text>
            </Pressable>
          </Animated.View>
          <Text style={styles.sosHint}>
            {sosActive
              ? 'Hold for 3 seconds...'
              : 'Hold to activate emergency SOS'}
          </Text>
        </View>

        {/* I'm Safe Button */}
        <Pressable onPress={handleImSafe} style={styles.imSafeButton}>
          <CheckCircle size={18} color="#10B981" />
          <Text style={styles.imSafeText}>I'm Safe — Notify Contacts</Text>
        </Pressable>

        {/* Current Location */}
        <Card className="mb-4">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <MapPin size={16} color="#10B981" />
              <Text
                style={{
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                Current Location
              </Text>
            </View>
            <Pressable onPress={refreshLocation} disabled={locationLoading}>
              <Navigation
                size={16}
                color={locationLoading ? '#475569' : '#10B981'}
              />
            </Pressable>
          </View>
          {location ? (
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Text>
              <Pressable
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps:0,0?q=${location.lat},${location.lng}`,
                    android: `geo:${location.lat},${location.lng}?q=${location.lat},${location.lng}`,
                  });
                  if (url) Linking.openURL(url);
                }}
                style={{ marginTop: 8 }}
              >
                <Text
                  style={{
                    color: '#10B981',
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  Open in Maps
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={{ color: '#475569', fontSize: 12 }}>
              {locationLoading
                ? 'Getting location...'
                : 'Location unavailable'}
            </Text>
          )}
        </Card>

        {/* Share Location */}
        <Pressable
          onPress={() => {
            if (!location) {
              Alert.alert(
                'No Location',
                'Wait for location to be acquired.',
              );
              return;
            }
            const url = `https://maps.google.com/?q=${location.lat},${location.lng}`;
            Linking.openURL(
              `sms:&body=${encodeURIComponent(`My current location: ${url}`)}`,
            );
          }}
          style={styles.shareLocationButton}
        >
          <Share2 size={16} color="#10B981" />
          <Text
            style={{
              color: '#10B981',
              fontSize: 13,
              fontWeight: '500',
              marginLeft: 8,
            }}
          >
            Share My Location
          </Text>
        </Pressable>

        {/* Emergency Contacts */}
        <View style={{ marginTop: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: '#e2e8f0',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Emergency Contacts
            </Text>
            <Pressable onPress={() => setAddingContact(true)}>
              <Plus size={20} color="#10B981" />
            </Pressable>
          </View>

          {contacts.map((contact) => (
            <Card key={contact.id} className="mb-2">
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: '#e2e8f0',
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    {contact.name}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>
                    {contact.phone}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                  >
                    <Phone size={18} color="#10B981" />
                  </Pressable>
                  <Pressable onPress={() => removeContact(contact.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}

          {contacts.length === 0 && !addingContact && (
            <Text
              style={{
                color: '#475569',
                fontSize: 13,
                textAlign: 'center',
                paddingVertical: 20,
              }}
            >
              No emergency contacts added yet. Tap + to add one.
            </Text>
          )}

          {/* Add contact form */}
          {addingContact && (
            <Card className="mt-2">
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Add Contact
              </Text>
              <View style={{ gap: 8 }}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={newName}
                      onChangeText={setNewName}
                      placeholder="Contact name"
                      placeholderTextColor="#475569"
                      style={styles.textInput}
                    />
                  </View>
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={newPhone}
                      onChangeText={setNewPhone}
                      placeholder="Phone number"
                      placeholderTextColor="#475569"
                      style={styles.textInput}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setAddingContact(false);
                      setNewName('');
                      setNewPhone('');
                    }}
                    style={[
                      styles.formButton,
                      { backgroundColor: '#1E3A5F' },
                    ]}
                  >
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={addContact}
                    style={[
                      styles.formButton,
                      { backgroundColor: '#10B981' },
                    ]}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 13,
                        fontWeight: '600',
                      }}
                    >
                      Save
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Emergency Numbers */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              color: '#e2e8f0',
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 12,
            }}
          >
            Emergency Services
          </Text>
          {[
            { name: 'Emergency (911)', number: '911' },
            { name: 'Poison Control', number: '1-800-222-1222' },
            { name: 'Search & Rescue (non-emergency)', number: '211' },
          ].map((service) => (
            <Pressable
              key={service.number}
              onPress={() => Linking.openURL(`tel:${service.number}`)}
              style={styles.emergencyServiceRow}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Phone size={14} color="#ef4444" />
                <Text style={{ color: '#e2e8f0', fontSize: 13 }}>
                  {service.name}
                </Text>
              </View>
              <Text style={{ color: '#64748b', fontSize: 12 }}>
                {service.number}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
    gap: 8,
  },
  headerTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonActive: {
    backgroundColor: '#991b1b',
  },
  sosText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  sosHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  imSafeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 8,
  },
  imSafeText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  shareLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2337',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingVertical: 12,
  },
  inputRow: {
    gap: 4,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: '#071019',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 10,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e2e8f0',
    fontSize: 14,
  },
  formButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  emergencyServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F2337',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
});
