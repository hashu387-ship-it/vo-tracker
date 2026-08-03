import type { Metadata, Viewport } from 'next';
import { Fira_Code, Fira_Sans } from 'next/font/google';
import * as React from 'react';

import { Providers } from '@/app/providers';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import type { PaletteEntry } from '@/components/shell/command-palette';
import { getRegister } from '@/lib/db/queries';
import { formatDate } from '@/lib/domain/money';
import { PAYMENT_STATUS_META, VARIATION_STATUS_META } from '@/lib/domain/types';

import './globals.css';

/**
 * Fira Sans for the interface and Fira Code for figures — the pairing the
 * UI/UX design database recommends for dashboards and analytics. Both are
 * self-hosted by next/font at build time, so there is no render-blocking
 * request to a font CDN and no third-party origin to allow.
 *
 * Fira Code carries true tabular figures, which is what a register full of
 * right-aligned money columns actually needs.
 */
const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
});

export const metadata: Metadata = {
  title: {
    default: 'HW2C05 Commercial Register',
    template: '%s · HW2C05 Commercial Register',
  },
  description:
    'Variation order and payment register for R06-HW2C05, Shura West Hotel 02 MEP package — First Fix Contracting / Red Sea Global.',
};

/**
 * The register is a live, multi-user database. Rendering on demand keeps every
 * page truthful even when a change arrives over the API from another instance;
 * with ~120 rows the render cost is negligible.
 */
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1a22' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { project, variations, payments, asOf, issues } = await getRegister();

  const entries: PaletteEntry[] = [
    ...variations.map((variation) => ({
      id: variation.id,
      href: `/variations/${variation.id}`,
      title: `${variation.voNumber ?? `#${variation.serial}`} — ${variation.subject}`,
      subtitle: [
        variation.status ? VARIATION_STATUS_META[variation.status].label : 'No status',
        variation.vorRef,
        variation.submissionRef,
      ]
        .filter(Boolean)
        .join(' · '),
      group: 'Variation orders' as const,
      keywords: [
        variation.voNumber,
        variation.subject,
        variation.vorRef,
        variation.dvoRef,
        variation.dvoReference,
        variation.submissionRef,
        variation.responseRef,
        variation.owner,
        variation.status ? VARIATION_STATUS_META[variation.status].label : '',
      ]
        .filter(Boolean)
        .join(' '),
      value: variation.agreedValue ?? variation.proposalValue,
    })),
    ...payments.map((payment) => ({
      id: payment.id,
      href: `/payments/${payment.id}`,
      title: `${payment.ref}${payment.period ? ` — ${payment.period}` : ''}`,
      subtitle: PAYMENT_STATUS_META[payment.status].label,
      group: 'Payment certificates' as const,
      keywords: [payment.ref, payment.period, PAYMENT_STATUS_META[payment.status].label]
        .filter(Boolean)
        .join(' '),
      value: payment.netCertified,
    })),
  ];

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${firaSans.variable} ${firaCode.variable}`}
    >
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <div className="flex min-h-dvh">
            <Sidebar contractor={project.contractor} asOf={formatDate(asOf)} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar
                entries={entries}
                contractor={project.contractor}
                asOf={formatDate(asOf)}
                issueCount={issues.length}
              />
              <main id="main" className="flex-1 px-4 py-5 lg:px-6 lg:py-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
