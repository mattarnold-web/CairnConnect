'use client';

import { Navbar } from '@/components/layout/Navbar';
import { TripWizard } from '@/components/trip/TripWizard';

export default function TripPlannerPage() {
  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />
      <main className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <TripWizard />
      </main>
    </div>
  );
}
