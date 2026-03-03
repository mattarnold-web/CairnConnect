'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, SwitchCamera, Check, RotateCcw } from 'lucide-react';
import {
  openCameraStream,
  stopCameraStream,
  capturePhoto,
  savePhoto,
} from '@/lib/camera';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [preview, setPreview] = useState<CapturedPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startCamera = useCallback(
    async (facing: 'user' | 'environment') => {
      try {
        // Stop existing stream
        if (streamRef.current) {
          stopCameraStream(streamRef.current);
        }
        const stream = await openCameraStream(facing);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch {
        setError('Camera access denied or unavailable');
      }
    },
    [],
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
      }
    };
  }, [facingMode, startCamera]);

  async function handleCapture() {
    if (!videoRef.current) return;
    try {
      const photo = await capturePhoto(videoRef.current, activityId, tripId);
      setPreview(photo);
    } catch {
      setError('Failed to capture photo');
    }
  }

  function handleRetake() {
    setPreview(null);
  }

  function handleSave() {
    if (!preview) return;
    setSaving(true);
    const result = savePhoto(preview);
    if (result.saved) {
      onCapture(preview);
      onClose();
    } else {
      setError(result.warning || 'Failed to save photo');
      setSaving(false);
    }
  }

  function handleSwitchCamera() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 flex items-center justify-center h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Close camera"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white">
          {error}
        </div>
      )}

      {/* Viewfinder / Preview */}
      <div className="flex-1 relative overflow-hidden">
        {preview ? (
          <img
            src={preview.dataUrl}
            alt="Captured photo"
            className="h-full w-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Controls */}
      <div className="bg-black px-6 py-6 safe-area-bottom">
        {preview ? (
          /* Review mode */
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handleRetake}
              className="flex flex-col items-center gap-1 text-white"
              aria-label="Retake"
            >
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <RotateCcw className="h-6 w-6" />
              </div>
              <span className="text-xs">Retake</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-col items-center gap-1 text-white"
              aria-label="Save photo"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-canopy hover:bg-canopy-dark transition-colors disabled:opacity-50">
                <Check className="h-7 w-7" />
              </div>
              <span className="text-xs">{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        ) : (
          /* Capture mode */
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handleSwitchCamera}
              className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Switch camera"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
            <button
              onClick={handleCapture}
              className="flex items-center justify-center h-18 w-18 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors"
              style={{ height: 72, width: 72 }}
              aria-label="Take photo"
            >
              <Camera className="h-7 w-7 text-white" />
            </button>
            <div className="h-12 w-12" /> {/* Spacer for alignment */}
          </div>
        )}
      </div>
    </div>
  );
}
