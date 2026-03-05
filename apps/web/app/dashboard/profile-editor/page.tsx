'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import {
  Upload,
  ImagePlus,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  Eye,
  Save,
  Link as LinkIcon,
  Navigation,
  PhoneCall,
  CalendarCheck,
  Star,
  Mountain,
} from 'lucide-react';
import { clsx } from 'clsx';

// ---------------------------------------------------------------------------
// Types & defaults
// ---------------------------------------------------------------------------

interface DaySchedule {
  label: string;
  short: string;
  enabled: boolean;
  open: string;
  close: string;
}

const DEFAULT_DAYS: DaySchedule[] = [
  { label: 'Monday', short: 'Mon', enabled: true, open: '9:00 AM', close: '6:00 PM' },
  { label: 'Tuesday', short: 'Tue', enabled: true, open: '9:00 AM', close: '6:00 PM' },
  { label: 'Wednesday', short: 'Wed', enabled: true, open: '9:00 AM', close: '6:00 PM' },
  { label: 'Thursday', short: 'Thu', enabled: true, open: '9:00 AM', close: '6:00 PM' },
  { label: 'Friday', short: 'Fri', enabled: true, open: '9:00 AM', close: '6:00 PM' },
  { label: 'Saturday', short: 'Sat', enabled: false, open: '10:00 AM', close: '4:00 PM' },
  { label: 'Sunday', short: 'Sun', enabled: false, open: '10:00 AM', close: '4:00 PM' },
];

