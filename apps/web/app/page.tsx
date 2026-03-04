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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cairn Connect — Find Your Trail. Find Your People.',
  description:
    'Discover outdoor businesses, explore trails with real-time conditions, and connect with adventure partners — all in one platform.',
};

const HERO_STATS = [
  { value: '5,000+', label: 'Businesses' },
  { value: '12,000+', label: 'Trails' },
  { value: '29', label: 'Activity Types' },
  { value: '13', label: 'Regions' },
];

const FEATURES = [
  {
    icon: Map,
    title: 'Map-First Discovery',
    description:
      'Every business, trail, and activity pinned on an interactive outdoor map. Find what you need, where you are.',
    href: '/explore',
    cta: 'Open Map',
  },
  {
    icon: Mountain,
    title: 'Trail Intelligence',
    description:
      'Real-time conditions, difficulty ratings, elevation profiles, and community-reported trail conditions.',
    href: '/explore?tab=trails',
    cta: 'Browse Trails',
  },
  {
    icon: Users,
    title: 'Activity Board',
    description:
      'Post your plans, share permits, find adventure partners. Three post types: "I\'m Going", "Open Permit", and "LFG".',
    href: '/board',
    cta: 'View Board',
  },
  {
    icon: Sparkles,
    title: 'Spotlight Businesses',
    description:
      'Premium visibility for outdoor businesses. Featured pins, priority search ranking, and monthly analytics.',
    href: '/dashboard',
    cta: 'Learn More',
  },
  {
    icon: Smartphone,
    title: 'Device Sync',
    description:
      'Connect Strava, Garmin, Apple Health. Import GPX/FIT files. Auto-match your activities to trails.',
    href: '/record',
    cta: 'Record Now',
  },
  {
    icon: Globe,
    title: 'Global From Day One',
    description:
      'From Moab to Chamonix, Whistler to Queenstown. Built for every outdoor destination on Earth.',
    href: '/trip',
    cta: 'Plan a Trip',
  },
];

// Top 3 featured activities with direct links
const TOP_ACTIVITIES = [
  { emoji: '🚵', label: 'Mountain Biking', count: '3,200+ trails', slug: 'mtb', href: '/explore?activity=mtb', color: '#F59E0B' },
  { emoji: '🥾', label: 'Hiking', count: '8,500+ trails', slug: 'hiking', href: '/explore?activity=hiking', color: '#10B981' },
  { emoji: '🧗', label: 'Rock Climbing', count: '1,100+ routes', slug: 'climbing', href: '/climbing', color: '#8B5CF6' },
];

