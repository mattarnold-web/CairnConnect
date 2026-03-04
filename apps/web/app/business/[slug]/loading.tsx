import { Navbar } from '@/components/layout/Navbar';

export default function BusinessLoading() {
  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      {/* Cover skeleton */}
      <div className="relative h-[300px] bg-cairn-elevated animate-pulse" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-8 relative z-10 space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-8 w-56 bg-cairn-elevated rounded-lg animate-pulse" />
          <div className="h-4 w-36 bg-cairn-elevated rounded animate-pulse" />
        </div>

        {/* Link bar skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-20 h-16 rounded-xl bg-cairn-card border border-cairn-border animate-pulse shrink-0" />
          ))}
        </div>

        {/* About skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-24 bg-cairn-elevated rounded animate-pulse" />
          <div className="h-4 w-full bg-cairn-elevated rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-cairn-elevated rounded animate-pulse" />
        </div>

        {/* Reviews skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-28 bg-cairn-elevated rounded animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-cairn-card border border-cairn-border p-4 animate-pulse">
              <div className="h-4 w-24 bg-cairn-elevated rounded mb-2" />
              <div className="h-3 w-full bg-cairn-elevated rounded mb-1" />
              <div className="h-3 w-3/4 bg-cairn-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
