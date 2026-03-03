'use client';

import { Navbar } from '@/components/layout/Navbar';
import { RecommendationPanel } from '@/components/trip/RecommendationPanel';

export default function RecommendPage() {
  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />
      <main className="pt-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24">
        <RecommendationPanel />
      </main>
    </div>
  );
}
