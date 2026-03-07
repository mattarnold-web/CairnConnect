import { Navbar } from '@/components/layout/Navbar';

export default function TrailLoading() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />
      {/* Hero skeleton */}
      <div className="relative h-[300px] bg-gray-100 animate-pulse" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-8 relative z-10 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-200 p-4 animate-pulse">
              <div className="h-5 w-16 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Map skeleton */}
        <div className="h-64 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
