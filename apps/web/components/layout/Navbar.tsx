'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Mountain, Users, User, LayoutDashboard, Sparkles, CalendarDays, Compass, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { usePreferences } from '@/lib/preferences-context';

const NAV_ITEMS = [
  { href: '/explore', label: 'Explore', icon: Map },
  { href: '/explore?tab=trails', label: 'Trails', icon: Mountain },
  { href: '/board', label: 'Board', icon: Users },
  { href: '/trip', label: 'Trip', icon: CalendarDays },
  { href: '/recommend', label: 'Find Trail', icon: Compass },
  { href: '/record', label: 'Record', icon: Play },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();
  const { preferences, dispatch } = usePreferences();
  const isMetric = preferences.units === 'metric';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cairn-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-canopy to-canopy-dark flex items-center justify-center shadow-lg shadow-canopy/20">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-slate-100 leading-tight group-hover:text-canopy transition-colors">
                Cairn Connect
              </span>
              <span className="text-[9px] text-slate-500 tracking-[0.2em] uppercase -mt-0.5">
                Find your trail
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-canopy/15 text-canopy'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-cairn-card'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Units toggle */}
            <button
              onClick={() =>
                dispatch({ type: 'SET_UNITS', units: isMetric ? 'imperial' : 'metric' })
              }
              className="hidden sm:flex items-center rounded-lg bg-cairn-card border border-cairn-border text-xs font-medium overflow-hidden"
              aria-label={`Switch to ${isMetric ? 'imperial' : 'metric'} units`}
            >
              <span
                className={clsx(
                  'px-2 py-1.5 transition-colors',
                  !isMetric ? 'bg-canopy/20 text-canopy' : 'text-slate-500',
                )}
              >
                mi
              </span>
              <span
                className={clsx(
                  'px-2 py-1.5 transition-colors',
                  isMetric ? 'bg-canopy/20 text-canopy' : 'text-slate-500',
                )}
              >
                km
              </span>
            </button>
            <Link
              href="/dashboard/upgrade"
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-spotlight-gold/10 border border-spotlight-gold/30 px-3 py-1.5 text-xs font-semibold text-spotlight-gold hover:bg-spotlight-gold/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Get Spotlight
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-xl bg-cairn-card border border-cairn-border px-3.5 py-2 text-sm text-slate-300 hover:bg-cairn-card-hover transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-cairn-border">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium',
                  isActive ? 'text-canopy' : 'text-slate-500'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
