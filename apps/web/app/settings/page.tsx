'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  Clock,
  Wrench,
  User,
  Camera,
  Plus,
  X,
  Check,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';
import { usePreferences, type EquipmentItem } from '@/lib/preferences-context';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espa\u00f1ol' },
  { code: 'fr', label: 'Fran\u00e7ais' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Portugu\u00eas' },
  { code: 'ja', label: '\u65e5\u672c\u8a9e' },
  { code: 'ko', label: '\ud55c\uad6d\uc5b4' },
  { code: 'zh', label: '\u4e2d\u6587' },
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

const EQUIPMENT_CATEGORIES = [
  { value: 'bike', label: 'Bike', emoji: '\ud83d\udeb2' },
  { value: 'climbing', label: 'Climbing', emoji: '\ud83e\uddd7' },
  { value: 'ski', label: 'Ski/Snow', emoji: '\u26f7\ufe0f' },
  { value: 'paddle', label: 'Paddle', emoji: '\ud83d\udea3' },
  { value: 'camping', label: 'Camping', emoji: '\u26fa' },
  { value: 'other', label: 'Other', emoji: '\ud83c\udfaf' },
] as const;

export default function SettingsPage() {
  const { preferences, dispatch } = usePreferences();
  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipCategory, setNewEquipCategory] = useState<EquipmentItem['category']>('bike');
  const [showAddEquip, setShowAddEquip] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleAddEquipment() {
    if (!newEquipName.trim()) return;
    dispatch({
      type: 'ADD_EQUIPMENT',
      item: {
        id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: newEquipName.trim(),
        category: newEquipCategory,
      },
    });
    setNewEquipName('');
    setShowAddEquip(false);
  }

  function showSavedToast() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-6 w-6 text-canopy" />
          <h1 className="font-display text-2xl font-bold text-slate-100">Settings</h1>
        </div>

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-canopy" />
            Profile
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5 space-y-5">
            {/* Profile Picture */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-cairn-elevated border-2 border-cairn-border flex items-center justify-center overflow-hidden">
                  {preferences.profilePicture ? (
                    <img
                      src={preferences.profilePicture}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-canopy flex items-center justify-center text-white shadow-lg hover:bg-canopy-dark transition-colors"
                  onClick={() => {
                    const url = prompt('Enter image URL for profile picture (optional):');
                    if (url !== null) {
                      dispatch({ type: 'SET_PROFILE_PICTURE', url: url || null });
                      showSavedToast();
                    }
                  }}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={preferences.displayName}
                    onChange={(e) => {
                      dispatch({ type: 'SET_DISPLAY_NAME', name: e.target.value });
                    }}
                    onBlur={showSavedToast}
                    placeholder="Your trail name"
                    className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Bio</label>
                  <textarea
                    value={preferences.bio}
                    onChange={(e) => {
                      dispatch({ type: 'SET_BIO', bio: e.target.value });
                    }}
                    onBlur={showSavedToast}
                    placeholder="Tell others about your outdoor interests..."
                    rows={2}
                    className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-canopy" />
            Language
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <select
              value={preferences.language}
              onChange={(e) => {
                dispatch({ type: 'SET_LANGUAGE', language: e.target.value });
                showSavedToast();
              }}
              className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2.5 text-sm text-slate-100 focus:border-canopy focus:outline-none appearance-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Timezone Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-canopy" />
            Time Zone
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <select
              value={preferences.timezone}
              onChange={(e) => {
                dispatch({ type: 'SET_TIMEZONE', timezone: e.target.value });
                showSavedToast();
              }}
              className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2.5 text-sm text-slate-100 focus:border-canopy focus:outline-none appearance-none cursor-pointer"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Units Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-4">
            Units
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_UNITS', units: 'imperial' });
                  showSavedToast();
                }}
                className={clsx(
                  'flex-1 rounded-xl border py-3 text-sm font-medium transition-colors',
                  preferences.units === 'imperial'
                    ? 'bg-canopy/15 border-canopy/40 text-canopy'
                    : 'bg-cairn-elevated border-cairn-border text-slate-400 hover:text-slate-200'
                )}
              >
                Imperial (mi, ft)
              </button>
              <button
                onClick={() => {
                  dispatch({ type: 'SET_UNITS', units: 'metric' });
                  showSavedToast();
                }}
                className={clsx(
                  'flex-1 rounded-xl border py-3 text-sm font-medium transition-colors',
                  preferences.units === 'metric'
                    ? 'bg-canopy/15 border-canopy/40 text-canopy'
                    : 'bg-cairn-elevated border-cairn-border text-slate-400 hover:text-slate-200'
                )}
              >
                Metric (km, m)
              </button>
            </div>
          </div>
        </section>

        {/* Equipment Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-canopy" />
            My Equipment
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Add your gear so other users can see what you ride, climb, or paddle with.
          </p>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            {preferences.equipment.length > 0 ? (
              <div className="space-y-2 mb-4">
                {preferences.equipment.map((item) => {
                  const catConfig = EQUIPMENT_CATEGORIES.find((c) => c.value === item.category);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-cairn-elevated border border-cairn-border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{catConfig?.emoji || '\ud83c\udfaf'}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-100">{item.name}</p>
                          <p className="text-xs text-slate-500">{catConfig?.label || item.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_EQUIPMENT', id: item.id })}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No equipment added yet.</p>
            )}

            {showAddEquip ? (
              <div className="space-y-3 rounded-xl bg-cairn-elevated/50 border border-cairn-border p-4">
                <input
                  type="text"
                  value={newEquipName}
                  onChange={(e) => setNewEquipName(e.target.value)}
                  placeholder="Equipment name (e.g., Santa Cruz Hightower)"
                  className="w-full rounded-lg bg-cairn-bg border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEquipment()}
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setNewEquipCategory(cat.value)}
                      className={clsx(
                        'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                        newEquipCategory === cat.value
                          ? 'bg-canopy/15 border-canopy/40 text-canopy'
                          : 'bg-cairn-card border-cairn-border text-slate-400'
                      )}
                    >
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEquipment}
                    disabled={!newEquipName.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-canopy px-4 py-2 text-sm font-medium text-white hover:bg-canopy-dark transition-colors disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddEquip(false);
                      setNewEquipName('');
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddEquip(true)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-cairn-border px-4 py-3 text-sm font-medium text-slate-400 hover:text-canopy hover:border-canopy/40 transition-colors w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Equipment
              </button>
            )}
          </div>
        </section>

        {/* Privacy & Security Info */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-canopy" />
            Privacy & Security
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-canopy shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-100">Data Protection</p>
                <p className="text-xs text-slate-400 mt-1">
                  Your personal data is encrypted at rest and in transit. We never sell your location
                  data or activity history to third parties.
                </p>
              </div>
            </div>
            <div className="border-t border-cairn-border pt-4 space-y-2">
              <button className="w-full text-left rounded-xl bg-cairn-elevated border border-cairn-border px-4 py-3 text-sm text-slate-300 hover:bg-cairn-card-hover transition-colors">
                Download My Data
              </button>
              <button className="w-full text-left rounded-xl bg-cairn-elevated border border-cairn-border px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                Delete My Account
              </button>
            </div>
          </div>
        </section>

        {/* Saved toast */}
        {saved && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-2 rounded-full bg-canopy px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Check className="h-4 w-4" />
              Saved
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
