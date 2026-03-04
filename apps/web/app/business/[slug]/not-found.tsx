import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function BusinessNotFound() {
  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-4 pt-32 text-center px-4">
        <h1 className="font-display text-2xl font-bold text-slate-100">Business not found</h1>
        <p className="text-slate-400">We could not find a business matching that URL.</p>
        <Link
          href="/explore"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-canopy px-5 py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>
    </div>
  );
}
