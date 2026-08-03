import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Loading placeholder for a data surface.
 *
 * The style's checklist asks for loading states, and a shimmer that traces the
 * shape of the thing being loaded reads as "this is arriving" where a bare
 * spinner reads as "something is wrong". The sweep uses the `shimmer` keyframe
 * already defined in the Tailwind config.
 *
 * `overflow-hidden` + `isolate` keep the absolutely positioned sweep inside the
 * placeholder — the same containing-block rule that made `.data-scroll` need
 * `relative`.
 *
 * The sweep is purely decorative and is switched off entirely by the global
 * `prefers-reduced-motion` block, which leaves the muted block behind.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative isolate overflow-hidden rounded-md bg-muted', className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
    </div>
  );
}

/**
 * Span classes as literal strings. Tailwind purges unused rules from
 * `@layer components`, so these must never be assembled at runtime.
 */
const SPAN = {
  3: 'dash-col-3',
  4: 'dash-col-4',
  5: 'dash-col-5',
  6: 'dash-col-6',
  7: 'dash-col-7',
  8: 'dash-col-8',
  9: 'dash-col-9',
  12: 'dash-col-12',
} as const;

export type Span = keyof typeof SPAN;

/**
 * A skeleton laid out on the 12-column grid, so the placeholder occupies the
 * same tracks the real content will. Swapping a matching shape for the real one
 * avoids the layout jump a generic full-width block causes.
 */
export function SkeletonPage({
  tiles = 4,
  panels = [8, 4],
  label = 'Loading',
}: {
  tiles?: number;
  /** Column spans for the panel row, e.g. [8, 4]. */
  panels?: Span[];
  label?: string;
}) {
  return (
    <div className="space-y-[var(--grid-gap)]" aria-busy="true" aria-label={label}>
      <div className="mb-5 space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid gap-[var(--grid-gap)] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: tiles }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg" />
        ))}
      </div>

      <div className="dash-grid">
        {panels.map((span, index) => (
          <Skeleton key={index} className={cn(SPAN[span], 'h-80 rounded-lg')} />
        ))}
      </div>
    </div>
  );
}
