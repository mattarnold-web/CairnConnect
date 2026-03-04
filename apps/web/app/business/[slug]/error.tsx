'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Business page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mb-4">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-100 mb-2">
          Error loading business
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          We couldn&apos;t load this business listing. It may be temporarily unavailable.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-canopy px-5 py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
