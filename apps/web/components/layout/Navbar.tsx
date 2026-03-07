'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Map, Mountain, Users, User, Sparkles, CalendarDays, Compass, Play, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { usePreferences } from '@/lib/preferences-context';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/explore', label: 'Explore', icon: Map },
  { href: '/climbing', label: 'Climbing', icon: Mountain },
  { href: '/board', label: 'Board', icon: Users },
  { href: '/trip', label: 'Trip', icon: CalendarDays },
  { href: '/recommend', label: 'Find Trail', icon: Compass },
  { href: '/record', label: 'Record', icon: Play },
  { href: '/profile', label: 'Profile', icon: User },
];

const MOBILE_NAV_ITEMS = [
  { href: '/explore', label: 'Explore', icon: Map },
  { href: '/climbing', label: 'Climb', icon: Mountain },
  { href: '/board', label: 'Board', icon: Users },
  { href: '/trip', label: 'Trip', icon: CalendarDays },
  { href: '/record', label: 'Record', icon: Play },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { preferences, dispatch } = usePreferences();
  const { user, loading: authLoading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isMetric = preferences.units === 'metric';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8 rounded-lg bg-canopy flex items-center justify-center">
              <Mountain className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block font-display text-lg font-bold text-gray-900 group-hover:text-canopy transition-colors">
              Cairn Connect
            </span>
          </Link>

          {/* Nav links - clean horizontal tabs */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'relative px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-canopy'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-canopy rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Units toggle */}
            <button
              onClick={() =>
                dispatch({ type: 'SET_UNITS', units: isMetric ? 'imperial' : 'metric' })
              }
              className="hidden sm:flex items-center rounded-full bg-gray-100 text-xs font-medium overflow-hidden"
              aria-label={`Switch to ${isMetric ? 'imperial' : 'metric'} units`}
            >
              <span
                className={clsx(
                  'px-2.5 py-1.5 transition-colors rounded-full',
                  !isMetric ? 'bg-canopy text-white' : 'text-gray-500',
                )}
              >
                mi
              </span>
              <span
                className={clsx(
                  'px-2.5 py-1.5 transition-colors rounded-full',
                  isMetric ? 'bg-canopy text-white' : 'text-gray-500',
                )}
              >
                km
              </span>
            </button>
            <Link
              href="/dashboard/upgrade"
              className="hidden lg:flex items-center gap-1.5 rounded-full bg-spotlight-gold-bg px-3 py-1.5 text-xs font-semibold text-spotlight-gold hover:bg-orange-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Spotlight
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-canopy/10 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-canopy" />
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[100px] truncate font-medium">
                    {user.user_metadata?.display_name || user.email?.split('@')[0] || 'Account'}
                  </span>
                </button>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-elevated z-50 py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1" />
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await signOut();
                          router.push('/');
                          router.refresh();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-full bg-canopy px-4 py-2 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav - clean with active indicator */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 pb-safe">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium min-w-[3rem]',
                  isActive ? 'text-canopy' : 'text-gray-400'
                )}
              >
                <Icon className={clsx('h-5 w-5', isActive && 'stroke-[2.5]')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
