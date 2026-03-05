'use client';

import { useState } from 'react';
import {
  Smartphone,
  Watch,
  Wifi,
  WifiOff,
  Send,
  MapPin,
  Check,
  ChevronDown,
  Clock,
  Mountain,
  Route,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

interface Device {
  id: string;
  name: string;
  model: string;
  connected: boolean;
  icon: 'watch' | 'bike-computer';
  lastSync?: string;
}

interface RecentPush {
  id: string;
  trailName: string;
  deviceName: string;
  format: string;
  date: string;
}

const INITIAL_DEVICES: Device[] = [
  {
    id: 'edge-530',
    name: 'Edge 530',
    model: 'Garmin Edge 530',
    connected: true,
    icon: 'bike-computer',
    lastSync: '2 min ago',
  },
  {
    id: 'forerunner-945',
    name: 'Forerunner 945',
    model: 'Garmin Forerunner 945',
    connected: false,
    icon: 'watch',
  },
  {
    id: 'fenix-7',
    name: 'Fenix 7',
    model: 'Garmin Fenix 7',
    connected: false,
    icon: 'watch',
  },
];

const RECENT_PUSHES: RecentPush[] = [
  {
    id: 'rp1',
    trailName: 'Timberline Trail',
    deviceName: 'Edge 530',
    format: 'GPX',
    date: 'Mar 2, 2026',
  },
  {
    id: 'rp2',
    trailName: 'Forest Park Loop',
    deviceName: 'Forerunner 945',
    format: 'FIT',
    date: 'Feb 28, 2026',
  },
  {
    id: 'rp3',
    trailName: 'Silver Star Summit',
    deviceName: 'Edge 530',
    format: 'GPX',
    date: 'Feb 20, 2026',
  },
];

type CourseFormat = 'GPX' | 'FIT' | 'TCX';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState('edge-530');
  const [courseFormat, setCourseFormat] = useState<CourseFormat>('GPX');
  const [pushSuccess, setPushSuccess] = useState(false);
  const [pushing, setPushing] = useState(false);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const connectedDevices = devices.filter((d) => d.connected);

  function toggleConnection(deviceId: string) {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, connected: !d.connected, lastSync: d.connected ? undefined : 'Just now' } : d
      )
    );
  }

  function handlePush() {
    setPushing(true);
    setPushSuccess(false);
    setTimeout(() => {
      setPushing(false);
      setPushSuccess(true);
      setTimeout(() => setPushSuccess(false), 4000);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        <div className="flex items-center gap-3 mb-8">
          <Smartphone className="h-6 w-6 text-canopy" />
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Device Connections
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">Garmin Integration</p>
          </div>
        </div>

        {/* Connected Devices */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Wifi className="h-5 w-5 text-canopy" />
            Connected Devices
          </h2>
          <div className="space-y-3">
            {devices.map((device) => {
              const DeviceIcon = device.icon === 'watch' ? Watch : Smartphone;
              return (
                <div
                  key={device.id}
                  className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex items-center justify-between hover:bg-cairn-card-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'h-10 w-10 rounded-xl flex items-center justify-center',
                        device.connected ? 'bg-canopy/15' : 'bg-cairn-elevated'
                      )}
                    >
                      <DeviceIcon
                        className={clsx(
                          'h-5 w-5',
                          device.connected ? 'text-canopy' : 'text-[var(--text-tertiary)]'
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {device.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={clsx(
                            'inline-block h-2 w-2 rounded-full',
                            device.connected ? 'bg-canopy' : 'bg-[var(--text-tertiary)]'
                          )}
                        />
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {device.connected ? 'Connected' : 'Disconnected'}
                          {device.lastSync && ` \u00B7 Synced ${device.lastSync}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleConnection(device.id)}
                    className={clsx(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border',
                      device.connected
                        ? 'border-cairn-border text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/40'
                        : 'border-canopy/40 text-canopy hover:bg-canopy/10'
                    )}
                  >
                    {device.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Send Trail to Device */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-canopy" />
            Send Trail to Device
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5 space-y-5">
            {/* Trail Preview Card */}
            <div className="rounded-xl border border-cairn-border bg-cairn-elevated p-4">
              <div className="flex gap-4">
                {/* Map Placeholder */}
                <div className="h-20 w-20 rounded-lg bg-cairn-bg border border-cairn-border flex items-center justify-center shrink-0">
                  <Mountain className="h-8 w-8 text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Eagle Creek Trail
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                      <Route className="h-3 w-3" />
                      8.2 mi
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">Loop</span>
                    <span className="inline-block rounded-full bg-spotlight-gold/10 px-2 py-0.5 text-[10px] font-medium text-spotlight-gold">
                      Moderate
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Columbia River Gorge, OR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Selector */}
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-2">
                Target Device
              </label>
              <div className="relative">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-canopy focus:outline-none appearance-none cursor-pointer pr-8"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.connected ? '(Connected)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
            </div>

            {/* Course Format */}
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-2">
                Course Format
              </label>
              <div className="flex gap-3">
                {(['GPX', 'FIT', 'TCX'] as CourseFormat[]).map((format) => (
                  <label
                    key={format}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors',
                      courseFormat === format
                        ? 'bg-canopy/15 border-canopy/40 text-canopy'
                        : 'bg-cairn-elevated border-cairn-border text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <input
                      type="radio"
                      name="courseFormat"
                      value={format}
                      checked={courseFormat === format}
                      onChange={() => setCourseFormat(format)}
                      className="sr-only"
                    />
                    <span
                      className={clsx(
                        'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                        courseFormat === format
                          ? 'border-canopy'
                          : 'border-[var(--text-tertiary)]'
                      )}
                    >
                      {courseFormat === format && (
                        <span className="h-2 w-2 rounded-full bg-canopy" />
                      )}
                    </span>
                    {format}
                  </label>
                ))}
              </div>
            </div>

            {/* Push Button */}
            <button
              onClick={handlePush}
              disabled={pushing}
              className={clsx(
                'w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2',
                pushing
                  ? 'bg-canopy/60 cursor-not-allowed'
                  : 'bg-canopy hover:bg-canopy-dark'
              )}
            >
              {pushing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Push to {selectedDevice?.name || 'Device'}
                </>
              )}
            </button>

            {/* Success Message */}
            {pushSuccess && (
              <div className="rounded-xl border border-canopy/30 bg-canopy/10 p-3 flex items-center gap-2">
                <Check className="h-5 w-5 text-canopy shrink-0" />
                <p className="text-sm text-canopy font-medium">
                  Trail sent successfully! Check your device.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Pushes */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-canopy" />
            Recent Pushes
          </h2>
          <div className="space-y-3">
            {RECENT_PUSHES.map((push) => (
              <div
                key={push.id}
                className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex items-center justify-between hover:bg-cairn-card-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-cairn-elevated flex items-center justify-center">
                    <Route className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {push.trailName}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {push.deviceName} &middot; {push.format}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">{push.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
