import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Map,
  Mountain,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Search,
  Shield,
  Globe,
  Smartphone,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Lock,
  FileText,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
} from 'lucide-react';
import { DemoButton } from '@/components/demo/DemoButton';

export const metadata: Metadata = {
  title: 'Cairn Connect — Find Your Trail. Find Your People.',
  description:
    'Discover outdoor businesses, explore trails with real-time conditions, and connect with adventure partners — all in one platform.',
};

const HERO_STATS = [
  { value: '12K+', label: 'Trails', icon: TrendingUp },
  { value: '5K+', label: 'Businesses', icon: MapPin },
  { value: '29', label: 'Activities', icon: Activity },
  { value: '13', label: 'Regions', icon: Globe },
];

const FEATURES = [
  {
    icon: Map,
    title: 'Map-First Discovery',
    description:
      'Every business, trail, and activity pinned on an interactive outdoor map.',
    href: '/explore',
    cta: 'Open Map',
  },
  {
    icon: Mountain,
    title: 'Trail Intelligence',
    description:
      'Real-time conditions, difficulty ratings, and elevation profiles.',
    href: '/explore?tab=trails',
    cta: 'Browse Trails',
  },
  {
    icon: Users,
    title: 'Activity Board',
    description:
      'Post plans, share permits, find partners. Three post types: "I\'m Going", "Open Permit", and "LFG".',
    href: '/board',
    cta: 'View Board',
  },
  {
    icon: Sparkles,
    title: 'Spotlight Businesses',
    description:
      'Premium visibility for outdoor businesses with featured pins and analytics.',
    href: '/dashboard',
    cta: 'Learn More',
  },
  {
    icon: Smartphone,
    title: 'Device Sync',
    description:
      'Connect Strava, Garmin, Apple Health. Import GPX/FIT files automatically.',
    href: '/record',
    cta: 'Record Now',
  },
  {
    icon: Globe,
    title: 'Global From Day One',
    description:
      'From Moab to Chamonix, Whistler to Queenstown. Every outdoor destination.',
    href: '/trip',
    cta: 'Plan a Trip',
  },
];

const TOP_ACTIVITIES = [
  { emoji: '🚵', label: 'Mountain Biking', count: '3,200+ trails', slug: 'mtb', href: '/explore?activity=mtb', color: '#F59E0B' },
  { emoji: '🥾', label: 'Hiking', count: '8,500+ trails', slug: 'hiking', href: '/explore?activity=hiking', color: '#10B981' },
  { emoji: '🧗', label: 'Rock Climbing', count: '1,100+ routes', slug: 'climbing', href: '/climbing', color: '#8B5CF6' },
];

const MORE_ACTIVITIES = [
  { emoji: '🛶', label: 'Kayaking', count: '900+ routes', href: '/explore?activity=kayaking' },
  { emoji: '⛷️', label: 'Skiing', count: '450+ resorts', href: '/explore?activity=skiing' },
  { emoji: '🏃', label: 'Trail Running', count: '6,200+ trails', href: '/explore?activity=trail_running' },
  { emoji: '🏕️', label: 'Camping', count: '2,800+ sites', href: '/explore?activity=camping' },
  { emoji: '🎣', label: 'Fly Fishing', count: '1,500+ spots', href: '/explore?activity=fly_fishing' },
  { emoji: '🪂', label: 'Paragliding', count: '320+ sites', href: '/explore?activity=paragliding' },
  { emoji: '🏂', label: 'Snowboarding', count: '400+ resorts', href: '/explore?activity=snowboarding' },
  { emoji: '🐦', label: 'Birdwatching', count: '2,100+ spots', href: '/explore?activity=birdwatching' },
];

const SEASONAL_HIGHLIGHTS = [
  { season: 'Spring', emoji: '🌸', activities: ['Hiking', 'Rock Climbing', 'Kayaking'], regions: ['Moab, UT', 'Sedona, AZ', 'Smith Rock, OR'] },
  { season: 'Summer', emoji: '☀️', activities: ['MTB', 'Trail Running', 'Paddleboard'], regions: ['Bend, OR', 'Whistler, BC', 'Chamonix, FR'] },
  { season: 'Fall', emoji: '🍂', activities: ['Hiking', 'Climbing', 'Fly Fishing'], regions: ['Boulder, CO', 'Yosemite, CA', 'Queenstown, NZ'] },
  { season: 'Winter', emoji: '❄️', activities: ['Skiing', 'Snowboarding', 'Ice Climbing'], regions: ['Park City, UT', 'Revelstoke, BC', 'Innsbruck, AT'] },
];

