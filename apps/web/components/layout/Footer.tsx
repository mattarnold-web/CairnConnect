'use client';

import Link from 'next/link';
import { Mountain } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-cairn-border bg-cairn-bg mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-canopy to-canopy-dark flex items-center justify-center">
                <Mountain className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Cairn Connect</span>
            </div>
            <p className="text-sm text-slate-500">
              Find your trail. Find your people.
            </p>
            <p className="text-xs text-slate-600">
              Part of the Cairn ecosystem
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">Explore</h4>
            <div className="space-y-2">
              <Link href="/explore" className="block text-sm text-slate-500 hover:text-slate-300">Map & Businesses</Link>
              <Link href="/explore?tab=trails" className="block text-sm text-slate-500 hover:text-slate-300">Trails</Link>
              <Link href="/board" className="block text-sm text-slate-500 hover:text-slate-300">Activity Board</Link>
            </div>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">For Businesses</h4>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-sm text-slate-500 hover:text-slate-300">Business Dashboard</Link>
              <Link href="/dashboard/upgrade" className="block text-sm text-slate-500 hover:text-slate-300">Spotlight Plans</Link>
              <span className="block text-sm text-slate-500">Claim Your Listing</span>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">Support</h4>
            <div className="space-y-2">
              <span className="block text-sm text-slate-500">Privacy Policy</span>
              <span className="block text-sm text-slate-500">Terms of Service</span>
              <span className="block text-sm text-slate-500">Contact Us</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cairn-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Cairn Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>Cairn AI (B2B)</span>
            <span className="text-cairn-border">|</span>
            <span>Cairn Connect (Consumer)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
