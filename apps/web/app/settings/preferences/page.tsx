'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  DollarSign,
  MapPin,
  Ruler,
  Thermometer,
  Calendar,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'pt', label: 'Portugu\u00eas', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { code: 'it', label: 'Italiano', flag: '\uD83C\uDDEE\uD83C\uDDF9' },
  { code: 'fr', label: 'Fran\u00e7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { code: 'de', label: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  { code: 'es', label: 'Espa\u00f1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'JPY', label: 'JPY - Japanese Yen' },
];

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'South America',
  'Africa',
];

const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

export default function PreferencesPage() {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [region, setRegion] = useState('North America');
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'kilometers'>('miles');
  const [tempUnit, setTempUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const selectClasses =
    'w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-canopy focus:outline-none appearance-none cursor-pointer';

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-6 w-6 text-canopy" />
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Preferences
          </h1>
        </div>

        {/* Language & Currency - two column on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Language */}
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-canopy" />
              Language
            </h2>
            <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={selectClasses}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Currency */}
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-canopy" />
              Currency
            </h2>
            <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={selectClasses}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        {/* Region Preference */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-canopy" />
            Region Preference
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={selectClasses}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Distance Units */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Ruler className="h-5 w-5 text-canopy" />
            Distance Units
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <div className="flex rounded-xl border border-cairn-border overflow-hidden">
              <button
                onClick={() => setDistanceUnit('miles')}
                className={clsx(
                  'flex-1 py-3 text-sm font-medium transition-colors',
                  distanceUnit === 'miles'
                    ? 'bg-canopy text-white'
                    : 'bg-cairn-elevated text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                Miles
              </button>
              <button
                onClick={() => setDistanceUnit('kilometers')}
                className={clsx(
                  'flex-1 py-3 text-sm font-medium transition-colors',
                  distanceUnit === 'kilometers'
                    ? 'bg-canopy text-white'
                    : 'bg-cairn-elevated text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                Kilometers
              </button>
            </div>
          </div>
        </section>

        {/* Temperature Units */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-canopy" />
            Temperature Units
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <div className="flex rounded-xl border border-cairn-border overflow-hidden">
              <button
                onClick={() => setTempUnit('fahrenheit')}
                className={clsx(
                  'flex-1 py-3 text-sm font-medium transition-colors',
                  tempUnit === 'fahrenheit'
                    ? 'bg-canopy text-white'
                    : 'bg-cairn-elevated text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                Fahrenheit
              </button>
              <button
                onClick={() => setTempUnit('celsius')}
                className={clsx(
                  'flex-1 py-3 text-sm font-medium transition-colors',
                  tempUnit === 'celsius'
                    ? 'bg-canopy text-white'
                    : 'bg-cairn-elevated text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                Celsius
              </button>
            </div>
          </div>
        </section>

        {/* Date Format */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-canopy" />
            Date Format
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className={selectClasses}
            >
              {DATE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-canopy py-3 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
        >
          Save Preferences
        </button>

        {/* Saved toast */}
        {saved && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-2 rounded-full bg-canopy px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Check className="h-4 w-4" />
              Preferences saved
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
