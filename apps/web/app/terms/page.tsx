'use client';

import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const TOS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using Cairn Connect ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform. These terms apply to all users, including visitors, registered members, and business listing owners.',
  },
  {
    title: '2. Account Terms',
    content:
      'You must be at least 16 years of age to create an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information when creating your account and keep it up to date. Cairn Connect reserves the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: '3. Acceptable Use',
    content:
      'You agree not to misuse the Platform. This includes, but is not limited to: posting false or misleading trail conditions or safety information; harassing, threatening, or impersonating other users; uploading malicious code or attempting to gain unauthorized access to any part of the Platform; scraping or collecting user data without consent; using the Platform for any illegal activity; posting spam, unsolicited promotions, or commercial content outside of designated business listings.',
  },
  {
    title: '4. User Content',
    content:
      'You retain ownership of all content you create on the Platform, including GPS tracks, photos, reviews, and trail reports. By posting content, you grant Cairn Connect a non-exclusive, worldwide, royalty-free license to display, distribute, and promote your content within the Platform. You may delete your content at any time. You are solely responsible for the accuracy and legality of the content you post.',
  },
  {
    title: '5. Intellectual Property',
    content:
      'The Cairn Connect name, logo, and all related branding are the property of Cairn Connect. The Platform software, design, and original content are protected by copyright and other intellectual property laws. Trail data sourced from public agencies and OpenStreetMap contributors is subject to their respective licenses. You may not copy, modify, or distribute any part of the Platform without prior written permission.',
  },
  {
    title: '6. Disclaimer of Warranties',
    content:
      'The Platform is provided "as is" and "as available" without warranties of any kind, whether express or implied. Cairn Connect does not guarantee the accuracy of trail data, conditions reports, maps, or business listings. Outdoor activities carry inherent risks. You are solely responsible for your safety and for verifying trail conditions, weather, and other hazards before undertaking any activity.',
  },
  {
    title: '7. Limitation of Liability',
    content:
      'To the fullest extent permitted by law, Cairn Connect and its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, personal injury, or property damage, arising from your use of the Platform. Our total liability for any claim related to the Platform shall not exceed the amount you paid to Cairn Connect in the twelve months preceding the claim, or $100, whichever is greater.',
  },
  {
    title: '8. Termination',
    content:
      'You may delete your account at any time from your account settings. Upon deletion, your personal data will be removed in accordance with our Privacy Policy. Cairn Connect may suspend or terminate your access to the Platform at any time for violation of these terms, with or without notice. Provisions that by their nature should survive termination (including limitation of liability and intellectual property) will remain in effect.',
  },
  {
    title: '9. Changes to Terms',
    content:
      'Cairn Connect reserves the right to modify these Terms of Service at any time. We will notify users of material changes by posting a notice on the Platform or by email. Your continued use of the Platform after changes are posted constitutes acceptance of the updated terms. We encourage you to review these terms periodically.',
  },
  {
    title: '10. Governing Law',
    content:
      'These Terms of Service shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles. Any disputes arising from these terms or your use of the Platform shall be resolved through binding arbitration or in the courts of competent jurisdiction.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-7 w-7 text-canopy" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">
            Terms of Service
          </h1>
        </div>
        <p className="text-sm text-slate-400 mb-10">
          Last updated: March 2026
        </p>

        {/* Terms Sections */}
        <section className="mb-12">
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-6 space-y-6">
            {TOS_SECTIONS.map((section) => (
              <div key={section.title} className="border-b border-cairn-border/50 last:border-0 pb-5 last:pb-0">
                <h2 className="text-sm font-semibold text-slate-100 mb-2">
                  {section.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="rounded-2xl border border-canopy/20 bg-canopy/5 p-6 text-center">
            <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">
              Questions about these terms?
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Contact us at{' '}
              <a
                href="mailto:hello@cairnconnect.app"
                className="text-canopy hover:underline"
              >
                hello@cairnconnect.app
              </a>
            </p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-xl bg-canopy px-6 py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
