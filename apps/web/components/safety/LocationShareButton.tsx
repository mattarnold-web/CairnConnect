"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  getCurrentPosition,
  generateMapsUrl,
  generateShareText,
} from "@/lib/geolocation";
import { Toast } from "@/components/ui/Toast";

interface LocationShareButtonProps {
  className?: string;
}

export default function LocationShareButton({
  className,
}: LocationShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(true);
  }

  async function handleShare() {
    setLoading(true);
    setError(null);

    try {
      const { lat, lng } = await getCurrentPosition();
      const url = generateMapsUrl(lat, lng);
      const text = generateShareText(lat, lng);

      if (navigator.share) {
        await navigator.share({
          title: "My Location",
          text,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Location link copied to clipboard");
      }
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access denied");
          showToast("Location access denied");
        } else {
          setError("Unable to get location");
          showToast("Unable to get location");
        }
      } else if (
        err instanceof Error &&
        err.message === "Geolocation not supported"
      ) {
        setError("Geolocation not supported");
        showToast("Geolocation not supported");
      } else {
        setError("Failed to share location");
        showToast("Failed to share location");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        disabled={loading}
        className={`rounded-xl bg-cairn-card border border-cairn-border px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors inline-flex items-center gap-2 ${className ?? ""}`}
      >
        <MapPin
          size={16}
          className={loading ? "animate-spin" : ""}
        />
        <span>{loading ? "Sharing..." : "Share Location"}</span>
        {error && (
          <span className="text-red-400 text-xs ml-1">{error}</span>
        )}
      </button>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
