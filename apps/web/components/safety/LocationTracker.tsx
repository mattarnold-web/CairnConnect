"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Navigation, Copy, Square } from "lucide-react";
import { generateMapsUrl } from "@/lib/geolocation";
import { Toast } from "@/components/ui/Toast";

export default function LocationTracker() {
  const [tracking, setTracking] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(true);
  }

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setLat(null);
    setLng(null);
    setError(null);
  }, []);

  function startTracking() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access denied");
        } else {
          setError("Unable to get location");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  async function handleCopyLink() {
    if (lat === null || lng === null) return;
    const url = generateMapsUrl(lat, lng);
    try {
      await navigator.clipboard.writeText(url);
      showToast("Location link copied to clipboard");
    } catch {
      showToast("Failed to copy link");
    }
  }

  if (!tracking) {
    return (
      <button
        onClick={startTracking}
        className="rounded-xl bg-cairn-card border border-cairn-border px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors inline-flex items-center gap-2"
      >
        <Navigation size={16} />
        <span>Start Tracking</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed top-16 left-0 right-0 z-40 bg-canopy/10 border-b border-canopy/30 px-4 py-2">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Pulsing green dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-canopy opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-canopy" />
            </span>

            <span className="text-sm font-medium text-canopy">
              Sharing location
            </span>

            {error ? (
              <span className="text-xs text-red-400">{error}</span>
            ) : lat !== null && lng !== null ? (
              <span className="text-xs text-slate-400 font-mono">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Acquiring signal...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              disabled={lat === null || lng === null}
              className="rounded-lg bg-cairn-card border border-cairn-border px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy size={12} />
              Copy Link
            </button>

            <button
              onClick={stopTracking}
              className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors inline-flex items-center gap-1.5"
            >
              <Square size={12} />
              Stop
            </button>
          </div>
        </div>
      </div>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
