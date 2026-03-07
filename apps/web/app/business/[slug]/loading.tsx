import { Navbar } from '@/components/layout/Navbar';

export default function BusinessLoading() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />
      {/* Cover skeleton */}
      <div className="relative h-[300px] bg-gray-100 animate-pulse" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-8 relative z-10 space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-8 w-56 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Link bar skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-20 h-16 rounded-xl bg-white border border-gray-200 animate-pulse shrink-0" />
          ))}
        </div>

        {/* About skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Reviews skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-28 bg-gray-100 rounded animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 p-4 animate-pulse">
              <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
