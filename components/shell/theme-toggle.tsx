'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

const NO_SUBSCRIBE = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // next-themes resolves the stored preference during the first client render,
  // so `theme` differs from the server's `undefined` and the pressed state would
  // mismatch on hydration. useSyncExternalStore gives a mount flag that React
  // handles correctly across the hydration boundary — no effect, no warning.
  const mounted = React.useSyncExternalStore(
    NO_SUBSCRIBE,
    () => true,
    () => false,
  );

  return (
    <div
      className="no-print flex items-center rounded-md border border-border p-0.5"
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={active}
            title={option.label}
            className={cn(
              'rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground',
              active && 'bg-muted text-foreground',
            )}
          >
            <Icon className="size-3.5" />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
