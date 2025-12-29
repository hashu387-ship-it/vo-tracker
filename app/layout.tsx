import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
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
  title: 'VO Tracker - Variation Orders Management',
  description: 'Track and manage Variation Orders for construction projects',
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