interface EmbeddedLink {
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

const DEFAULT_EMBEDDED_LINKS: EmbeddedLink[] = [
  { label: 'Website', icon: Globe, enabled: true },
  { label: 'Directions', icon: Navigation, enabled: true },
  { label: 'Call', icon: PhoneCall, enabled: true },
  { label: 'Book', icon: CalendarCheck, enabled: true },
  { label: 'Instagram', icon: Instagram, enabled: true },
  { label: 'Yelp', icon: Star, enabled: true },
  { label: 'TripAdvisor', icon: Mountain, enabled: true },
  { label: 'AllTrails', icon: MapPin, enabled: true },
];

const CATEGORIES = [
  'Outdoor Adventure Center',
  'Bike Shop',
  'Ski Resort',
  'Climbing Gym',
  'Outfitter',
  'Guide Service',
  'Campground',
  'Trail System',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfileEditorPage() {
  const [name, setName] = useState('Cairn Adventures');
  const [category, setCategory] = useState('Outdoor Adventure Center');
  const [description, setDescription] = useState(
    'Welcome to Cairn Adventures — your premier outdoor adventure center in the heart of the mountains. We offer guided tours, gear rentals, and expert advice for all skill levels.'
  );
  const [phone, setPhone] = useState('(555) 123-4567');
  const [website, setWebsite] = useState('Outdoor-adventure.com');
  const [days, setDays] = useState<DaySchedule[]>(DEFAULT_DAYS);
  const [instagram, setInstagram] = useState('@cairn_handle');
  const [facebook, setFacebook] = useState('@cairn_handle');
  const [twitter, setTwitter] = useState('@twitter_handle');
  const [embeddedLinks, setEmbeddedLinks] = useState<EmbeddedLink[]>(DEFAULT_EMBEDDED_LINKS);

  const toggleDay = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const toggleEmbeddedLink = (index: number) => {
    setEmbeddedLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, enabled: !l.enabled } : l))
    );
  };

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-20 pb-24">
        {/* ---- Header ---- */}
        <div className="mb-8 mt-4">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Business Profile Editor
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Customize how your business appears on Cairn Connect
          </p>
        </div>

        {/* ================================================================ */}
        {/* PHOTO UPLOAD ZONES                                                */}
        {/* ================================================================ */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">
            Photos
          </h2>

          {/* Hero Image */}
          <div className="mb-4">
            <label className="text-sm text-[var(--text-secondary)] mb-2 block">Hero Image</label>
            <div className="border-2 border-dashed border-cairn-border rounded-xl h-52 flex flex-col items-center justify-center gap-3 bg-cairn-card hover:bg-cairn-card-hover transition-colors cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-canopy/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-canopy" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Drag &amp; Drop or Click to Upload
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  PNG, JPG up to 10MB — Recommended 1200x600
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-2 block">Gallery Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-2 border-dashed border-cairn-border rounded-xl aspect-square flex flex-col items-center justify-center gap-2 bg-cairn-card hover:bg-cairn-card-hover transition-colors cursor-pointer"
                >
                  <ImagePlus className="h-5 w-5 text-[var(--text-tertiary)]" />
                  <span className="text-[10px] text-[var(--text-tertiary)]">Upload</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* BUSINESS INFO FIELDS                                              */}
        {/* ================================================================ */}
        <section className="rounded-2xl border border-cairn-border bg-cairn-card p-5 mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">
            Business Information
          </h2>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
                Business Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-cairn-border bg-cairn-bg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-canopy focus:ring-1 focus:ring-canopy transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-cairn-border bg-cairn-bg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-canopy focus:ring-1 focus:ring-canopy transition-colors appearance-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1.5 block">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-cairn-border bg-cairn-bg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-canopy focus:ring-1 focus:ring-canopy transition-colors resize-none"
              />
            </div>

            {/* Hours */}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Business Hours
              </label>

              {/* Day checkboxes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {days.map((day, i) => (
                  <button
                    key={day.short}
                    onClick={() => toggleDay(i)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      day.enabled
                        ? 'bg-canopy/15 border-canopy/40 text-canopy'
                        : 'bg-cairn-bg border-cairn-border text-[var(--text-tertiary)]'
                    )}
                  >
                    {day.short}
                  </button>
                ))}
              </div>

              {/* Time inputs for enabled days */}
              <div className="space-y-2">
                {days.map((day, i) => (
                  <div
                    key={day.label}
                    className={clsx(
                      'flex items-center gap-3 text-sm',
                      !day.enabled && 'opacity-40'
                    )}
                  >
                    <span className="w-12 text-[var(--text-tertiary)] text-xs">{day.short}</span>
                    <input
                      type="text"
                      value={day.open}
                      disabled={!day.enabled}
                      onChange={(e) =>
                        setDays((prev) =>
                          prev.map((d, idx) =>
                            idx === i ? { ...d, open: e.target.value } : d
                          )
                        )
                      }
                      className="w-28 rounded-lg border border-cairn-border bg-cairn-bg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-canopy transition-colors disabled:cursor-not-allowed"
                    />
                    <span className="text-[var(--text-tertiary)] text-xs">to</span>
                    <input
                      type="text"
                      value={day.close}
                      disabled={!day.enabled}
                      onChange={(e) =>
                        setDays((prev) =>
                          prev.map((d, idx) =>
                            idx === i ? { ...d, close: e.target.value } : d
                          )
                        )
                      }
                      className="w-28 rounded-lg border border-cairn-border bg-cairn-bg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-canopy transition-colors disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-cairn-border bg-cairn-bg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-canopy focus:ring-1 focus:ring-canopy transition-colors"
              />
            </div>

            {/* Website */}
            <div>
              <label className="text-sm text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-cairn-border bg-cairn-bg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-canopy focus:ring-1 focus:ring-canopy transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SOCIAL LINKS                                                      */}
        {/* ================================================================ */}
        <section className="rounded-2xl border border-cairn-border bg-cairn-card p-5 mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">
            Social Links
          </h2>

          <div className="space-y-4">
            {/* Instagram */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-canopy/10 flex items-center justify-center shrink-0">
                <Instagram className="h-4 w-4 text-canopy" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--text-tertiary)] block mb-1">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full rounded-lg border border-cairn-border bg-cairn-bg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-canopy transition-colors"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-canopy/10 flex items-center justify-center shrink-0">
                <Facebook className="h-4 w-4 text-canopy" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--text-tertiary)] block mb-1">Facebook</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full rounded-lg border border-cairn-border bg-cairn-bg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-canopy transition-colors"
                />
              </div>
            </div>

            {/* Twitter */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-canopy/10 flex items-center justify-center shrink-0">
                <Twitter className="h-4 w-4 text-canopy" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--text-tertiary)] block mb-1">Twitter</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full rounded-lg border border-cairn-border bg-cairn-bg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-canopy transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* EMBEDDED LINKS                                                    */}
        {/* ================================================================ */}
        <section className="rounded-2xl border border-cairn-border bg-cairn-card p-5 mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-5">
            Embedded Links
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">
            Choose which action buttons appear on your profile listing
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {embeddedLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => toggleEmbeddedLink(i)}
                  className={clsx(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                    link.enabled
                      ? 'border-canopy/40 bg-canopy/10 text-canopy'
                      : 'border-cairn-border bg-cairn-bg text-[var(--text-tertiary)]'
                  )}
                >
                  {link.enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-canopy shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{link.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* ACTION BUTTONS                                                    */}
        {/* ================================================================ */}
        <div className="flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-cairn-card-hover transition-colors">
            <Eye className="h-4 w-4" />
            Preview Profile
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-canopy px-5 py-2.5 text-sm font-medium text-white hover:bg-canopy-dark transition-colors">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
