import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { GuestModeProvider } from '@/components/providers/guest-mode-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PasswordDialog } from '@/components/ui/password-dialog';
import { LiquidBackground } from '@/components/ui/liquid-background';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'VO Tracker · Commercial Intelligence Command Center',
    template: '%s · VO Tracker',
  },
  description:
    'A next-generation commercial command center for the HW2 MEP project — AI-assisted variation order tracking, payment register analytics, forecasting, and live KPIs.',
  keywords: [
    'variation orders',
    'payment register',
    'commercial management',
    'construction',
    'quantity surveying',
    'RSG',
    'First Fix',
    'analytics dashboard',
  ],
  applicationName: 'VO Tracker',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VO Tracker' },
  openGraph: {
    title: 'VO Tracker · Commercial Intelligence',
    description: 'AI-assisted variation order & payment intelligence for HW2 MEP.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${dmSans.className} min-h-screen font-sans antialiased flex flex-col`}>
          <LiquidBackground />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <GuestModeProvider>
                <TooltipProvider>
                  <div className="flex-1 flex flex-col">
                    {children}
                  </div>
                  <Footer />
                  <Toaster />
                  <PasswordDialog />
                </TooltipProvider>
              </GuestModeProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
