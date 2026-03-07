'use client';

import Link from 'next/link';
import {
  Eye,
  ExternalLink,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  MessageSquare,
  Clock,
  Sparkles,
  Star,
  Edit,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Mock stat data
// ---------------------------------------------------------------------------

const STATS = [
  { label: 'Views', value: '1,247', change: '+12%', icon: Eye },
  { label: 'Website Clicks', value: '342', change: '+8%', icon: ExternalLink },
  { label: 'Direction Requests', value: '156', change: '+23%', icon: MapPin },
  { label: 'Booking Clicks', value: '89', change: '+15%', icon: Calendar },
];

// ---------------------------------------------------------------------------
// Fake 30-day chart data (random heights 20-100)
// ---------------------------------------------------------------------------

const CHART_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  views: Math.floor(Math.random() * 60) + 20,
  clicks: Math.floor(Math.random() * 30) + 5,
}));

// ---------------------------------------------------------------------------
// Mock reviews
// ---------------------------------------------------------------------------

const MOCK_REVIEWS = [
  {
    id: 'r1',
    author: 'Sarah K.',
    stars: 5,
    text: 'Best bike shop in Moab! They set me up with a full-suspension rental and gave great trail recommendations.',
    date: '2 days ago',
  },
  {
    id: 'r2',
    author: 'James P.',
    stars: 4,
    text: 'Good selection and friendly staff. Prices are fair for the area. Would recommend for any visiting riders.',
    date: '1 week ago',
  },
  {
    id: 'r3',
    author: 'Mika T.',
    stars: 5,
    text: 'They fixed my flat in 10 minutes and didn\'t even charge me. Will definitely be back next season!',
    date: '2 weeks ago',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const maxChartValue = Math.max(...CHART_DATA.map((d) => d.views));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Business Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your listing and track performance
          </p>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-canopy/30 bg-canopy/10 px-4 py-3 text-sm text-canopy mb-6">
          This is a preview of the business dashboard. Sign in to manage your listing.
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-canopy/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-canopy" />
                  </div>
                </div>
                <div className="font-display text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{stat.label}</span>
                  <span className="text-xs font-medium text-emerald-400">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-canopy" />
              <h2 className="font-display text-lg font-semibold text-gray-900">
                30-Day Performance
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-canopy" />
                Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-spotlight-gold" />
                Clicks
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-[3px] h-40">
            {CHART_DATA.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-stretch gap-[1px] h-full justify-end">
                {/* Views bar */}
                <div
                  className="w-full rounded-t-sm bg-canopy/80"
                  style={{ height: `${(d.views / maxChartValue) * 100}%` }}
                />
                {/* Clicks bar (overlaid shorter) */}
                <div
                  className="w-full rounded-t-sm bg-spotlight-gold/60"
                  style={{ height: `${(d.clicks / maxChartValue) * 100}%` }}
                />
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-[10px] text-gray-300">
            <span>Day 1</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Day 30</span>
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Edit className="h-4 w-4" />
                Edit Listing
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4" />
                Respond to Reviews
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="h-4 w-4" />
                Update Hours
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">
              Recent Reviews
            </h2>
            <div className="space-y-4">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-800">
                      {review.author}
                    </span>
                    <span className="text-[10px] text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.stars
                            ? 'text-spotlight-gold fill-spotlight-gold'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spotlight upsell card */}
        <div className="rounded-2xl border-2 border-spotlight-gold/40 bg-spotlight-gold/5 p-6 spotlight-glow">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-spotlight-gold/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-spotlight-gold" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-spotlight-gold mb-1">
                Upgrade to Spotlight
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Get premium visibility and attract more outdoor enthusiasts to your business.
              </p>
              <ul className="space-y-2 mb-5">
                {[
                  'Gold Spotlight pin on the map',
                  'Priority search ranking',
                  'Monthly analytics dashboard',
                  'Special offer banner on your listing',
                  'Founding rate locked in forever',
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <Star className="h-3.5 w-3.5 text-spotlight-gold shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/upgrade">
                <Button variant="spotlight" size="lg">
                  <Sparkles className="h-4 w-4" />
                  Get Spotlight — Starting at $199/yr
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
