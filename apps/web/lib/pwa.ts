'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Registers the service worker if supported by the browser.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker registered with scope:', registration.scope);
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('Service Workers are not supported in this browser.');
    }
  }
}

/**
 * React hook that returns the current online/offline status.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptResult {
  canInstall: boolean;
  promptInstall: () => void;
}

/**
 * React hook that manages the PWA install prompt.
 */
export function useInstallPrompt(): InstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = useCallback(() => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (process.env.NODE_ENV === 'development') {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    });
  }, [deferredPrompt]);

  return { canInstall, promptInstall };
}
