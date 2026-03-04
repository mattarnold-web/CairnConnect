'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Mountain,
  Timer,
  Gauge,
  TrendingUp,
  TrendingDown,
  MapPin,
  Navigation,
  Camera,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';
import { CameraCapture } from '@/components/activity/CameraCapture';
import { PhotoGallery } from '@/components/activity/PhotoGallery';
import { ActivityIcon, ACTIVITIES } from '@/components/ui/ActivityIcon';
import { useActivityContext } from '@/lib/activity-context';
import { useFormat } from '@/lib/use-format';
import { saveRecordedActivity } from '@/lib/actions/activities';
import type { GpsPoint } from '@/lib/activity-types';
import type { CapturedPhoto } from '@/lib/photo-types';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function RecordPage() {
  const { state, dispatch, activeActivity } = useActivityContext();
  const fmt = useFormat();

  const [selectedType, setSelectedType] = useState('hiking');
  const [gpsStatus, setGpsStatus] = useState<'off' | 'acquiring' | 'active' | 'error'>('off');
  const [elapsed, setElapsed] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRecording = activeActivity?.status === 'recording';
  const isPaused = activeActivity?.status === 'paused';
  const isActive = isRecording || isPaused;

  // Elapsed timer
  useEffect(() => {
    if (isRecording && activeActivity) {
      const startTime = new Date(activeActivity.startedAt).getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (isPaused && activeActivity) {
      // Show frozen time
      const startTime = new Date(activeActivity.startedAt).getTime();
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused, activeActivity]);

  // GPS tracking
  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('acquiring');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGpsStatus('active');
        const point: GpsPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
        };
        dispatch({ type: 'ADD_GPS_POINT', point });
      },
      () => {
        setGpsStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      },
    );
  }, [dispatch]);

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus('off');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function handleStart() {
    const id = `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const typeInfo = ACTIVITIES.find((t) => t.slug === selectedType);
    dispatch({
      type: 'START_RECORDING',
      activity: {
        id,
        title: `${typeInfo?.label || selectedType} - ${new Date().toLocaleDateString()}`,
        activityType: selectedType,
        status: 'recording',
        startedAt: new Date().toISOString(),
        endedAt: null,
        gpsTrack: [],
        distanceMeters: 0,
        durationSeconds: 0,
        elevationGainMeters: 0,
        elevationLossMeters: 0,
        maxElevationMeters: null,
        minElevationMeters: null,
        photos: [],
        notes: '',
      },
    });
    startGps();
  }

  function handlePause() {
    dispatch({ type: 'PAUSE_RECORDING' });
    stopGps();
  }

  function handleResume() {
    dispatch({ type: 'RESUME_RECORDING' });
    startGps();
  }

  function handleStop() {
    // Capture activity data before stopping context
    const act = activeActivity;
    dispatch({ type: 'STOP_RECORDING' });
    stopGps();

    // Persist to server in the background
    if (act) {
      saveRecordedActivity({
        source: 'cairn_connect',
        activityType: act.activityType,
        title: act.title,
        description: act.notes || undefined,
        distanceMeters: act.distanceMeters,
        durationSeconds: elapsed,
        elevationGainMeters: act.elevationGainMeters,
        elevationLossMeters: act.elevationLossMeters,
        maxElevationMeters: act.maxElevationMeters ?? undefined,
        startedAt: act.startedAt,
        endedAt: new Date().toISOString(),
        isPublic: true,
      }).catch(() => {
        // Silently fail — activity is saved locally in context
      });
    }
  }

  // Current speed from last 2 GPS points
  const currentSpeed =
    activeActivity && activeActivity.gpsTrack.length >= 2
      ? (() => {
          const track = activeActivity.gpsTrack;
          const prev = track[track.length - 2];
          const curr = track[track.length - 1];
          const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
          if (timeDiff <= 0) return 0;
          const segDist = activeActivity.distanceMeters; // Already cumulative
          // Use segment distance from haversine (already calculated in context)
          // Approximate from total distance / total time
          return elapsed > 0 ? activeActivity.distanceMeters / elapsed : 0;
        })()
      : 0;

  const gpsIndicator = {
    off: { color: 'text-slate-500', label: 'GPS Off' },
    acquiring: { color: 'text-amber-400', label: 'Acquiring...' },
    active: { color: 'text-canopy', label: 'GPS Active' },
    error: { color: 'text-red-400', label: 'GPS Error' },
  }[gpsStatus];

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-lg px-4 pt-20">
        <h1 className="font-display text-2xl font-bold text-slate-100 mb-6">
          Record Activity
        </h1>

        {/* Activity type selector */}
        {!isActive && (
          <div className="mb-8">
            <p className="text-sm text-slate-400 mb-3">Choose activity type</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ACTIVITIES.map((type) => (
                <button
                  key={type.slug}
                  onClick={() => setSelectedType(type.slug)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors',
                    selectedType === type.slug
                      ? 'bg-canopy/15 border-canopy/40 text-canopy'
                      : 'bg-cairn-card border-cairn-border text-slate-400 hover:bg-cairn-card-hover hover:text-slate-200',
                  )}
                >
                  <ActivityIcon activity={type.slug} size="sm" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active recording header */}
        {isActive && activeActivity && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              {isRecording && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              )}
              <span className={clsx('text-sm font-medium', isRecording ? 'text-red-400' : 'text-amber-400')}>
                {isRecording ? 'Recording' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{activeActivity.title}</p>
          </div>
        )}

        {/* Large elapsed time display */}
        {isActive && (
          <div className="text-center mb-8">
            <p className="font-mono text-6xl font-bold text-slate-100 tracking-tight">
              {formatElapsed(elapsed)}
            </p>
          </div>
        )}

        {/* Live stats grid */}
        {isActive && activeActivity && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-xl bg-cairn-card border border-cairn-border p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                Distance
              </div>
              <p className="font-display text-xl font-bold text-slate-100">
                {fmt.distance(activeActivity.distanceMeters)}
              </p>
            </div>
            <div className="rounded-xl bg-cairn-card border border-cairn-border p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Gauge className="h-3.5 w-3.5" />
                Avg Speed
              </div>
              <p className="font-display text-xl font-bold text-slate-100">
                {fmt.speed(currentSpeed)}
              </p>
            </div>
            <div className="rounded-xl bg-cairn-card border border-cairn-border p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Elev Gain
              </div>
              <p className="font-display text-xl font-bold text-slate-100">
                {fmt.elevation(activeActivity.elevationGainMeters)}
              </p>
            </div>
            <div className="rounded-xl bg-cairn-card border border-cairn-border p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <TrendingDown className="h-3.5 w-3.5" />
                Elev Loss
              </div>
              <p className="font-display text-xl font-bold text-slate-100">
                {fmt.elevation(activeActivity.elevationLossMeters)}
              </p>
            </div>
          </div>
        )}

        {/* GPS status */}
        {isActive && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Navigation className={clsx('h-4 w-4', gpsIndicator.color)} />
            <span className={clsx('text-xs font-medium', gpsIndicator.color)}>
              {gpsIndicator.label}
            </span>
            {activeActivity && activeActivity.gpsTrack.length > 0 && (
              <span className="text-xs text-slate-500">
                ({activeActivity.gpsTrack.length} points)
              </span>
            )}
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          {!isActive && (
            <button
              onClick={handleStart}
              className="flex items-center justify-center h-20 w-20 rounded-full bg-canopy text-white shadow-lg shadow-canopy/30 hover:bg-canopy-dark transition-colors"
              aria-label="Start recording"
            >
              <Play className="h-8 w-8 ml-1" />
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={handlePause}
                className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors"
                aria-label="Pause recording"
              >
                <Pause className="h-7 w-7" />
              </button>
              <button
                onClick={handleStop}
                className="flex items-center justify-center h-20 w-20 rounded-full bg-red-500/20 border-2 border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                aria-label="Stop recording"
              >
                <Square className="h-8 w-8" />
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={handleResume}
                className="flex items-center justify-center h-20 w-20 rounded-full bg-canopy text-white shadow-lg shadow-canopy/30 hover:bg-canopy-dark transition-colors"
                aria-label="Resume recording"
              >
                <Play className="h-8 w-8 ml-1" />
              </button>
              <button
                onClick={handleStop}
                className="flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border-2 border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                aria-label="Stop and save"
              >
                <Square className="h-7 w-7" />
              </button>
            </>
          )}
        </div>

        {/* Camera button during recording */}
        {isActive && activeActivity && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setCameraOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-cairn-card border border-cairn-border px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors"
            >
              <Camera className="h-4 w-4" />
              Take Photo
              {activeActivity.photos.length > 0 && (
                <span className="text-xs text-slate-500">({activeActivity.photos.length})</span>
              )}
            </button>
          </div>
        )}

        {/* Activity photos */}
        {isActive && activeActivity && activeActivity.photos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Activity Photos</h3>
            <PhotoGallery filterActivityId={activeActivity.id} />
          </div>
        )}

        {/* Camera overlay */}
        {cameraOpen && (
          <CameraCapture
            activityId={activeActivity?.id ?? null}
            tripId={null}
            onCapture={(photo: CapturedPhoto) => {
              if (activeActivity) {
                dispatch({ type: 'ADD_PHOTO', photoId: photo.id });
              }
            }}
            onClose={() => setCameraOpen(false)}
          />
        )}

        {/* Completed activity notice */}
        {!isActive && state.activities.filter((a) => a.status === 'completed').length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400">
              You have {state.activities.filter((a) => a.status === 'completed').length} recorded
              {state.activities.filter((a) => a.status === 'completed').length === 1
                ? ' activity'
                : ' activities'}
              .
            </p>
            <a
              href="/profile"
              className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-canopy hover:text-canopy-dark transition-colors"
            >
              View Activity History
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
