'use client';

import Link from 'next/link';
import {
  Sparkles,
  Shield,
  Check,
  ChevronDown,
  Star,
  Users,
  BarChart3,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Pricing tiers
// ---------------------------------------------------------------------------

const PRICING_TIERS = [
  {
    name: 'Founding',
    price: '$199',
    period: '/yr',
    badge: 'First 100 Businesses',
    highlighted: true,
    features: [
      'Gold Spotlight pin on the map',
      'Priority search ranking',
      'Monthly analytics dashboard',
      'Special offer banner on listing',
      'Founding rate locked in forever',
      'Early-adopter badge on profile',
      'Email support',
    ],
    cta: 'Claim Founding Spot',
  },
  {
    name: 'Standard',
    price: '$299',
    period: '/yr',
    badge: null,
    highlighted: false,
    features: [
      'Gold Spotlight pin on the map',
      'Priority search ranking',
      'Monthly analytics dashboard',
      'Special offer banner on listing',
      'Email support',
      'Quarterly performance reports',
    ],
    cta: 'Get Standard',
  },
  {
    name: 'Premium',
    price: '$499',
    period: '/yr',
    badge: 'Multi-location',
    highlighted: false,
    features: [
      'Everything in Standard',
      'Multi-location support (up to 5)',
      'Featured in region highlights',
      'Priority customer support',
      'Custom branding options',
      'Dedicated account manager',
      'API access for integrations',
    ],
    cta: 'Get Premium',
  },
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
  {
    question: 'What is Spotlight?',
    answer:
      'Spotlight is Cairn Connect\'s premium visibility tier for outdoor businesses. When you upgrade, your listing gets a gold pin on the map, appears higher in search results, and includes a monthly analytics dashboard so you can track views, clicks, and engagement. It\'s designed to help your business stand out to the thousands of outdoor enthusiasts using the platform.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. You can cancel your Spotlight subscription at any time. Your premium features will remain active until the end of your current billing period. There are no cancellation fees or long-term contracts.',
  },
  {
    question: 'What\'s included in the Founding tier?',
    answer:
      'The Founding tier is a limited offer for the first 100 businesses on Cairn Connect. You get all Standard features at a permanently locked rate of $199/year -- this price will never increase, even as we add more features. Founding members also receive an early-adopter badge on their profile.',
  },
  {
    question: 'Do I need to claim my listing first?',
    answer:
      'Yes. Before upgrading to Spotlight, you\'ll need to claim your free business listing on Cairn Connect. Claiming is free and gives you access to basic listing management. Once claimed, you can upgrade to Spotlight from your dashboard at any time.',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-spotlight-gold/10 border border-spotlight-gold/20 px-4 py-1.5 text-sm text-spotlight-gold mb-4">
            <Sparkles className="h-4 w-4" />
            Spotlight for Businesses
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-spotlight-gold mb-3">
            <Sparkles className="inline h-8 w-8 mr-2" />
            Get Spotlight
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Stand out on the map, rank higher in search, and track how outdoor
            enthusiasts engage with your business.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                tier.highlighted
                  ? 'border-spotlight-gold bg-spotlight-gold/5 spotlight-glow'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-spotlight-gold px-3 py-1 text-xs font-bold text-white whitespace-nowrap">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier header */}
              <div className="text-center mb-6 pt-3">
                <h3 className="font-display text-xl font-bold text-gray-900">
                  {tier.name}
                </h3>
                <div className="mt-2">
                  <span className="font-display text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-gray-400">{tier.period}</span>
                </div>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-500"
                  >
                    <Check className="h-4 w-4 text-canopy shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={tier.highlighted ? 'spotlight' : 'secondary'}
                size="lg"
                className="w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-base font-semibold text-gray-900">
                    {item.question}
                  </h3>
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
