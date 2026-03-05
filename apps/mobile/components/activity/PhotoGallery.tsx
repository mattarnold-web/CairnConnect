import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import {
  X,
  MapPin,
  Trash2,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import {
  getPhotoUri,
  deletePhoto as deletePhotoFile,
  extractGpsFromFilename,
} from '@/lib/camera';
import type { CapturedPhoto } from '@/lib/photo-types';

const THUMB_SIZE = 88;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoGalleryProps {
  /** List of photo IDs to display */
  photoIds: string[];
  /** Full CapturedPhoto objects if available (for metadata) */
  photos?: CapturedPhoto[];
  /** Called when user deletes a photo */
  onDelete?: (photoId: string) => void;
  /** Called when user taps "Add Photo" */
  onAdd?: () => void;
  /** Show the add button */
  showAddButton?: boolean;
}

interface PhotoEntry {
  id: string;
  uri: string | null;
  lat: number | null;
  lng: number | null;
  capturedAt: string | null;
}

export function PhotoGallery({
  photoIds,
  photos,
  onDelete,
  onAdd,
  showAddButton = true,
}: PhotoGalleryProps) {
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Resolve photo URIs
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const resolved: PhotoEntry[] = [];
      for (const id of photoIds) {
        const uri = await getPhotoUri(id);
        const metaPhoto = photos?.find((p) => p.id === id);

        let lat = metaPhoto?.lat ?? null;
        let lng = metaPhoto?.lng ?? null;

        // Try extracting GPS from filename if no metadata
        if (lat == null && uri) {
          const parts = uri.split('/');
          const filename = parts[parts.length - 1];
          const gps = extractGpsFromFilename(filename);
          if (gps) {
            lat = gps.lat;
            lng = gps.lng;
          }
        }

        resolved.push({
          id,
          uri,
          lat,
          lng,
          capturedAt: metaPhoto?.capturedAt ?? null,
        });
      }
      if (!cancelled) setEntries(resolved);
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [photoIds, photos]);

  const handleDelete = useCallback(
    (photoId: string) => {
      Alert.alert('Delete Photo?', 'This photo will be permanently removed.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePhotoFile(photoId);
            setEntries((prev) => prev.filter((e) => e.id !== photoId));
            setSelectedIndex(null);
            onDelete?.(photoId);
          },
        },
      ]);
    },
    [onDelete],
  );

  const selectedEntry = selectedIndex != null ? entries[selectedIndex] : null;

  const goToPrev = () => {
    if (selectedIndex != null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex != null && selectedIndex < entries.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (entries.length === 0 && !showAddButton) return null;

  return (
    <>
      {/* Horizontal thumbnail strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
      >
        {entries.map((entry, idx) => (
          <Pressable
            key={entry.id}
            onPress={() => setSelectedIndex(idx)}
            className="relative"
          >
            <View
              className="rounded-xl overflow-hidden bg-cairn-elevated border border-cairn-border"
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            >
              {entry.uri ? (
                <Image
                  source={{ uri: entry.uri }}
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-slate-600 text-xs">Loading</Text>
                </View>
              )}
            </View>

            {/* GPS tag indicator */}
            {entry.lat != null && (
              <View className="absolute bottom-1 left-1 flex-row items-center bg-black/60 rounded px-1 py-0.5">
                <MapPin size={8} color="white" />
                <Text className="text-white text-[9px] ml-0.5">GPS</Text>
              </View>
            )}
          </Pressable>
        ))}

        {/* Add photo button */}
        {showAddButton && onAdd && (
          <Pressable
            onPress={onAdd}
            className="rounded-xl border border-dashed border-cairn-border bg-cairn-elevated items-center justify-center"
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
          >
            <Plus size={20} color="#64748b" />
            <Text className="text-slate-500 text-[9px] mt-1">Add</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Full-screen viewer modal */}
      <Modal
        visible={selectedEntry != null}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        {selectedEntry && (
          <View className="flex-1 bg-black/95">
            {/* Top bar */}
            <View className="flex-row items-center justify-between px-4 pt-14 pb-2">
              <Pressable
                onPress={() => setSelectedIndex(null)}
                className="h-10 w-10 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={20} color="white" />
              </Pressable>

              <Text className="text-white text-sm font-medium">
                {(selectedIndex ?? 0) + 1} / {entries.length}
              </Text>

              <Pressable
                onPress={() => handleDelete(selectedEntry.id)}
                className="h-10 w-10 rounded-full bg-red-500/20 items-center justify-center"
              >
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
            </View>

            {/* Image */}
            <View className="flex-1 items-center justify-center px-4">
              {selectedEntry.uri && (
                <Image
                  source={{ uri: selectedEntry.uri }}
                  style={{
                    width: SCREEN_WIDTH - 32,
                    height: SCREEN_HEIGHT * 0.6,
                  }}
                  resizeMode="contain"
                />
              )}

              {/* Nav arrows */}
              {entries.length > 1 && (
                <>
                  {(selectedIndex ?? 0) > 0 && (
                    <Pressable
                      onPress={goToPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 items-center justify-center"
                    >
                      <ChevronLeft size={20} color="white" />
                    </Pressable>
                  )}
                  {(selectedIndex ?? 0) < entries.length - 1 && (
                    <Pressable
                      onPress={goToNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 items-center justify-center"
                    >
                      <ChevronRight size={20} color="white" />
                    </Pressable>
                  )}
                </>
              )}
            </View>

            {/* Info bar */}
            <View className="px-4 pb-12 flex-row items-center gap-4">
              {selectedEntry.capturedAt && (
                <View className="flex-row items-center gap-1">
                  <Clock size={14} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs">
                    {new Date(selectedEntry.capturedAt).toLocaleString()}
                  </Text>
                </View>
              )}
              {selectedEntry.lat != null && selectedEntry.lng != null && (
                <View className="flex-row items-center gap-1">
                  <MapPin size={14} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs">
                    {selectedEntry.lat.toFixed(4)}, {selectedEntry.lng.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}
