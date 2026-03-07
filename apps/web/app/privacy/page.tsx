'use client';

import Link from 'next/link';
import { Shield, Lock, Eye, FileText, Server, UserCheck, ArrowLeft, Globe } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your GPS tracks, personal information, and activity data are protected at every layer.',
  },
  {
    icon: Eye,
    title: 'Location Privacy Controls',
    description: 'You control who sees your location. GPS tracks can be made private, shared with trip partners only, or made public. Real-time location sharing requires explicit opt-in and can be stopped at any time.',
  },
  {
    icon: Server,
    title: 'Data Residency',
    description: 'User data is stored in SOC 2 Type II certified data centers. European users\' data stays in EU regions in compliance with GDPR. We do not transfer PII across borders without consent.',
  },
  {
    icon: UserCheck,
    title: 'Minimal Data Collection',
    description: 'We collect only what is necessary to provide our services. We do not sell personal data, location history, or activity patterns to advertisers or third parties.',
  },
];

const DATA_WE_COLLECT = [
  { data: 'Email & Display Name', purpose: 'Account identification and communication', retention: 'Until account deletion' },
  { data: 'GPS Tracks', purpose: 'Activity recording, trail matching', retention: 'User-controlled; deletable anytime' },
  { data: 'Profile Photo', purpose: 'Optional social identification', retention: 'Until removed or account deletion' },
  { data: 'Equipment List', purpose: 'Community sharing (public)', retention: 'Until removed' },
  { data: 'Device Information', purpose: 'App compatibility and crash reporting', retention: '90 days' },
  { data: 'Usage Analytics', purpose: 'Service improvement (anonymized)', retention: '12 months, anonymized' },
];

const GDPR_RIGHTS = [
  { right: 'Access', description: 'Download all your personal data at any time from Settings' },
  { right: 'Rectification', description: 'Update or correct your personal information' },
  { right: 'Erasure', description: 'Delete your account and all associated data' },
  { right: 'Portability', description: 'Export your data in standard formats (GPX, JSON)' },
  { right: 'Restriction', description: 'Limit how we process your data' },
  { right: 'Objection', description: 'Opt out of analytics and non-essential processing' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-7 w-7 text-canopy" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
            Privacy, Security & Licensing
          </h1>
        </div>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: March 2026
        </p>

        {/* Security Features */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6">
            How We Protect Your Data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECURITY_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="h-10 w-10 rounded-xl bg-canopy/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-canopy" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-gray-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Collection Table */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6">
            What We Collect & Why
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Retention
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_WE_COLLECT.map((row) => (
                    <tr key={row.data} className="border-b border-gray-100 last:border-0">
                      <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">
                        {row.data}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{row.purpose}</td>
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{row.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* User PII Rights */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-canopy" />
            Your Rights (GDPR / CCPA)
          </h2>
          <div className="space-y-3">
            {GDPR_RIGHTS.map((r) => (
              <div
                key={r.right}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4"
              >
                <span className="inline-flex items-center justify-center rounded-lg bg-canopy/10 px-3 py-1 text-xs font-bold text-canopy shrink-0 mt-0.5">
                  {r.right}
                </span>
                <p className="text-sm text-gray-500">{r.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Licensing */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-canopy" />
            Platform Licensing
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">User Content</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                You retain full ownership of all content you create — GPS tracks, photos, reviews,
                and trail reports. By posting content, you grant Cairn Connect a non-exclusive
                license to display it within the platform. You can delete your content at any time.
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Trail & Map Data</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Trail data is sourced from public land agencies, OpenStreetMap contributors (ODbL
                license), and community submissions. Map tiles use OpenTopoMap and Mapbox. Satellite
                imagery is subject to third-party licensing terms.
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Business Listings</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Business information is provided by listing owners. Cairn Connect does not guarantee
                accuracy of business hours, pricing, or availability. Spotlight listing agreements
                are governed by separate commercial terms.
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Open Source</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cairn Connect uses open-source libraries governed by their respective licenses (MIT,
                Apache 2.0, BSD). A full list of dependencies and their licenses is available in the
                application&apos;s package manifest.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="rounded-2xl border border-canopy/20 bg-canopy/5 p-6 text-center">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">
              Questions about your data?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Contact our Data Protection Officer at{' '}
              <span className="text-canopy">privacy@cairnconnect.app</span>
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-canopy px-6 py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
            >
              Manage My Data
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
