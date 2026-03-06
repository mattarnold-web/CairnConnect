import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Send, Camera, Image as ImageIcon } from 'lucide-react-native';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/Button';
import { createReview } from '@/lib/api';

interface WriteReviewSheetProps {
  visible: boolean;
  entityType: 'trail' | 'business';
  entityId: string;
  entityName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function WriteReviewSheet({
  visible,
  entityType,
  entityId,
  entityName,
  onClose,
  onSubmitted,
}: WriteReviewSheetProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoPlaceholders, setPhotoPlaceholders] = useState<number[]>([]);

  const canSubmit = rating > 0 && title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createReview({
        entityType,
        entityId,
        rating,
        title: title.trim(),
        body: body.trim(),
      });
      // Reset form
      setRating(0);
      setTitle('');
      setBody('');
      setPhotoPlaceholders([]);
      onSubmitted();
      onClose();
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Could not submit review. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title || body || rating > 0) {
      Alert.alert('Discard Review?', 'Your review will not be saved.', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setRating(0);
            setTitle('');
            setBody('');
            setPhotoPlaceholders([]);
            onClose();
          },
        },
      ]);
    } else {
      onClose();
    }
  };

  const handleAddPhoto = () => {
    // Placeholder — future integration with expo-image-picker
    if (photoPlaceholders.length >= 6) {
      Alert.alert('Maximum Photos', 'You can add up to 6 photos per review.');
      return;
    }
    setPhotoPlaceholders((prev) => [...prev, prev.length + 1]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoPlaceholders((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        {/* Backdrop */}
        <Pressable
          onPress={handleClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Sheet */}
        <View className="bg-cairn-bg border-t border-cairn-border rounded-t-3xl px-4 pt-4 pb-10">
          {/* Handle bar */}
          <View className="items-center mb-2">
            <View className="w-10 h-1 rounded-full bg-cairn-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-slate-100 font-bold text-lg">
              Write a Review
            </Text>
            <Pressable onPress={handleClose} className="p-1">
              <X size={20} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Entity name */}
            <Text className="text-slate-400 text-sm mb-4" numberOfLines={1}>
              {entityName}
            </Text>

            {/* Star picker */}
            <View className="items-center mb-6">
              <Text className="text-slate-300 text-sm font-medium mb-3">
                Your Rating
              </Text>
              <StarRating rating={rating} size={32} onRate={setRating} />
              {rating > 0 && (
                <Text className="text-amber-400 text-sm mt-2 font-medium">
                  {rating === 1
                    ? 'Poor'
                    : rating === 2
                      ? 'Fair'
                      : rating === 3
                        ? 'Good'
                        : rating === 4
                          ? 'Great'
                          : 'Excellent'}
                </Text>
              )}
            </View>

            {/* Title */}
            <Text className="text-slate-300 text-sm font-medium mb-2">
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Summarize your experience"
              placeholderTextColor="#475569"
              style={styles.input}
              maxLength={100}
            />

            {/* Body */}
            <Text className="text-slate-300 text-sm font-medium mb-2 mt-4">
              Review
            </Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Share details about your experience..."
              placeholderTextColor="#475569"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={2000}
            />

            {/* Character count */}
            <Text className="text-slate-600 text-xs text-right mt-1">
              {body.length}/2000
            </Text>

            {/* ── Add Photos Section ── */}
            <Text className="text-slate-300 text-sm font-medium mb-2 mt-4">
              Photos
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {/* Photo placeholders */}
              {photoPlaceholders.map((_, index) => (
                <View
                  key={index}
                  className="w-20 h-20 rounded-xl bg-cairn-elevated items-center justify-center"
                  style={{ borderWidth: 1, borderColor: 'rgba(30, 58, 95, 0.5)' }}
                >
                  <ImageIcon size={16} color="#475569" />
                  <Pressable
                    onPress={() => handleRemovePhoto(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 items-center justify-center"
                  >
                    <X size={10} color="white" />
                  </Pressable>
                </View>
              ))}

              {/* Add photo button */}
              {photoPlaceholders.length < 6 && (
                <Pressable
                  onPress={handleAddPhoto}
                  className="w-20 h-20 rounded-xl items-center justify-center"
                  style={{
                    borderWidth: 1.5,
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    borderStyle: 'dashed',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  }}
                >
                  <Camera size={20} color="#10B981" />
                  <Text className="text-canopy text-[10px] font-medium mt-1">
                    Add Photo
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Submit */}
            <Button
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={submitting}
              size="lg"
            >
              <View className="flex-row items-center">
                <Send size={16} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Submit Review
                </Text>
              </View>
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#0F2337',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f1f5f9',
  },
  textArea: {
    minHeight: 100,
  },
});
