import { Navbar } from '@/components/layout/Navbar';

export default function TrailLoading() {
  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      {/* Hero skeleton */}
      <div className="relative h-[300px] bg-cairn-elevated animate-pulse" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-8 relative z-10 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-cairn-elevated rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-cairn-elevated rounded animate-pulse" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-cairn-card border border-cairn-border p-4 animate-pulse">
              <div className="h-5 w-16 bg-cairn-elevated rounded mb-2" />
              <div className="h-3 w-12 bg-cairn-elevated rounded" />
            </div>
          ))}
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-32 bg-cairn-elevated rounded animate-pulse" />
          <div className="h-4 w-full bg-cairn-elevated rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-cairn-elevated rounded animate-pulse" />
        </div>

        {/* Map skeleton */}
        <div className="h-64 rounded-2xl bg-cairn-elevated border border-cairn-border animate-pulse" />
      </div>
    </div>
  );
}
