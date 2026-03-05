import { useState, useRef } from 'react';
import { View, Text, Pressable, Image, Modal } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { X, Camera, SwitchCamera, Check, RotateCcw, Zap, ZapOff } from 'lucide-react-native';
import { getCurrentLocation } from '@/lib/location';
import { savePhoto } from '@/lib/camera';
import type { CapturedPhoto } from '@/lib/photo-types';

interface CameraCaptureProps {
  activityId: string | null;
  tripId: string | null;
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
}

export function CameraCapture({
  activityId,
  tripId,
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [preview, setPreview] = useState<{ uri: string; lat: number | null; lng: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!permission) {
    return (
      <Modal visible animationType="slide" statusBarTranslucent>
        <View className="flex-1 bg-black items-center justify-center">
          <Text className="text-white text-base">Loading camera...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible animationType="slide" statusBarTranslucent>
        <View className="flex-1 bg-black items-center justify-center px-8">
          <Text className="text-white text-lg font-semibold mb-2 text-center">
            Camera Access Required
          </Text>
          <Text className="text-slate-400 text-sm mb-6 text-center">
            Grant camera permission to capture photos during your activity.
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-canopy px-6 py-3 rounded-xl mb-4"
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </Pressable>
          <Pressable onPress={onClose}>
            <Text className="text-slate-400 text-sm">Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (!photo) {
        setError('Failed to capture photo');
        return;
      }

      // Get current GPS location for tagging
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const loc = await getCurrentLocation();
        if (loc) {
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      } catch {
        // GPS tagging is optional
      }

      setPreview({ uri: photo.uri, lat, lng });
      setError(null);
    } catch {
      setError('Failed to capture photo');
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setError(null);
  };

  const handleUsePhoto = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const savedUri = await savePhoto(preview.uri, photoId, preview.lat, preview.lng);

      const capturedPhoto: CapturedPhoto = {
        id: photoId,
        uri: savedUri,
        lat: preview.lat,
        lng: preview.lng,
        capturedAt: new Date().toISOString(),
        activityId,
        tripId,
        caption: '',
      };

      onCapture(capturedPhoto);
      onClose();
    } catch {
      setError('Failed to save photo');
      setSaving(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((prev) => !prev);
  };

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-black">
        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="absolute top-14 left-4 z-10 h-10 w-10 rounded-full bg-black/50 items-center justify-center"
        >
          <X size={20} color="white" />
        </Pressable>

        {/* Flash indicator */}
        {flash && (
          <View className="absolute top-14 right-4 z-10 px-3 py-1.5 rounded-full bg-amber-500/80">
            <Text className="text-white text-xs font-medium">Flash On</Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View className="absolute top-14 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-red-500/90 px-4 py-2">
            <Text className="text-white text-sm">{error}</Text>
          </View>
        )}

        {/* Camera viewfinder or preview */}
        <View className="flex-1">
          {preview ? (
            <Image
              source={{ uri: preview.uri }}
              className="flex-1"
              resizeMode="contain"
            />
          ) : (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing={facing}
              flash={flash ? 'on' : 'off'}
            />
          )}
        </View>

        {/* Controls bar */}
        <View className="bg-black px-6 pt-6 pb-12">
          {preview ? (
            /* Review mode: Retake / Use Photo */
            <View className="flex-row items-center justify-center gap-12">
              <Pressable
                onPress={handleRetake}
                className="items-center"
              >
                <View className="h-14 w-14 rounded-full bg-white/10 items-center justify-center mb-1">
                  <RotateCcw size={24} color="white" />
                </View>
                <Text className="text-white text-xs">Retake</Text>
              </Pressable>

              <Pressable
                onPress={handleUsePhoto}
                disabled={saving}
                className="items-center"
              >
                <View className={`h-16 w-16 rounded-full bg-canopy items-center justify-center mb-1 ${saving ? 'opacity-50' : ''}`}>
                  <Check size={28} color="white" />
                </View>
                <Text className="text-white text-xs">
                  {saving ? 'Saving...' : 'Use Photo'}
                </Text>
              </Pressable>
            </View>
          ) : (
            /* Capture mode: Switch / Capture / Flash */
            <View className="flex-row items-center justify-center gap-10">
              <Pressable
                onPress={toggleFacing}
                className="h-12 w-12 rounded-full bg-white/10 items-center justify-center"
              >
                <SwitchCamera size={20} color="white" />
              </Pressable>

              <Pressable
                onPress={handleCapture}
                className="h-[72px] w-[72px] rounded-full border-4 border-white bg-white/20 items-center justify-center"
              >
                <Camera size={28} color="white" />
              </Pressable>

              <Pressable
                onPress={toggleFlash}
                className="h-12 w-12 rounded-full bg-white/10 items-center justify-center"
              >
                {flash ? (
                  <Zap size={20} color="#fbbf24" />
                ) : (
                  <ZapOff size={20} color="white" />
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
