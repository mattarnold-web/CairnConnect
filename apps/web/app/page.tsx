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
} from 'lucide-react';

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
  },
  {
    icon: Mountain,
    title: 'Trail Intelligence',
    description:
      'Real-time conditions, difficulty ratings, elevation profiles, and community-reported trail conditions.',
  },
  {
    icon: Users,
    title: 'Activity Board',
    description:
      'Post your plans, share permits, find adventure partners. Three post types: "I\'m Going", "Open Permit", and "LFG".',
  },
  {
    icon: Sparkles,
    title: 'Spotlight Businesses',
    description:
      'Premium visibility for outdoor businesses. Featured pins, priority search ranking, and monthly analytics.',
  },
  {
    icon: Smartphone,
    title: 'Device Sync',
    description:
      'Connect Strava, Garmin, Apple Health. Import GPX/FIT files. Auto-match your activities to trails.',
  },
  {
    icon: Globe,
    title: 'Global From Day One',
    description:
      'From Moab to Chamonix, Whistler to Queenstown. Built for every outdoor destination on Earth.',
  },
];

const ACTIVITY_CATEGORIES = [
  { emoji: '🚵', label: 'Mountain Biking', count: '3,200+ trails' },
  { emoji: '🥾', label: 'Hiking', count: '8,500+ trails' },
  { emoji: '🧗', label: 'Rock Climbing', count: '1,100+ spots' },
  { emoji: '🛶', label: 'Kayaking', count: '900+ routes' },
  { emoji: '⛷️', label: 'Skiing', count: '450+ resorts' },
  { emoji: '🏃', label: 'Trail Running', count: '6,200+ trails' },
  { emoji: '🏕️', label: 'Camping', count: '2,800+ sites' },
  { emoji: '🎣', label: 'Fly Fishing', count: '1,500+ spots' },
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
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-canopy/10 via-cairn-bg to-cairn-bg" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-canopy/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-spotlight-gold/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-canopy/10 border border-canopy/20 px-4 py-1.5 text-sm text-canopy">
              <Mountain className="h-4 w-4" />
              The Outdoor Activity Platform
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-slate-100">Find Your Trail.</span>
              <br />
              <span className="bg-gradient-to-r from-canopy to-emerald-400 bg-clip-text text-transparent">
                Find Your People.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Discover outdoor businesses, explore trails with real-time conditions,
              and connect with adventure partners — all in one platform.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/explore"
                className="flex items-center gap-2 rounded-xl bg-canopy px-8 py-3.5 text-base font-semibold text-white hover:bg-canopy-dark transition-all shadow-lg shadow-canopy/25 hover:shadow-canopy/40"
              >
                <Map className="h-5 w-5" />
                Explore the Map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-cairn-card-hover transition-all"
              >
                <Sparkles className="h-5 w-5 text-spotlight-gold" />
                List Your Business
              </Link>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 pt-8">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-slate-100">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Preview / Explore CTA */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 mb-20">
        <div className="rounded-2xl border border-cairn-border bg-cairn-card overflow-hidden shadow-2xl shadow-black/20">
          {/* Fake map area */}
          <div className="relative h-[400px] bg-gradient-to-br from-cairn-elevated via-[#0d2240] to-cairn-bg">
            {/* Grid lines for map feel */}
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
            <div className="absolute top-[60%] left-[35%] flex flex-col items-center">
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
            <div className="absolute top-6 left-6 right-6 max-w-md">
              <div className="glass rounded-full border border-cairn-border h-11 flex items-center px-4 gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-500">
                  Search Moab, Utah...
                </span>
              </div>
            </div>

            {/* Region highlights card */}
            <div className="absolute bottom-4 left-4 right-4 glass rounded-xl border border-cairn-border p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold text-slate-200">
                  What&apos;s Hot in Moab
                </h3>
                <Link href="/explore" className="text-xs text-canopy flex items-center gap-1 hover:underline">
                  See all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {[
                  { emoji: '🚵', label: 'MTB', count: 45 },
                  { emoji: '🥾', label: 'Hiking', count: 38 },
                  { emoji: '🧗', label: 'Climbing', count: 22 },
                  { emoji: '🛶', label: 'Kayaking', count: 12 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg bg-cairn-card/50 border border-cairn-border/50 px-3 py-2 shrink-0"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.count} trails</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-100">
            Everything Outdoor, One Platform
          </h2>
          <p className="mt-3 text-lg text-slate-400">
            Yelp + Strava + Meetup for the outdoors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-cairn-border bg-cairn-card p-6 hover:bg-cairn-card-hover transition-colors group"
              >
                <div className="h-12 w-12 rounded-xl bg-canopy/10 flex items-center justify-center mb-4 group-hover:bg-canopy/20 transition-colors">
                  <Icon className="h-6 w-6 text-canopy" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-100">
            29 Activities. One App.
          </h2>
          <p className="mt-3 text-lg text-slate-400">
            From mountain biking to paragliding, we&apos;ve got your adventure covered
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ACTIVITY_CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href="/explore"
              className="rounded-2xl border border-cairn-border bg-cairn-card p-5 hover:bg-cairn-card-hover transition-all group text-center"
            >
              <span className="text-4xl block mb-3">{cat.emoji}</span>
              <h3 className="font-display text-sm font-semibold text-slate-200 group-hover:text-canopy transition-colors">
                {cat.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Spotlight Pricing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-spotlight-gold/10 border border-spotlight-gold/20 px-4 py-1.5 text-sm text-spotlight-gold mb-4">
            <Sparkles className="h-4 w-4" />
            For Businesses
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-100">
            Spotlight Your Business
          </h2>
          <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
            Get premium visibility, analytics, and features to attract more outdoor enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SPOTLIGHT_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-6 ${
                tier.highlighted
                  ? 'border-spotlight-gold bg-spotlight-gold/5 spotlight-glow relative'
                  : 'border-cairn-border bg-cairn-card'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-spotlight-gold px-3 py-1 text-xs font-bold text-cairn-bg">
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="text-center mb-6 pt-2">
                <h3 className="font-display text-xl font-bold text-slate-100">
                  {tier.name}
                </h3>
                <div className="mt-2">
                  <span className="font-display text-4xl font-bold text-slate-100">
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl border border-canopy/20 bg-gradient-to-br from-canopy/10 to-cairn-bg p-12 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
            Ready to Explore?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of outdoor enthusiasts discovering trails, businesses, and adventure partners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-xl bg-canopy px-8 py-3.5 text-base font-semibold text-white hover:bg-canopy-dark transition-all shadow-lg shadow-canopy/25"
            >
              <Map className="h-5 w-5" />
              Open the Map
            </Link>
            <Link
              href="/board"
              className="flex items-center gap-2 rounded-xl border border-cairn-border bg-cairn-card px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-cairn-card-hover transition-all"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
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
                <Link href="/explore?tab=trails" className="block text-sm text-slate-500 hover:text-slate-300">Trails</Link>
                <Link href="/board" className="block text-sm text-slate-500 hover:text-slate-300">Activity Board</Link>
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
              <h4 className="font-display text-sm font-semibold text-slate-300 mb-3">Connect</h4>
              <div className="space-y-2">
                <span className="block text-sm text-slate-500">hello@cairnconnect.app</span>
                <span className="block text-sm text-slate-500">Privacy Policy</span>
                <span className="block text-sm text-slate-500">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cairn-border text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Cairn Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
