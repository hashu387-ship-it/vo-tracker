'use client';

import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            'rounded-md border border-border bg-popover text-popover-foreground shadow-pop text-sm',
        }}
      />
    </ThemeProvider>
  );
}
