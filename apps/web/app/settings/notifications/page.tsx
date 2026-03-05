'use client';

import { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Reply,
  Ticket,
  Clock,
  CloudSun,
  AlertTriangle,
  XCircle,
  UserPlus,
  Trophy,
  BarChart3,
  Briefcase,
  MoonStar,
  MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
        enabled ? 'bg-canopy' : 'bg-cairn-elevated'
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

interface NotificationSetting {
  key: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

export default function NotificationsSettingsPage() {
  const [activityBoard, setActivityBoard] = useState<NotificationSetting[]>([
    { key: 'new_messages', label: 'New messages', icon: MessageSquare, enabled: true },
    { key: 'post_replies', label: 'Post replies', icon: Reply, enabled: true },
    { key: 'permit_seat', label: 'Permit seat available', icon: Ticket, enabled: true },
    { key: 'trip_reminders', label: 'Trip reminders', icon: Clock, enabled: true },
  ]);

  const [trailAlerts, setTrailAlerts] = useState<NotificationSetting[]>([
    { key: 'conditions_updated', label: 'Conditions updated', icon: MapPin, enabled: true },
    { key: 'weather_warnings', label: 'Weather warnings', icon: CloudSun, enabled: true },
    { key: 'closures', label: 'Closures', icon: XCircle, enabled: true },
  ]);

  const [social, setSocial] = useState<NotificationSetting[]>([
    { key: 'new_followers', label: 'New followers', icon: UserPlus, enabled: false },
    { key: 'achievements', label: 'Achievements', icon: Trophy, enabled: false },
    { key: 'weekly_recap', label: 'Weekly recap', icon: BarChart3, enabled: true },
  ]);

  const [business, setBusiness] = useState<NotificationSetting[]>([
    {
      key: 'inquiry_received',
      label: 'Inquiry received',
      description: 'For business owners',
      icon: Briefcase,
      enabled: true,
    },
  ]);

  const [dndEnabled, setDndEnabled] = useState(false);

  function toggleSetting(
    list: NotificationSetting[],
    setter: React.Dispatch<React.SetStateAction<NotificationSetting[]>>,
    key: string
  ) {
    setter(list.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
  }

  function renderSection(
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    settings: NotificationSetting[],
    setter: React.Dispatch<React.SetStateAction<NotificationSetting[]>>
  ) {
    const Icon = icon;
    return (
      <section className="mb-8">
        <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5 text-canopy" />
          {title}
        </h2>
        <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5 space-y-4">
          {settings.map((setting) => {
            const SIcon = setting.icon;
            return (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{setting.label}</p>
                    {setting.description && (
                      <p className="text-xs text-[var(--text-tertiary)]">{setting.description}</p>
                    )}
                  </div>
                </div>
                <ToggleSwitch
                  enabled={setting.enabled}
                  onToggle={() => toggleSetting(settings, setter, setting.key)}
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-6 w-6 text-canopy" />
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Notifications
          </h1>
        </div>

        {renderSection('Activity Board', MessageSquare, activityBoard, setActivityBoard)}
        {renderSection('Trail Alerts', AlertTriangle, trailAlerts, setTrailAlerts)}
        {renderSection('Social', UserPlus, social, setSocial)}
        {renderSection('Business', Briefcase, business, setBusiness)}

        {/* Do Not Disturb */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MoonStar className="h-5 w-5 text-canopy" />
            Do Not Disturb
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MoonStar className="h-4 w-4 text-[var(--text-tertiary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Silence notifications
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">10:00 PM - 7:00 AM</p>
                </div>
              </div>
              <ToggleSwitch enabled={dndEnabled} onToggle={() => setDndEnabled(!dndEnabled)} />
            </div>
          </div>
        </section>

        {/* Recent Notifications */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-canopy" />
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {/* Message notification */}
            <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex items-start gap-3 hover:bg-cairn-card-hover transition-colors">
              <div className="h-9 w-9 rounded-full bg-canopy/15 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-canopy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  New message from <span className="text-canopy">Alex Rivera</span>
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  &quot;Hey, are you joining the group ride this Saturday?&quot;
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">2 minutes ago</p>
              </div>
            </div>

            {/* Weather warning */}
            <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex items-start gap-3 hover:bg-cairn-card-hover transition-colors">
              <div className="h-9 w-9 rounded-full bg-spotlight-gold/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-spotlight-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Weather Warning
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  High winds expected on Mt. Hood trails tomorrow. Gusts up to 45 mph.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">1 hour ago</p>
              </div>
            </div>

            {/* Permit available */}
            <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex items-start gap-3 hover:bg-cairn-card-hover transition-colors">
              <div className="h-9 w-9 rounded-full bg-canopy/15 flex items-center justify-center shrink-0">
                <Ticket className="h-4 w-4 text-canopy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Permit Available
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  A permit seat opened up for the Enchantments on June 15. Grab it before it&apos;s gone!
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">3 hours ago</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
