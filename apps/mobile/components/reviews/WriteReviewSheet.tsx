import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { StarRating } from './StarRating';
import { createReview } from '@/lib/api';

interface WriteReviewSheetProps {
  entityType: 'trail' | 'business';
  entityId: string;
  entityName: string;
  visible: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function WriteReviewSheet({
  entityType,
  entityId,
  entityName,
  visible,
  onClose,
  onSubmitted,
}: WriteReviewSheetProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please add a title for your review.');
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        entityType,
        entityId,
        rating,
        title: title.trim(),
        body: body.trim(),
      });
      Alert.alert('Review Submitted', 'Thank you for your review!');
      setRating(0);
      setTitle('');
      setBody('');
      onSubmitted();
      onClose();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ?? 'Failed to submit review. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Write a Review</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.entityName}>{entityName}</Text>

            {/* Star rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.label}>Your Rating</Text>
              <StarRating rating={rating} size={32} interactive onRate={setRating} />
            </View>

            {/* Title */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Summarize your experience"
                placeholderTextColor="#475569"
                style={styles.input}
              />
            </View>

            {/* Body */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Review</Text>
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Share details about your experience..."
                placeholderTextColor="#475569"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Submit button */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
              style={[
                styles.submitButton,
                (submitting || rating === 0) && styles.submitButtonDisabled,
              ]}
            >
              <Send size={16} color="white" />
              <Text style={styles.submitText}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0B1A2B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1E3A5F',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  headerTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  entityName: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0F2337',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#e2e8f0',
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
