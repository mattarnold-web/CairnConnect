'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, onClose, duration]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="flex items-center gap-2.5 rounded-xl bg-canopy/95 backdrop-blur-sm border border-canopy-dark/50 px-4 py-3 shadow-lg shadow-canopy/20">
        <Check className="h-4 w-4 text-white shrink-0" />
        <span className="text-sm font-medium text-white whitespace-nowrap">
          {message}
        </span>
        <button
          onClick={onClose}
          className="ml-1 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
