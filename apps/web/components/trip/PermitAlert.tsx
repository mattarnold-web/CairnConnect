'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

interface PermitAlertProps {
  trailNames: string[];
  reason: string;
}

export function PermitAlert({ trailNames, reason }: PermitAlertProps) {
  return (
    <div className="rounded-xl bg-spotlight-gold/10 border border-spotlight-gold/30 p-3">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-spotlight-gold shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-spotlight-gold text-sm">Permit Required</p>
          <p className="text-xs text-spotlight-gold/80 mt-0.5">
            {trailNames.join(', ')}
          </p>
          <p className="text-xs text-gray-500 mt-1">{reason}</p>
          <Link
            href="/board"
            className="inline-block mt-2 text-canopy text-xs hover:underline"
          >
            Check the Activity Board for permit shares &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
