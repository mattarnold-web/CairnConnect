'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Phone,
  Plus,
  MapPin,
  Navigation,
  AlertTriangle,
  Users,
  Cloud,
  Backpack,
  Clock,
  Bell,
  Heart,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

/* ---------- mock data ---------- */
const EMERGENCY_CONTACTS = [
  { id: 1, name: 'Mom', phone: '+1 (555) 123-4567' },
  { id: 2, name: 'Partner', phone: '+1 (555) 234-5678' },
  { id: 3, name: 'Ranger Station', phone: '+1 (555) 345-6789' },
];

const SAFETY_TIPS = [
  { label: 'Tell someone', Icon: Users },
  { label: 'Check weather', Icon: Cloud },
  { label: 'Carry essentials', Icon: Backpack },
  { label: 'Know your limits', Icon: AlertTriangle },
];

/* ---------- SOS progress ring ---------- */
function SosRing({ progress }: { progress: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width="100%"
      height="100%"
      viewBox="0 0 120 120"
    >
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="rgba(239,68,68,0.25)"
        strokeWidth="6"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#ef4444"
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-100"
      />
    </svg>
  );
}

/* ---------- page ---------- */
export default function SafetyCenterPage() {
  /* SOS hold state */
  const [sosProgress, setSosProgress] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const sosTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sosStartRef = useRef<number | null>(null);

  /* toggles */
  const [shareLiveLocation, setShareLiveLocation] = useState(false);
  const [overdueAlert, setOverdueAlert] = useState(true);

  /* contacts */
  const [contacts, setContacts] = useState(EMERGENCY_CONTACTS);

  const clearSosTimer = useCallback(() => {
    if (sosTimerRef.current) {
      clearInterval(sosTimerRef.current);
      sosTimerRef.current = null;
    }
    sosStartRef.current = null;
  }, []);

  const startSos = useCallback(() => {
    if (sosActive) return;
    sosStartRef.current = Date.now();
    sosTimerRef.current = setInterval(() => {
      if (!sosStartRef.current) return;
      const elapsed = Date.now() - sosStartRef.current;
      const p = Math.min(elapsed / 3000, 1);
      setSosProgress(p);
      if (p >= 1) {
        clearSosTimer();
        setSosActive(true);
        setShowSosModal(true);
      }
    }, 50);
  }, [sosActive, clearSosTimer]);

  const cancelSos = useCallback(() => {
    clearSosTimer();
    setSosProgress(0);
  }, [clearSosTimer]);

  /* clean up on unmount */
  useEffect(() => {
    return () => clearSosTimer();
  }, [clearSosTimer]);

  const dismissSosModal = () => {
    setShowSosModal(false);
    setSosActive(false);
    setSosProgress(0);
  };

  /* ---------- toggle component ---------- */
  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-green-500' : 'bg-cairn-border'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pt-20">
        {/* ---- Header ---- */}
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Safety Center
          </h1>
        </div>

        {/* ---- Emergency SOS ---- */}
        <section className="mb-8">
          <div className="rounded-2xl bg-cairn-card border border-cairn-border p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Emergency SOS
            </h2>

            <div className="relative w-32 h-32 mb-3 select-none">
              <SosRing progress={sosProgress} />
              <button
                onMouseDown={startSos}
                onMouseUp={cancelSos}
                onMouseLeave={cancelSos}
                onTouchStart={startSos}
                onTouchEnd={cancelSos}
                onTouchCancel={cancelSos}
                className={clsx(
                  'absolute inset-2 rounded-full flex items-center justify-center text-white font-extrabold text-2xl tracking-wide transition-colors',
                  sosActive
                    ? 'bg-red-700 cursor-default'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                )}
              >
                SOS
              </button>
            </div>

            <p className="text-sm text-[var(--text-tertiary)]">
              Hold for 3 seconds to activate
            </p>
          </div>
        </section>

        {/* ---- Emergency Contacts ---- */}
        <section className="mb-8">
          <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Emergency Contacts
            </h2>

            <ul className="divide-y divide-cairn-border">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{c.name}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{c.phone}</p>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/\D/g, '')}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 hover:bg-green-700 transition-colors"
                    aria-label={`Call ${c.name}`}
                  >
                    <Phone className="h-5 w-5 text-white" />
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                setContacts((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    name: `Contact ${prev.length + 1}`,
                    phone: '+1 (555) 000-0000',
                  },
                ])
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cairn-border py-3 text-canopy hover:bg-cairn-card-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Contact</span>
            </button>
          </div>
        </section>

        {/* ---- Current Location ---- */}
        <section className="mb-8">
          <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Current Location
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <Navigation className="h-4 w-4 text-canopy" />
              <span className="text-[var(--text-secondary)] text-sm font-mono">
                37.7749&deg; N, 122.4194&deg; W
              </span>
            </div>

            {/* map placeholder */}
            <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-cairn-elevated border border-cairn-border">
              <MapPin className="h-8 w-8 text-[var(--text-tertiary)]" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)] font-medium">
                Share Live Location
              </span>
              <Toggle
                checked={shareLiveLocation}
                onChange={setShareLiveLocation}
              />
            </div>
          </div>
        </section>

        {/* ---- Offline Emergency Info ---- */}
        <section className="mb-8">
          <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Offline Emergency Info
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Nearest resources:
            </p>

            <ul className="space-y-2 text-[var(--text-secondary)] text-sm">
              <li className="flex justify-between">
                <span>Ranger Station</span>
                <span className="text-[var(--text-tertiary)]">2.5 miles</span>
              </li>
              <li className="flex justify-between">
                <span>Hospital</span>
                <span className="text-[var(--text-tertiary)]">15 miles</span>
              </li>
            </ul>

            <p className="mt-4 mb-2 text-sm text-[var(--text-secondary)] font-medium">
              Evacuation Points
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)] text-sm">
              <li className="flex justify-between">
                <span>Point A</span>
                <span className="text-[var(--text-tertiary)]">3.0 miles</span>
              </li>
              <li className="flex justify-between">
                <span>Point B</span>
                <span className="text-[var(--text-tertiary)]">4.5 miles</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ---- I'm Safe ---- */}
        <section className="mb-8">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 hover:bg-green-700 active:bg-green-800 py-4 text-white font-bold text-lg transition-colors"
          >
            <Heart className="h-5 w-5" />
            I&apos;m Safe
          </button>
        </section>

        {/* ---- Trip Plan Summary ---- */}
        <section className="mb-8">
          <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Trip Plan Summary
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-canopy shrink-0" />
                <div>
                  <p className="text-[var(--text-primary)] font-medium">
                    Expected Return
                  </p>
                  <p className="text-[var(--text-tertiary)]">Today, 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-canopy shrink-0" />
                <div className="flex-1">
                  <p className="text-[var(--text-primary)] font-medium">
                    Auto-alert settings
                  </p>
                  <p className="text-[var(--text-tertiary)]">
                    ON &mdash; Notify contacts if not back by 7:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)] font-medium">
                  Overdue Alert
                </span>
                <Toggle checked={overdueAlert} onChange={setOverdueAlert} />
              </div>
            </div>
          </div>
        </section>

        {/* ---- Safety Tips ---- */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Safety Tips
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {SAFETY_TIPS.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl bg-cairn-card border border-cairn-border p-4"
              >
                <Icon className="h-6 w-6 text-canopy" />
                <span className="text-xs text-center text-[var(--text-secondary)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Quick Links ---- */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Quick Links
          </h2>
          <a
            href="#"
            className="flex items-center gap-2 text-canopy hover:text-canopy-dark transition-colors font-medium"
          >
            First Aid Guide
            <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      </main>

      {/* ---- SOS Confirmation Modal ---- */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-cairn-card border border-cairn-border p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-600">
              <ShieldAlert className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              SOS Activated
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Emergency alert has been sent to your contacts with your current
              location.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={dismissSosModal}
                className="flex-1 rounded-xl bg-cairn-elevated border border-cairn-border py-3 font-medium text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={dismissSosModal}
                className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white hover:bg-red-700 transition-colors"
              >
                Cancel SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
