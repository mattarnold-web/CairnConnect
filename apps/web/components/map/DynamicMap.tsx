'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type { BaseMap } from './BaseMap';

/**
 * Dynamically imported map wrapper that prevents SSR issues with Leaflet.
 * All map components use this to avoid "window is not defined" errors.
 */
const DynamicMap = dynamic(() => import('./BaseMap').then((m) => m.BaseMap), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-2xl border border-gray-200 animate-pulse">
      <div className="text-gray-400 text-sm py-12">Loading map...</div>
    </div>
  ),
});

export { DynamicMap };
export type DynamicMapProps = ComponentProps<typeof BaseMap>;
