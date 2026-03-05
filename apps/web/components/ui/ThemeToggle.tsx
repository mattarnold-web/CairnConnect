'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (compact) {
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-cairn-card border border-cairn-border text-slate-400 hover:text-slate-200 hover:bg-cairn-card-hover transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div className="flex items-center rounded-lg bg-cairn-card border border-cairn-border text-xs font-medium overflow-hidden">
      {[
        { key: 'light', icon: Sun, label: 'Light' },
        { key: 'dark', icon: Moon, label: 'Dark' },
        { key: 'system', icon: Monitor, label: 'Auto' },
      ].map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 transition-colors',
            theme === key ? 'bg-canopy/20 text-canopy' : 'text-slate-500 hover:text-slate-300'
          )}
          aria-label={`${label} theme`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