// Additional activities in a pick list
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
    <div className="min-h-screen bg-cairn-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-canopy/10 via-cairn-bg to-cairn-bg" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-canopy/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-spotlight-gold/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-canopy/10 border border-canopy/20 px-4 py-1.5 text-sm text-canopy">
              <Mountain className="h-4 w-4" />
              The Outdoor Activity Platform
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="text-slate-100">Find Your Trail.</span>
              <br />
              <span className="bg-gradient-to-r from-canopy to-emerald-400 bg-clip-text text-transparent">
                Find Your People.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Discover outdoor businesses, explore trails with real-time conditions,
              and connect with adventure partners — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/explore"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-canopy px-8 py-3.5 text-base font-semibold text-white hover:bg-canopy-dark transition-all shadow-lg shadow-canopy/25 hover:shadow-canopy/40"
              >
                <Map className="h-5 w-5" />
                Explore the Map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-cairn-card-hover transition-all"
              >
                <Sparkles className="h-5 w-5 text-spotlight-gold" />
                List Your Business
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 sm:gap-12 pt-8 flex-wrap">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 mb-20">
        <div className="rounded-2xl border border-cairn-border bg-cairn-card overflow-hidden shadow-2xl shadow-black/20">
          <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-cairn-elevated via-[#0d2240] to-cairn-bg">
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`h${i}`}
                  className="absolute left-0 right-0 border-t border-slate-500"
                  style={{ top: `${i * 5}%` }}
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`v${i}`}
                  className="absolute top-0 bottom-0 border-l border-slate-500"
                  style={{ left: `${i * 5}%` }}
                />
              ))}
            </div>

            {/* Sample pins */}
            <div className="absolute top-[30%] left-[25%] flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-canopy/80 flex items-center justify-center text-white text-sm shadow-lg spotlight-pulse">
                🚲
              </div>
              <div className="mt-1 rounded-md bg-cairn-bg/80 px-1.5 py-0.5 text-[9px] text-slate-300 backdrop-blur-sm">
                Chile Pepper
              </div>
            </div>
            <div className="absolute top-[45%] left-[55%] flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-spotlight-gold/80 border-2 border-spotlight-gold flex items-center justify-center text-white text-sm shadow-lg spotlight-pulse">
                🧭
              </div>
              <div className="mt-1 rounded-md bg-cairn-bg/80 px-1.5 py-0.5 text-[9px] text-spotlight-gold backdrop-blur-sm">
                ★ Rim Tours
              </div>
            </div>
            <div className="absolute top-[60%] left-[35%] hidden sm:flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-canopy/80 flex items-center justify-center text-white text-sm shadow-lg">
                ☕
              </div>
              <div className="mt-1 rounded-md bg-cairn-bg/80 px-1.5 py-0.5 text-[9px] text-slate-300 backdrop-blur-sm">
                Moab Diner
              </div>
            </div>
            <div className="absolute top-[20%] left-[70%] flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500/80 flex items-center justify-center text-white text-sm shadow-lg">
                🥾
              </div>
              <div className="mt-1 rounded-md bg-cairn-bg/80 px-1.5 py-0.5 text-[9px] text-slate-300 backdrop-blur-sm">
                Delicate Arch
              </div>
            </div>

            {/* Floating search bar */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 max-w-md">
              <div className="glass rounded-full border border-cairn-border h-10 sm:h-11 flex items-center px-4 gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <span className="text-xs sm:text-sm text-slate-500">
                  Search Moab, Utah...
                </span>
              </div>
            </div>

            {/* Region highlights */}
            <div className="absolute bottom-4 left-4 right-4 glass rounded-xl border border-cairn-border p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xs sm:text-sm font-semibold text-slate-200">
                  What&apos;s Hot in Moab
                </h3>
                <Link href="/explore" className="text-xs text-canopy flex items-center gap-1 hover:underline">
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
                    className="flex items-center gap-2 rounded-lg bg-cairn-card/50 border border-cairn-border/50 px-2.5 sm:px-3 py-1.5 sm:py-2 shrink-0"
                  >
                    <span className="text-base sm:text-lg">{item.emoji}</span>
                    <div>
                      <div className="text-[10px] sm:text-xs font-semibold text-slate-200">{item.label}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500">{item.count} trails</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - each card drills down */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100">
            Everything Outdoor, One Platform
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400">
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
                className="rounded-2xl border border-cairn-border bg-cairn-card p-5 sm:p-6 hover:bg-cairn-card-hover transition-colors group block"
              >
                <div className="h-12 w-12 rounded-xl bg-canopy/10 flex items-center justify-center mb-4 group-hover:bg-canopy/20 transition-colors">
                  <Icon className="h-6 w-6 text-canopy" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
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
      </section>

      {/* Top 3 Activities (clickable) + Pick List */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100">
            29 Activities. One App.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400">
            From mountain biking to paragliding, we&apos;ve got your adventure covered
          </p>
        </div>

        {/* Top 3 Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {TOP_ACTIVITIES.map((act) => (
            <Link
              key={act.slug}
              href={act.href}
              className="relative rounded-2xl border border-cairn-border bg-cairn-card p-6 sm:p-8 hover:bg-cairn-card-hover transition-all group text-center overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: `radial-gradient(circle at center, ${act.color}, transparent 70%)` }}
              />
              <span className="text-5xl sm:text-6xl block mb-4 relative">{act.emoji}</span>
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100 group-hover:text-canopy transition-colors relative">
                {act.label}
              </h3>
              <p className="text-sm text-slate-500 mt-1 relative">{act.count}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-canopy opacity-0 group-hover:opacity-100 transition-opacity relative">
                Explore <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* More Activities - Pick List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {MORE_ACTIVITIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="rounded-xl border border-cairn-border bg-cairn-card p-4 hover:bg-cairn-card-hover transition-all group text-center"
            >
              <span className="text-2xl sm:text-3xl block mb-2">{cat.emoji}</span>
              <h3 className="font-display text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-canopy transition-colors">
                {cat.label}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal Recommendations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-canopy/10 border border-canopy/20 px-4 py-1.5 text-sm text-canopy mb-4">
            <Calendar className="h-4 w-4" />
            Season Planner
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100">
            Best Activities by Season
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400">
            Plan your adventures around the best conditions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEASONAL_HIGHLIGHTS.map((s) => (
            <div
              key={s.season}
              className="rounded-2xl border border-cairn-border bg-cairn-card p-5 hover:bg-cairn-card-hover transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{s.emoji}</span>
                <h3 className="font-display text-lg font-semibold text-slate-100">{s.season}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Top Activities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.activities.map((a) => (
                      <span key={a} className="rounded-full bg-canopy/10 border border-canopy/20 px-2.5 py-0.5 text-[10px] text-canopy">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Top Regions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.regions.map((r) => (
                      <span key={r} className="rounded-full bg-cairn-elevated/50 border border-cairn-border px-2.5 py-0.5 text-[10px] text-slate-400">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Hazards CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                Community Trail Updates
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Report hazards, trail closures, and conditions to keep the community safe.
                Your reports help others plan safer adventures.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-5 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/25 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report a Hazard
                </Link>
                <Link
                  href="/explore?tab=trails"
                  className="inline-flex items-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover transition-colors"
                >
                  View Trail Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Pricing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-spotlight-gold/10 border border-spotlight-gold/20 px-4 py-1.5 text-sm text-spotlight-gold mb-4">
            <Sparkles className="h-4 w-4" />
            For Businesses
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100">
            Spotlight Your Business
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Get premium visibility, analytics, and features to attract more outdoor enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {SPOTLIGHT_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-5 sm:p-6 ${
                tier.highlighted
                  ? 'border-spotlight-gold bg-spotlight-gold/5 spotlight-glow relative'
                  : 'border-cairn-border bg-cairn-card'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-spotlight-gold px-3 py-1 text-xs font-bold text-cairn-bg whitespace-nowrap">
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="text-center mb-6 pt-2">
                <h3 className="font-display text-xl font-bold text-slate-100">
                  {tier.name}
                </h3>
                <div className="mt-2">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-slate-100">
                    {tier.price}
                  </span>
                  <span className="text-slate-500">{tier.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-400">
                    <Shield className="h-4 w-4 text-canopy shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/upgrade"
                className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-spotlight-gold text-cairn-bg hover:bg-spotlight-gold-dark'
                    : 'bg-cairn-elevated text-slate-300 hover:bg-cairn-card-hover'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="rounded-2xl border border-canopy/20 bg-gradient-to-br from-canopy/10 to-cairn-bg p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-4">
            Ready to Explore?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of outdoor enthusiasts discovering trails, businesses, and adventure partners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-canopy px-8 py-3.5 text-base font-semibold text-white hover:bg-canopy-dark transition-all shadow-lg shadow-canopy/25"
            >
              <Map className="h-5 w-5" />
              Open the Map
            </Link>
            <Link
              href="/board"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-cairn-card-hover transition-all"
            >
              <Users className="h-5 w-5" />
              Browse Activities
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cairn-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-canopy to-canopy-dark flex items-center justify-center">
                  <Mountain className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold">Cairn Connect</span>
              </div>
              <p className="text-sm text-slate-500">Find your trail. Find your people.</p>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">Explore</h4>
              <div className="space-y-2">
                <Link href="/explore" className="block text-sm text-slate-500 hover:text-slate-300">Map</Link>
                <Link href="/climbing" className="block text-sm text-slate-500 hover:text-slate-300">Climbing</Link>
                <Link href="/board" className="block text-sm text-slate-500 hover:text-slate-300">Activity Board</Link>
                <Link href="/trip" className="block text-sm text-slate-500 hover:text-slate-300">Trip Planner</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">For Businesses</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-sm text-slate-500 hover:text-slate-300">Dashboard</Link>
                <Link href="/dashboard/upgrade" className="block text-sm text-slate-500 hover:text-slate-300">Spotlight</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300">
                  <Lock className="h-3 w-3" />
                  Privacy Policy
                </Link>
                <Link href="/privacy" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300">
                  <FileText className="h-3 w-3" />
                  Terms of Service
                </Link>
                <Link href="/settings" className="block text-sm text-slate-500 hover:text-slate-300">Settings</Link>
                <span className="block text-sm text-slate-500">hello@cairnconnect.app</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cairn-border text-center text-xs text-slate-600" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Cairn Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