const SPOTLIGHT_TIERS = [
  {
    name: 'Founding',
    price: '$199',
    period: '/year',
    badge: 'Limited — First 100',
    features: [
      'Gold Spotlight pin on map',
      'Priority search ranking',
      'Monthly analytics dashboard',
      'Special offer banner',
      'Locked-in founding rate forever',
    ],
    highlighted: true,
  },
  {
    name: 'Standard',
    price: '$299',
    period: '/year',
    badge: null,
    features: [
      'Gold Spotlight pin on map',
      'Priority search ranking',
      'Monthly analytics dashboard',
      'Special offer banner',
      'Email support',
    ],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$499',
    period: '/year',
    badge: 'Multi-location',
    features: [
      'Everything in Standard',
      'Multi-location support',
      'Featured in region highlights',
      'Priority customer support',
      'Custom branding options',
    ],
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Clean, Strava-inspired */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Find Your Trail.
              <br />
              <span className="text-canopy">
                Find Your People.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl leading-relaxed">
              Discover trails, connect with adventure partners, and explore outdoor businesses — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link
                href="/explore"
                className="flex items-center justify-center gap-2 rounded-full bg-canopy px-7 py-3 text-base font-semibold text-white hover:bg-canopy-dark transition-all shadow-sm"
              >
                <Map className="h-5 w-5" />
                Explore the Map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                <Sparkles className="h-5 w-5 text-spotlight-gold" />
                List Your Business
              </Link>
              <DemoButton />
            </div>
          </div>

          {/* Stats row - Strava-style big numbers */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 border-t border-gray-100 pt-10">
            {HERO_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-canopy" />
                  </div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-bold text-gray-900 stat-number">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map Preview - cleaner card treatment */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-elevated">
          <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
            <div className="absolute inset-0 opacity-[0.06]">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`h${i}`}
                  className="absolute left-0 right-0 border-t border-gray-400"
                  style={{ top: `${i * 5}%` }}
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`v${i}`}
                  className="absolute top-0 bottom-0 border-l border-gray-400"
                  style={{ left: `${i * 5}%` }}
                />
              ))}
            </div>

            {/* Sample pins */}
            <div className="absolute top-[30%] left-[25%] flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-canopy flex items-center justify-center text-white text-sm shadow-md">
                🚲
              </div>
              <div className="mt-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-gray-700 shadow-sm font-medium">
                Chile Pepper
              </div>
            </div>
            <div className="absolute top-[45%] left-[55%] flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-spotlight-gold border-2 border-white flex items-center justify-center text-white text-sm shadow-lg spotlight-pulse">
                🧭
              </div>
              <div className="mt-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-spotlight-gold shadow-sm font-medium">
                ★ Rim Tours
              </div>
            </div>
            <div className="absolute top-[60%] left-[35%] hidden sm:flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm shadow-md">
                ☕
              </div>
              <div className="mt-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-gray-700 shadow-sm font-medium">
                Moab Diner
              </div>
            </div>
            <div className="absolute top-[20%] left-[70%] flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shadow-md">
                🥾
              </div>
              <div className="mt-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-gray-700 shadow-sm font-medium">
                Delicate Arch
              </div>
            </div>

            {/* Floating search bar */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 max-w-md">
              <div className="bg-white rounded-full border border-gray-200 h-10 sm:h-11 flex items-center px-4 gap-2 shadow-card">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-400">
                  Search Moab, Utah...
                </span>
              </div>
            </div>

            {/* Region highlights */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xs sm:text-sm font-semibold text-gray-900">
                  What&apos;s Hot in Moab
                </h3>
                <Link href="/explore" className="text-xs text-canopy font-medium flex items-center gap-1 hover:underline">
                  See all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
                {[
                  { emoji: '🚵', label: 'MTB', count: 45 },
                  { emoji: '🥾', label: 'Hiking', count: 38 },
                  { emoji: '🧗', label: 'Climbing', count: 22 },
                  { emoji: '🛶', label: 'Kayaking', count: 12 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 shrink-0"
                  >
                    <span className="text-base">{item.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                      <div className="text-[10px] text-gray-400">{item.count} trails</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Everything Outdoor, One Platform
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500">
              Yelp + Strava + Meetup for the outdoors
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-card-hover transition-all group block"
                >
                  <div className="h-10 w-10 rounded-full bg-canopy/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-canopy" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-canopy group-hover:gap-2 transition-all">
                    {feature.cta}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            29 Activities. One App.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500">
            From mountain biking to paragliding, we&apos;ve got your adventure covered
          </p>
        </div>

        {/* Top 3 Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {TOP_ACTIVITIES.map((act) => (
            <Link
              key={act.slug}
              href={act.href}
              className="relative rounded-xl border border-gray-200 bg-white p-6 sm:p-8 hover:shadow-card-hover transition-all group text-center overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                style={{ background: `radial-gradient(circle at center, ${act.color}, transparent 70%)` }}
              />
              <span className="text-5xl sm:text-6xl block mb-4 relative">{act.emoji}</span>
              <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 group-hover:text-canopy transition-colors relative">
                {act.label}
              </h3>
              <p className="text-sm text-gray-400 mt-1 relative">{act.count}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-canopy opacity-0 group-hover:opacity-100 transition-opacity relative">
                Explore <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* More Activities */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {MORE_ACTIVITIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-card-hover transition-all group text-center"
            >
              <span className="text-2xl sm:text-3xl block mb-2">{cat.emoji}</span>
              <h3 className="font-display text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-canopy transition-colors">
                {cat.label}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal Recommendations */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-canopy/10 px-4 py-1.5 text-sm text-canopy font-medium mb-4">
              <Calendar className="h-4 w-4" />
              Season Planner
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Best Activities by Season
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500">
              Plan your adventures around the best conditions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEASONAL_HIGHLIGHTS.map((s) => (
              <div
                key={s.season}
                className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{s.emoji}</span>
                  <h3 className="font-display text-lg font-semibold text-gray-900">{s.season}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Top Activities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.activities.map((a) => (
                        <span key={a} className="rounded-full bg-canopy/10 px-2.5 py-0.5 text-[10px] text-canopy font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Top Regions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.regions.map((r) => (
                        <span key={r} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] text-gray-500">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Hazards CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Community Trail Updates
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Report hazards, trail closures, and conditions to keep the community safe.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report a Hazard
                </Link>
                <Link
                  href="/explore?tab=trails"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Trail Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Pricing */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-spotlight-gold-bg px-4 py-1.5 text-sm text-spotlight-gold font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              For Businesses
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Spotlight Your Business
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Get premium visibility, analytics, and features to attract more outdoor enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {SPOTLIGHT_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-5 sm:p-6 ${
                  tier.highlighted
                    ? 'border-spotlight-gold bg-white shadow-elevated relative'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-spotlight-gold px-3 py-1 text-xs font-bold text-white whitespace-nowrap shadow-sm">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6 pt-2">
                  <h3 className="font-display text-xl font-bold text-gray-900">
                    {tier.name}
                  </h3>
                  <div className="mt-2">
                    <span className="font-display text-3xl sm:text-4xl font-bold text-gray-900 stat-number">
                      {tier.price}
                    </span>
                    <span className="text-gray-400">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-canopy shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/upgrade"
                  className={`block w-full text-center rounded-full py-3 text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-spotlight-gold text-white hover:bg-spotlight-gold-dark shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="rounded-2xl bg-gray-900 p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of outdoor enthusiasts discovering trails, businesses, and adventure partners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-canopy px-8 py-3.5 text-base font-semibold text-white hover:bg-canopy-dark transition-all"
            >
              <Map className="h-5 w-5" />
              Open the Map
            </Link>
            <Link
              href="/board"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-gray-600 px-8 py-3.5 text-base font-semibold text-gray-300 hover:bg-gray-800 transition-all"
            >
              <Users className="h-5 w-5" />
              Browse Activities
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-canopy flex items-center justify-center">
                  <Mountain className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold text-gray-900">Cairn Connect</span>
              </div>
              <p className="text-sm text-gray-400">Find your trail. Find your people.</p>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-gray-900 mb-3">Explore</h4>
              <div className="space-y-2">
                <Link href="/explore" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Map</Link>
                <Link href="/climbing" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Climbing</Link>
                <Link href="/board" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Activity Board</Link>
                <Link href="/trip" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Trip Planner</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-gray-900 mb-3">For Businesses</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
                <Link href="/dashboard/upgrade" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Spotlight</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-gray-900 mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <Lock className="h-3 w-3" />
                  Privacy Policy
                </Link>
                <Link href="/privacy" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <FileText className="h-3 w-3" />
                  Terms of Service
                </Link>
                <Link href="/settings" className="block text-sm text-gray-500 hover:text-gray-900 transition-colors">Settings</Link>
                <span className="block text-sm text-gray-400">hello@cairnconnect.app</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Cairn Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
