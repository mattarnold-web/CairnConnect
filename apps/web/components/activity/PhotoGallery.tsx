'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Trash2, Share2, Clock } from 'lucide-react';
import { loadPhotoMeta, loadPhotoData, deletePhoto } from '@/lib/camera';
import type { CapturedPhoto } from '@/lib/photo-types';

interface PhotoGalleryProps {
  filterActivityId?: string | null;
  filterTripId?: string | null;
}

export function PhotoGallery({ filterActivityId, filterTripId }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Record<string, string>>({});

  useEffect(() => {
    const meta = loadPhotoMeta();
    setPhotos(meta);
  }, []);

  const filtered = useMemo(() => {
    let list = photos;
    if (filterActivityId !== undefined) {
      list = list.filter((p) => p.activityId === filterActivityId);
    }
    if (filterTripId !== undefined) {
      list = list.filter((p) => p.tripId === filterTripId);
    }
    return list.sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
    );
  }, [photos, filterActivityId, filterTripId]);

  // Load image data for thumbnails
  useEffect(() => {
    const newData: Record<string, string> = {};
    for (const photo of filtered) {
      if (!imageData[photo.id]) {
        const data = loadPhotoData(photo.id);
        if (data) newData[photo.id] = data;
      }
    }
    if (Object.keys(newData).length > 0) {
      setImageData((prev) => ({ ...prev, ...newData }));
    }
  }, [filtered]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDelete(id: string) {
    deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setImageData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelectedId(null);
  }

  async function handleShare(photo: CapturedPhoto) {
    const data = imageData[photo.id];
    if (!data) return;

    if (navigator.share) {
      try {
        // Convert dataUrl to blob for share
        const res = await fetch(data);
        const blob = await res.blob();
        const file = new File([blob], `cairn-photo-${photo.id}.jpg`, { type: 'image/jpeg' });

        await navigator.share({
          title: 'Photo from Cairn Connect',
          text: photo.caption || 'Check out this shot from the trail!',
          files: [file],
        });
      } catch {
        // User cancelled or share failed
      }
    }
  }

  const selectedPhoto = selectedId ? filtered.find((p) => p.id === selectedId) : null;

  if (filtered.length === 0) {
    return null;
  }

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedId(photo.id)}
            className="aspect-square rounded-xl overflow-hidden bg-cairn-elevated border border-cairn-border hover:border-canopy/40 transition-colors relative group"
          >
            {imageData[photo.id] ? (
              <img
                src={imageData[photo.id]}
                alt={photo.caption || 'Trail photo'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-600">
                Loading...
              </div>
            )}
            {photo.lat != null && (
              <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MapPin className="h-2.5 w-2.5" />
                GPS
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Full-size viewer */}
      {selectedPhoto && imageData[selectedPhoto.id] && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={() => handleShare(selectedPhoto)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Share photo"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedPhoto.id)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                aria-label="Delete photo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={imageData[selectedPhoto.id]}
              alt={selectedPhoto.caption || 'Trail photo'}
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          </div>

          {/* Info bar */}
          <div className="p-4 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(selectedPhoto.capturedAt).toLocaleString()}
            </span>
            {selectedPhoto.lat != null && selectedPhoto.lng != null && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {selectedPhoto.lat.toFixed(4)}, {selectedPhoto.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
